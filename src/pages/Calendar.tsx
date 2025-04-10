
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addWeeks, subWeeks, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceStatus, AttendanceSummary } from "@/lib/types";
import { getAttendanceByDate, getAttendanceSummary } from "@/lib/store";
import { useNavigate } from "react-router-dom";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  summary: AttendanceSummary;
}

const statusColors: Record<AttendanceStatus, string> = {
  present: "bg-green-500",
  absent: "bg-red-500",
  late: "bg-amber-500",
  wfh: "bg-purple-500",
  leave: "bg-gray-500"
};

const Calendar = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth, viewMode, currentWeek]);
  
  const fetchCalendarData = async () => {
    setIsLoading(true);
    
    let days: CalendarDay[] = [];
    const today = new Date();
    
    if (viewMode === "monthly") {
      // Get the range of days in the current month view
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      // Process each day
      for (const day of daysInMonth) {
        const dateStr = format(day, "yyyy-MM-dd");
        const summary = getAttendanceSummary(dateStr);
        
        days.push({
          date: day,
          isCurrentMonth: true,
          isToday: isSameDay(day, today),
          summary
        });
      }
    } else if (viewMode === "weekly") {
      // Get the range of days in the current week
      const weekStart = new Date(currentWeek);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start from Sunday
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End on Saturday
      
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      // Process each day
      for (const day of daysInWeek) {
        const dateStr = format(day, "yyyy-MM-dd");
        const summary = getAttendanceSummary(dateStr);
        
        days.push({
          date: day,
          isCurrentMonth: isSameMonth(day, currentMonth),
          isToday: isSameDay(day, today),
          summary
        });
      }
    } else if (viewMode === "daily") {
      const dateStr = format(currentWeek, "yyyy-MM-dd");
      const summary = getAttendanceSummary(dateStr);
      
      days.push({
        date: currentWeek,
        isCurrentMonth: isSameMonth(currentWeek, currentMonth),
        isToday: isSameDay(currentWeek, today),
        summary
      });
    }
    
    setCalendarDays(days);
    setIsLoading(false);
  };
  
  const goToPrevious = () => {
    if (viewMode === "monthly") {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else if (viewMode === "weekly") {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      const newDate = new Date(currentWeek);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentWeek(newDate);
    }
  };
  
  const goToNext = () => {
    if (viewMode === "monthly") {
      setCurrentMonth(addMonths(currentMonth, 1));
    } else if (viewMode === "weekly") {
      setCurrentWeek(addWeeks(currentWeek, 1));
    } else {
      const newDate = new Date(currentWeek);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentWeek(newDate);
    }
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setCurrentWeek(today);
  };
  
  const handleDayClick = (day: CalendarDay) => {
    // Format the date for the attendance page URL
    const dateParam = format(day.date, "yyyy-MM-dd");
    navigate(`/attendance?date=${dateParam}`);
  };

  const getViewTitle = () => {
    if (viewMode === "monthly") {
      return format(currentMonth, "MMMM yyyy");
    } else if (viewMode === "weekly") {
      const weekStart = new Date(currentWeek);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    } else {
      return format(currentWeek, "MMMM d, yyyy");
    }
  };
  
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Calendar</h1>
        <p className="text-muted-foreground">
          View attendance patterns across time.
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-medium">
              {getViewTitle()}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "daily" | "weekly" | "monthly")} className="mt-4">
            <TabsList className="grid w-full max-w-xs grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          {viewMode === "monthly" && (
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="py-2 text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              
              {/* Empty spaces for days before start of month */}
              {calendarDays.length > 0 &&
                Array.from({ length: calendarDays[0].date.getDay() }).map((_, index) => (
                  <div key={`empty-start-${index}`} className="aspect-square p-1" />
                ))}
              
              {/* Calendar days */}
              {calendarDays.map((day) => {
                const hasRecords = day.summary.total > 0;
                
                return (
                  <div
                    key={day.date.toISOString()}
                    className={cn(
                      "aspect-square p-1",
                      day.isToday && "bg-muted/50 rounded-md"
                    )}
                  >
                    <button
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "h-full w-full rounded-md p-2 hover:bg-muted flex flex-col",
                        day.isToday && "bg-primary/10"
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-medium",
                          day.isToday && "text-primary"
                        )}
                      >
                        {format(day.date, "d")}
                      </span>
                      
                      {hasRecords && (
                        <div className="mt-auto flex justify-center gap-0.5">
                          {day.summary.present > 0 && (
                            <span className={cn("h-1 w-1 rounded-full", statusColors.present)} />
                          )}
                          {day.summary.absent > 0 && (
                            <span className={cn("h-1 w-1 rounded-full", statusColors.absent)} />
                          )}
                          {day.summary.late > 0 && (
                            <span className={cn("h-1 w-1 rounded-full", statusColors.late)} />
                          )}
                          {day.summary.wfh > 0 && (
                            <span className={cn("h-1 w-1 rounded-full", statusColors.wfh)} />
                          )}
                          {day.summary.leave > 0 && (
                            <span className={cn("h-1 w-1 rounded-full", statusColors.leave)} />
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          
          {viewMode === "weekly" && (
            <div className="grid grid-cols-7 gap-2 text-center">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="py-2 text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((day) => {
                const hasRecords = day.summary.total > 0;
                
                return (
                  <div
                    key={day.date.toISOString()}
                    className={cn(
                      "p-1",
                      day.isToday && "bg-muted/50 rounded-md"
                    )}
                  >
                    <button
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "h-full w-full rounded-md p-4 hover:bg-muted flex flex-col items-center",
                        day.isToday && "bg-primary/10"
                      )}
                    >
                      <span
                        className={cn(
                          "text-lg font-medium",
                          day.isToday && "text-primary"
                        )}
                      >
                        {format(day.date, "d")}
                      </span>
                      
                      {hasRecords && (
                        <div className="mt-2 grid grid-cols-5 gap-1">
                          <div className="flex flex-col items-center">
                            <span className={cn("h-2 w-2 rounded-full", statusColors.present)} />
                            <span className="text-xs mt-1">{day.summary.present}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={cn("h-2 w-2 rounded-full", statusColors.absent)} />
                            <span className="text-xs mt-1">{day.summary.absent}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={cn("h-2 w-2 rounded-full", statusColors.late)} />
                            <span className="text-xs mt-1">{day.summary.late}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={cn("h-2 w-2 rounded-full", statusColors.wfh)} />
                            <span className="text-xs mt-1">{day.summary.wfh}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className={cn("h-2 w-2 rounded-full", statusColors.leave)} />
                            <span className="text-xs mt-1">{day.summary.leave}</span>
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          
          {viewMode === "daily" && (
            <div className="flex flex-col items-center justify-center py-8">
              {calendarDays.length > 0 && (
                <div className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{format(calendarDays[0].date, "d")}</span>
                    <h3 className="text-xl font-medium mt-1">{format(calendarDays[0].date, "EEEE")}</h3>
                    <p className="text-sm text-muted-foreground">{format(calendarDays[0].date, "MMMM yyyy")}</p>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className={cn("h-4 w-4 rounded-full mb-2", statusColors.present)}></div>
                      <span className="text-lg font-semibold">{calendarDays[0].summary.present}</span>
                      <span className="text-xs text-muted-foreground">Present</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={cn("h-4 w-4 rounded-full mb-2", statusColors.absent)}></div>
                      <span className="text-lg font-semibold">{calendarDays[0].summary.absent}</span>
                      <span className="text-xs text-muted-foreground">Absent</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={cn("h-4 w-4 rounded-full mb-2", statusColors.late)}></div>
                      <span className="text-lg font-semibold">{calendarDays[0].summary.late}</span>
                      <span className="text-xs text-muted-foreground">Late</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={cn("h-4 w-4 rounded-full mb-2", statusColors.wfh)}></div>
                      <span className="text-lg font-semibold">{calendarDays[0].summary.wfh}</span>
                      <span className="text-xs text-muted-foreground">WFH</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className={cn("h-4 w-4 rounded-full mb-2", statusColors.leave)}></div>
                      <span className="text-lg font-semibold">{calendarDays[0].summary.leave}</span>
                      <span className="text-xs text-muted-foreground">Leave</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    className="mt-6"
                    onClick={() => handleDayClick(calendarDays[0])}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    View Details
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0">
          <div className="flex w-full items-center justify-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <span className={cn("mr-1 h-2 w-2 rounded-full", statusColors.present)} />
              <span>Present</span>
            </div>
            <div className="flex items-center">
              <span className={cn("mr-1 h-2 w-2 rounded-full", statusColors.absent)} />
              <span>Absent</span>
            </div>
            <div className="flex items-center">
              <span className={cn("mr-1 h-2 w-2 rounded-full", statusColors.late)} />
              <span>Late</span>
            </div>
            <div className="flex items-center">
              <span className={cn("mr-1 h-2 w-2 rounded-full", statusColors.wfh)} />
              <span>WFH</span>
            </div>
            <div className="flex items-center">
              <span className={cn("mr-1 h-2 w-2 rounded-full", statusColors.leave)} />
              <span>Leave</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Calendar;
