
import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, subDays, startOfWeek, endOfWeek, subWeeks, subMonths } from "date-fns";
import { 
  Users,
  UserCheck,
  UserX,
  Clock,
  Home as HomeIcon,
  CalendarClock,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getEmployees, 
  getAttendanceSummary, 
  getDepartmentSummary,
  getAttendanceByDateRange
} from "@/lib/store";
import { AttendanceSummary, DepartmentSummary } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

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
  const [statisticsView, setStatisticsView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  
  // Load data when component mounts
  useEffect(() => {
    const allEmployees = getEmployees();
    setEmployees(allEmployees.length);
    setActiveEmployees(allEmployees.filter(emp => emp.active).length);
    
    // Get today's attendance summary
    setTodaySummary(getAttendanceSummary(today));
    
    // Get department summary
    setDepartmentSummaries(getDepartmentSummary(today));
    
    // Generate weekly data (last 7 days)
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const summary = getAttendanceSummary(dateStr);
      weekData.push({
        date: format(date, "EEE"),
        present: summary.present,
        absent: summary.absent,
        late: summary.late,
        wfh: summary.wfh,
        leave: summary.leave,
      });
    }
    setWeeklyData(weekData);
    
    // Generate monthly data (last 30 days aggregated by week)
    const monthData = [];
    for (let i = 3; i >= 0; i--) {
      const weekEnd = subWeeks(new Date(), i);
      const weekStart = startOfWeek(weekEnd);
      const dateRange = getAttendanceByDateRange(
        format(weekStart, "yyyy-MM-dd"),
        format(weekEnd, "yyyy-MM-dd")
      );
      
      let weekSummary = { present: 0, absent: 0, late: 0, wfh: 0, leave: 0 };
      dateRange.forEach(day => {
        Object.values(day.records).forEach(record => {
          weekSummary[record.status]++;
        });
      });
      
      monthData.push({
        week: `Week ${4-i}`,
        present: weekSummary.present,
        absent: weekSummary.absent,
        late: weekSummary.late,
        wfh: weekSummary.wfh,
        leave: weekSummary.leave,
      });
    }
    setMonthlyData(monthData);
    
    // Generate trend data (last 6 months)
    const trendingData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStartDate = startOfMonth(monthDate);
      const monthEndDate = endOfMonth(monthDate);
      const dateRange = getAttendanceByDateRange(
        format(monthStartDate, "yyyy-MM-dd"),
        format(monthEndDate, "yyyy-MM-dd")
      );
      
      let monthSummary = { present: 0, absent: 0, late: 0, wfh: 0, leave: 0, total: 0 };
      dateRange.forEach(day => {
        Object.values(day.records).forEach(record => {
          monthSummary[record.status]++;
          monthSummary.total++;
        });
      });
      
      trendingData.push({
        month: format(monthDate, "MMM"),
        attendanceRate: monthSummary.total > 0 
          ? Math.round((monthSummary.present + monthSummary.wfh) / monthSummary.total * 100) 
          : 0,
        lateRate: monthSummary.total > 0 
          ? Math.round(monthSummary.late / monthSummary.total * 100) 
          : 0,
      });
    }
    setTrendData(trendingData);
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
      
      <Card>
        <CardHeader>
          <CardTitle>Attendance Statistics</CardTitle>
          <Tabs value={statisticsView} onValueChange={(value) => setStatisticsView(value as "daily" | "weekly" | "monthly")}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="daily" className="h-[300px]">
            <div className="flex items-center justify-center h-full">
              <div className="grid grid-cols-5 gap-6 w-full">
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-green-500">
                    {todaySummary.present}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Present</p>
                  <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${todaySummary.total > 0 ? (todaySummary.present / activeEmployees) * 100 : 0}%` }} 
                    />
                  </div>
                  <p className="text-xs mt-1">
                    {todaySummary.total > 0 ? Math.round((todaySummary.present / activeEmployees) * 100) : 0}%
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-red-500">
                    {activeEmployees - (todaySummary.present + todaySummary.late + todaySummary.wfh + todaySummary.leave)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Absent</p>
                  <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500" 
                      style={{ width: `${todaySummary.total > 0 ? ((activeEmployees - (todaySummary.present + todaySummary.late + todaySummary.wfh + todaySummary.leave)) / activeEmployees) * 100 : 0}%` }} 
                    />
                  </div>
                  <p className="text-xs mt-1">
                    {todaySummary.total > 0 ? Math.round(((activeEmployees - (todaySummary.present + todaySummary.late + todaySummary.wfh + todaySummary.leave)) / activeEmployees) * 100) : 0}%
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-amber-500">
                    {todaySummary.late}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Late</p>
                  <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500" 
                      style={{ width: `${todaySummary.total > 0 ? (todaySummary.late / activeEmployees) * 100 : 0}%` }} 
                    />
                  </div>
                  <p className="text-xs mt-1">
                    {todaySummary.total > 0 ? Math.round((todaySummary.late / activeEmployees) * 100) : 0}%
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-purple-500">
                    {todaySummary.wfh}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">WFH</p>
                  <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500" 
                      style={{ width: `${todaySummary.total > 0 ? (todaySummary.wfh / activeEmployees) * 100 : 0}%` }} 
                    />
                  </div>
                  <p className="text-xs mt-1">
                    {todaySummary.total > 0 ? Math.round((todaySummary.wfh / activeEmployees) * 100) : 0}%
                  </p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-gray-500">
                    {todaySummary.leave}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Leave</p>
                  <div className="w-full h-2 bg-muted mt-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-500" 
                      style={{ width: `${todaySummary.total > 0 ? (todaySummary.leave / activeEmployees) * 100 : 0}%` }} 
                    />
                  </div>
                  <p className="text-xs mt-1">
                    {todaySummary.total > 0 ? Math.round((todaySummary.leave / activeEmployees) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="weekly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#22c55e" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                <Bar dataKey="late" fill="#f59e0b" name="Late" />
                <Bar dataKey="wfh" fill="#a855f7" name="WFH" />
                <Bar dataKey="leave" fill="#6b7280" name="Leave" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="monthly" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="attendanceRate" name="Attendance Rate (%)" stroke="#22c55e" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="lateRate" name="Late Rate (%)" stroke="#f59e0b" />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </CardContent>
      </Card>
      
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
              <TrendingUp className="mr-2 h-4 w-4" />
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
