
import { toast } from "sonner";
import {
  Employee,
  AttendanceRecord,
  DailyAttendance,
  AppSettings,
  AttendanceSummary,
  DepartmentSummary
} from "./types";

// Storage keys
const KEYS = {
  EMPLOYEES: 'attendance-app-employees',
  ATTENDANCE: 'attendance-app-attendance',
  SETTINGS: 'attendance-app-settings'
};

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'My Company',
  workingHours: {
    start: '09:00',
    end: '17:00'
  },
  workingDays: [1, 2, 3, 4, 5], // Monday to Friday
  notificationsEnabled: false,
  defaultView: 'daily',
  departments: ['Management', 'HR', 'Finance', 'IT', 'Operations', 'Sales', 'Marketing'],
  positions: ['Manager', 'Team Lead', 'Senior', 'Junior', 'Intern'],
};

// Helper functions
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error);
    toast.error(`Failed to save data to local storage. Your device might be low on storage.`);
  }
};

// Employee methods
export const getEmployees = (): Employee[] => {
  return getItem<Employee[]>(KEYS.EMPLOYEES, []);
};

export const getEmployee = (id: string): Employee | undefined => {
  const employees = getEmployees();
  return employees.find(emp => emp.id === id);
};

export const saveEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  const existingIndex = employees.findIndex(emp => emp.id === employee.id);
  
  if (existingIndex >= 0) {
    // Update existing employee
    employees[existingIndex] = employee;
    setItem(KEYS.EMPLOYEES, employees);
    toast.success(`Employee ${employee.name} updated successfully`);
  } else {
    // Add new employee
    setItem(KEYS.EMPLOYEES, [...employees, employee]);
    toast.success(`Employee ${employee.name} added successfully`);
  }
};

export const deleteEmployee = (id: string): void => {
  const employees = getEmployees();
  const filtered = employees.filter(emp => emp.id !== id);
  setItem(KEYS.EMPLOYEES, filtered);
  toast.success('Employee deleted successfully');
};

// Attendance methods
export const getAttendanceByDate = (date: string): DailyAttendance => {
  const attendanceData = getItem<Record<string, DailyAttendance>>(KEYS.ATTENDANCE, {});
  return attendanceData[date] || { date, records: {} };
};

export const getAttendanceByEmployee = (employeeId: string): AttendanceRecord[] => {
  const attendanceData = getItem<Record<string, DailyAttendance>>(KEYS.ATTENDANCE, {});
  const records: AttendanceRecord[] = [];
  
  Object.values(attendanceData).forEach(daily => {
    Object.values(daily.records).forEach(record => {
      if (record.employeeId === employeeId) {
        records.push(record);
      }
    });
  });
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getAttendanceByDateRange = (start: string, end: string): DailyAttendance[] => {
  const attendanceData = getItem<Record<string, DailyAttendance>>(KEYS.ATTENDANCE, {});
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  return Object.values(attendanceData)
    .filter(daily => {
      const date = new Date(daily.date);
      return date >= startDate && date <= endDate;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const saveAttendanceRecord = (record: AttendanceRecord): void => {
  const attendanceData = getItem<Record<string, DailyAttendance>>(KEYS.ATTENDANCE, {});
  
  if (!attendanceData[record.date]) {
    attendanceData[record.date] = {
      date: record.date,
      records: {}
    };
  }
  
  attendanceData[record.date].records[record.employeeId] = record;
  setItem(KEYS.ATTENDANCE, attendanceData);
  toast.success('Attendance saved successfully');
};

export const deleteAttendanceRecord = (date: string, employeeId: string): void => {
  const attendanceData = getItem<Record<string, DailyAttendance>>(KEYS.ATTENDANCE, {});
  
  if (attendanceData[date] && attendanceData[date].records[employeeId]) {
    delete attendanceData[date].records[employeeId];
    
    // Remove empty date entries
    if (Object.keys(attendanceData[date].records).length === 0) {
      delete attendanceData[date];
    }
    
    setItem(KEYS.ATTENDANCE, attendanceData);
    toast.success('Attendance record deleted');
  }
};

// Settings methods
export const getSettings = (): AppSettings => {
  return getItem<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
};

export const saveSettings = (settings: AppSettings): void => {
  setItem(KEYS.SETTINGS, settings);
  toast.success('Settings saved successfully');
};

// Summary and statistics methods
export const getAttendanceSummary = (date: string): AttendanceSummary => {
  const dailyAttendance = getAttendanceByDate(date);
  const records = Object.values(dailyAttendance.records);
  
  return records.reduce(
    (summary, record) => {
      summary[record.status]++;
      summary.total++;
      return summary;
    },
    { present: 0, absent: 0, late: 0, wfh: 0, leave: 0, total: 0 } as AttendanceSummary
  );
};

export const getDepartmentSummary = (date: string): DepartmentSummary[] => {
  const employees = getEmployees();
  const dailyAttendance = getAttendanceByDate(date);
  const departments = getSettings().departments;
  
  // Initialize department summaries
  const summaries = departments.map(dept => ({
    name: dept,
    present: 0,
    absent: 0,
    late: 0,
    wfh: 0,
    leave: 0,
    total: 0
  }));
  
  // Process each employee's attendance
  employees.forEach(employee => {
    if (!employee.active) return;
    
    const deptIndex = summaries.findIndex(s => s.name === employee.department);
    if (deptIndex === -1) return;
    
    const record = dailyAttendance.records[employee.id];
    summaries[deptIndex].total++;
    
    if (record) {
      summaries[deptIndex][record.status]++;
    } else {
      // No record means absent by default
      summaries[deptIndex].absent++;
    }
  });
  
  return summaries;
};

// Data export and import
export const exportAppData = (): string => {
  const data = {
    employees: getEmployees(),
    attendance: getItem<Record<string, DailyAttendance>>(KEYS.ATTENDANCE, {}),
    settings: getSettings()
  };
  
  return JSON.stringify(data);
};

export const importAppData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    // Validate data structure
    if (!data.employees || !data.attendance || !data.settings) {
      throw new Error('Invalid data structure');
    }
    
    // Import the data
    setItem(KEYS.EMPLOYEES, data.employees);
    setItem(KEYS.ATTENDANCE, data.attendance);
    setItem(KEYS.SETTINGS, data.settings);
    
    toast.success('Data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    toast.error('Failed to import data. The file might be corrupted or invalid.');
    return false;
  }
};
