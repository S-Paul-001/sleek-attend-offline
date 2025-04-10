
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  
  useEffect(() => {
    const fetchCalendarData = async () => {
      setIsLoading(true);
      
      // Get the range of days in the current month view
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      // Load attendance data for each day
      const today = new Date();
      const days: CalendarDay[] = [];
      
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
      
      setCalendarDays(days);
      setIsLoading(false);
    };
    
    fetchCalendarData();
  }, [currentMonth]);
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
  };
  
  const handleDayClick = (day: CalendarDay) => {
    // Format the date for the attendance page URL
    const dateParam = format(day.date, "yyyy-MM-dd");
    navigate(`/attendance?date=${dateParam}`);
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-medium">
            {format(currentMonth, "MMMM yyyy")}
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
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar grid */}
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
