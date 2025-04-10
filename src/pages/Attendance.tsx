
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Search, Edit, Trash2, FilePenLine, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { AttendanceStatus, AttendanceRecord, Employee } from "@/lib/types";
import { 
  getEmployees, 
  getAttendanceByDate, 
  saveAttendanceRecord, 
  deleteAttendanceRecord,
  getSettings 
} from "@/lib/store";
import { toast } from "sonner";

const statusOptions: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: "present", label: "Present", color: "bg-green-500" },
  { value: "absent", label: "Absent", color: "bg-red-500" },
  { value: "late", label: "Late", color: "bg-amber-500" },
  { value: "wfh", label: "Work From Home", color: "bg-purple-500" },
  { value: "leave", label: "On Leave", color: "bg-gray-500" },
];

const Attendance = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [formattedDate, setFormattedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  // Load data on component mount and when date changes
  useEffect(() => {
    loadEmployees();
    const newFormattedDate = format(date, "yyyy-MM-dd");
    setFormattedDate(newFormattedDate);
    loadAttendance(newFormattedDate);
  }, [date]);
  
  const loadEmployees = () => {
    const allEmployees = getEmployees().filter(emp => emp.active);
    setEmployees(allEmployees);
  };
  
  const loadAttendance = (date: string) => {
    const dailyAttendance = getAttendanceByDate(date);
    setAttendanceRecords(dailyAttendance.records || {});
  };
  
  const markAttendance = (employee: Employee) => {
    // Get current time
    const now = new Date();
    const currentTime = format(now, "HH:mm");
    
    // Check if record exists
    const existingRecord = attendanceRecords[employee.id];
    
    if (existingRecord) {
      // Edit existing record
      setCurrentRecord(existingRecord);
      setSelectedEmployee(employee);
      setIsEditing(true);
    } else {
      // Create new record with default values
      const workingHours = getSettings().workingHours;
      const isLate = currentTime > workingHours.start;
      
      setCurrentRecord({
        id: uuidv4(),
        employeeId: employee.id,
        date: formattedDate,
        status: isLate ? "late" : "present",
        timeIn: currentTime,
        timeOut: "",
        notes: "",
        lastModified: now.toISOString(),
      });
      
      setSelectedEmployee(employee);
      setIsEditing(false);
    }
    
    setDialogOpen(true);
  };
  
  const handleSaveAttendance = () => {
    if (!currentRecord || !selectedEmployee) return;
    
    // Set last modified timestamp
    currentRecord.lastModified = new Date().toISOString();
    
    // Save record
    saveAttendanceRecord(currentRecord);
    
    // Reload attendance data
    loadAttendance(formattedDate);
    
    // Close dialog
    setDialogOpen(false);
  };
  
  const handleDeleteAttendance = () => {
    if (!currentRecord || !selectedEmployee) return;
    
    // Delete record
    deleteAttendanceRecord(currentRecord.date, currentRecord.employeeId);
    
    // Reload attendance data
    loadAttendance(formattedDate);
    
    // Close dialog
    setDialogOpen(false);
  };
  
  // Filter employees based on search term
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = !searchTerm || 
                        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If status filter is active, check if employee has that status
    if (statusFilter) {
      const record = attendanceRecords[emp.id];
      return matchesSearch && record && record.status === statusFilter;
    }
    
    return matchesSearch;
  });
  
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Daily Attendance</h1>
        <p className="text-muted-foreground">
          Mark and manage attendance records.
        </p>
      </div>
      
      <div className="flex flex-col gap-4 md:flex-row justify-between">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "MMMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="w-[200px] pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center">
                    <div className={`mr-2 h-2 w-2 rounded-full ${status.color}`} />
                    {status.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-xl">Attendance Sheet - {format(date, "MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">Employee</th>
                    <th className="py-3 px-4 text-left font-medium">Department</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Time In</th>
                    <th className="py-3 px-4 text-left font-medium">Time Out</th>
                    <th className="py-3 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => {
                      const record = attendanceRecords[employee.id];
                      const status = record?.status || "";
                      const statusInfo = statusOptions.find((opt) => opt.value === status);
                      
                      return (
                        <tr key={employee.id} className="border-b">
                          <td className="py-3 px-4 text-left">
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-xs text-muted-foreground">{employee.position}</div>
                          </td>
                          <td className="py-3 px-4 text-left">{employee.department}</td>
                          <td className="py-3 px-4 text-left">
                            {record ? (
                              <div className="flex items-center">
                                <div 
                                  className={`mr-2 h-2 w-2 rounded-full ${statusInfo?.color || ""}`} 
                                />
                                <span className={`status-${status}`}>
                                  {statusInfo?.label || ""}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Not marked</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-left">{record?.timeIn || "—"}</td>
                          <td className="py-3 px-4 text-left">{record?.timeOut || "—"}</td>
                          <td className="py-3 px-4 text-right">
                            {record ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => markAttendance(employee)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => markAttendance(employee)}
                              >
                                <FilePenLine className="h-4 w-4" />
                                <span className="sr-only">Mark</span>
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">
                        {employees.length === 0
                          ? "No active employees found. Add employees first."
                          : "No employees match your search criteria."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Dialog */}
      {selectedEmployee && currentRecord && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Attendance" : "Mark Attendance"}
              </DialogTitle>
              <DialogDescription>
                {selectedEmployee.name} - {format(date, "MMMM d, yyyy")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Attendance Status</Label>
                <Select 
                  value={currentRecord.status} 
                  onValueChange={(value: AttendanceStatus) => 
                    setCurrentRecord({...currentRecord, status: value})
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center">
                          <div className={`mr-2 h-2 w-2 rounded-full ${status.color}`} />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="timeIn">Time In</Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="timeIn"
                      type="time"
                      value={currentRecord.timeIn || ""}
                      onChange={(e) => 
                        setCurrentRecord({...currentRecord, timeIn: e.target.value})
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timeOut">Time Out</Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="timeOut"
                      type="time"
                      value={currentRecord.timeOut || ""}
                      onChange={(e) => 
                        setCurrentRecord({...currentRecord, timeOut: e.target.value})
                      }
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={currentRecord.notes || ""}
                  onChange={(e) => 
                    setCurrentRecord({...currentRecord, notes: e.target.value})
                  }
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <div>
                {isEditing && (
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAttendance}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveAttendance}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Attendance;
