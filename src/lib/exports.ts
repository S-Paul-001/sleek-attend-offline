
import { ExportOptions, Employee, AttendanceRecord, DailyAttendance } from "./types";
import { getEmployees, getAttendanceByDateRange } from "./store";

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Helper to generate CSV content
const generateCSV = (headers: string[], rows: string[][]): string => {
  const headerRow = headers.join(',');
  const dataRows = rows.map(row => row.join(',')).join('\n');
  return `${headerRow}\n${dataRows}`;
};

// Process attendance data for export
const processAttendance = (
  dateRange: { start: string; end: string },
  includeEmployees: string[] | 'all',
  includeDepartments: string[] | 'all'
): { employees: Employee[], attendance: AttendanceRecord[] } => {
  // Get all employees
  const allEmployees = getEmployees();
  
  // Filter employees based on criteria
  const employees = allEmployees.filter(emp => {
    const employeeMatch = includeEmployees === 'all' || includeEmployees.includes(emp.id);
    const departmentMatch = includeDepartments === 'all' || 
                          (Array.isArray(includeDepartments) && includeDepartments.includes(emp.department));
    return employeeMatch && departmentMatch;
  });
  
  // Get attendance records for the date range
  const dailyAttendance = getAttendanceByDateRange(dateRange.start, dateRange.end);
  
  // Extract individual records and filter by employee
  const employeeIds = employees.map(emp => emp.id);
  const attendance: AttendanceRecord[] = [];
  
  dailyAttendance.forEach(daily => {
    Object.values(daily.records).forEach(record => {
      if (employeeIds.includes(record.employeeId)) {
        attendance.push(record);
      }
    });
  });
  
  return { employees, attendance };
};

// Export data as CSV
export const exportToCSV = (options: ExportOptions): string => {
  const { dateRange, includeEmployees, includeDepartments, groupBy } = options;
  const { employees, attendance } = processAttendance(dateRange, includeEmployees, includeDepartments);
  
  // Employee lookup map for quick access
  const employeeMap = new Map<string, Employee>();
  employees.forEach(emp => employeeMap.set(emp.id, emp));
  
  let headers: string[];
  let rows: string[][];
  
  if (groupBy === 'employee') {
    // Group by employee
    headers = ['Employee ID', 'Name', 'Department', 'Date', 'Status', 'Time In', 'Time Out', 'Notes'];
    
    rows = attendance.map(record => {
      const employee = employeeMap.get(record.employeeId);
      return [
        record.employeeId,
        employee?.name || 'Unknown',
        employee?.department || 'Unknown',
        formatDate(record.date),
        record.status,
        record.timeIn || '',
        record.timeOut || '',
        record.notes || ''
      ];
    });
  } else if (groupBy === 'department') {
    // Group by department
    headers = ['Department', 'Employee ID', 'Name', 'Date', 'Status', 'Time In', 'Time Out'];
    
    rows = attendance.map(record => {
      const employee = employeeMap.get(record.employeeId);
      return [
        employee?.department || 'Unknown',
        record.employeeId,
        employee?.name || 'Unknown',
        formatDate(record.date),
        record.status,
        record.timeIn || '',
        record.timeOut || ''
      ];
    });
  } else {
    // Group by date
    headers = ['Date', 'Employee ID', 'Name', 'Department', 'Status', 'Time In', 'Time Out'];
    
    rows = attendance.map(record => {
      const employee = employeeMap.get(record.employeeId);
      return [
        formatDate(record.date),
        record.employeeId,
        employee?.name || 'Unknown',
        employee?.department || 'Unknown',
        record.status,
        record.timeIn || '',
        record.timeOut || ''
      ];
    });
  }
  
  return generateCSV(headers, rows);
};

// Export data as JSON
export const exportToJSON = (options: ExportOptions): string => {
  const { dateRange, includeEmployees, includeDepartments } = options;
  const { employees, attendance } = processAttendance(dateRange, includeEmployees, includeDepartments);
  
  // Create a structured export
  const exportData = {
    exportDate: new Date().toISOString(),
    dateRange,
    employees,
    attendance
  };
  
  return JSON.stringify(exportData, null, 2);
};

// Download helpers
export const downloadCSV = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

export const downloadJSON = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'application/json' });
  downloadBlob(blob, filename);
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
