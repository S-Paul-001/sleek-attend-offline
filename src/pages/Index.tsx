
import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import { 
  Users,
  UserCheck,
  UserX,
  Clock,
  Home as HomeIcon,
  CalendarClock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getEmployees, 
  getAttendanceSummary, 
  getDepartmentSummary
} from "@/lib/store";
import { AttendanceSummary, DepartmentSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<number>(0);
  const [activeEmployees, setActiveEmployees] = useState<number>(0);
  const [today] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [todaySummary, setTodaySummary] = useState<AttendanceSummary>({
    present: 0,
    absent: 0,
    late: 0,
    wfh: 0,
    leave: 0,
    total: 0
  });
  const [departmentSummaries, setDepartmentSummaries] = useState<DepartmentSummary[]>([]);
  
  // Load data when component mounts
  useEffect(() => {
    const allEmployees = getEmployees();
    setEmployees(allEmployees.length);
    setActiveEmployees(allEmployees.filter(emp => emp.active).length);
    
    // Get today's attendance summary
    setTodaySummary(getAttendanceSummary(today));
    
    // Get department summary
    setDepartmentSummaries(getDepartmentSummary(today));
  }, [today]);
  
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Today is {format(new Date(), "MMMM d, yyyy")}
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Employees</p>
                <h3 className="text-2xl font-bold">{employees}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <UserCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Present Today</p>
                <h3 className="text-2xl font-bold">{todaySummary.present}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-500/10 p-3">
                <UserX className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Absent Today</p>
                <h3 className="text-2xl font-bold">
                  {activeEmployees - (todaySummary.present + todaySummary.late + todaySummary.wfh + todaySummary.leave)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-500/10 p-3">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Late Today</p>
                <h3 className="text-2xl font-bold">{todaySummary.late}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Attendance</CardTitle>
            <CardDescription>Today's attendance by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentSummaries.map((dept) => (
                <div key={dept.name} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{dept.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {dept.present} of {dept.total} present
                    </p>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${dept.total > 0 ? (dept.present / dept.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              
              {departmentSummaries.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No department data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/attendance')}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Mark Today's Attendance
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/employees')}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Employees
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/calendar')}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              View Calendar
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/reports')}
            >
              <HomeIcon className="mr-2 h-4 w-4" />
              Generate Reports
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Status</CardTitle>
            <CardDescription>Attendance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="text-xl font-bold text-green-500">
                  {todaySummary.present}
                </div>
                <p className="text-[0.70rem] uppercase text-muted-foreground">
                  Present
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="text-xl font-bold text-red-500">
                  {activeEmployees - (todaySummary.present + todaySummary.late + todaySummary.wfh + todaySummary.leave)}
                </div>
                <p className="text-[0.70rem] uppercase text-muted-foreground">
                  Absent
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="text-xl font-bold text-amber-500">
                  {todaySummary.late}
                </div>
                <p className="text-[0.70rem] uppercase text-muted-foreground">
                  Late
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="text-xl font-bold text-purple-500">
                  {todaySummary.wfh}
                </div>
                <p className="text-[0.70rem] uppercase text-muted-foreground">
                  WFH
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="text-xl font-bold text-gray-500">
                  {todaySummary.leave}
                </div>
                <p className="text-[0.70rem] uppercase text-muted-foreground">
                  Leave
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>App information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <p>Storage Status</p>
                <p className="text-green-500 font-medium">Local Storage</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Data Source</p>
                <p className="text-muted-foreground">Browser Storage</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Last Updated</p>
                <p className="text-muted-foreground">{format(new Date(), "MMMM d, yyyy h:mm a")}</p>
              </div>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                  onClick={() => navigate("/settings")}
                >
                  App Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
