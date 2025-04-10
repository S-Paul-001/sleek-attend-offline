
// Employee Types
export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  joinDate: string;
  contact: string;
  email: string;
  active: boolean;
}

// Attendance Types
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'wfh' | 'leave';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  timeIn?: string;
  timeOut?: string;
  notes?: string;
  lastModified: string;
}

export interface DailyAttendance {
  date: string;
  records: Record<string, AttendanceRecord>;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  wfh: number;
  leave: number;
  total: number;
}

// Dashboard Types
export interface DepartmentSummary {
  name: string;
  present: number;
  absent: number;
  late: number;
  wfh: number;
  leave: number;
  total: number;
}

// Settings Type
export interface AppSettings {
  companyName: string;
  companyLogo?: string;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: number[];
  notificationsEnabled: boolean;
  notificationTime?: string;
  defaultView: 'daily' | 'employee';
  departments: string[];
  positions: string[];
}

// Export Types
export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json';
  dateRange: {
    start: string;
    end: string;
  };
  includeEmployees: string[] | 'all';
  includeDepartments: string[] | 'all';
  groupBy: 'employee' | 'date' | 'department';
}
