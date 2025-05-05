
import React from "react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types/eventTypes";
import EventCard from "./EventCard";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  isToday,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  events: Event[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onDateClick, onEventClick }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  
  // Calculate days to display
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate leading and trailing days for a complete calendar grid
  const startWeekday = getDay(monthStart);
  
  // Move to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Move to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  // Get events for a specific date
  const getEventsForDay = (date: Date): Event[] => {
    return events.filter(event => isSameDay(event.date, date));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft size={18} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
      
      <div className="calendar-grid">
        {/* Weekday headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="p-2 text-center font-medium text-sm">
            {day}
          </div>
        ))}
        
        {/* Leading empty cells */}
        {Array.from({ length: startWeekday }).map((_, index) => (
          <div key={`empty-start-${index}`} className="border p-1" />
        ))}
        
        {/* Actual days */}
        {monthDays.map(day => {
          const dayEvents = getEventsForDay(day);
          const hasEvents = dayEvents.length > 0;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <div 
              key={day.toString()} 
              onClick={() => onDateClick(day)}
              className={cn(
                "border p-1 calendar-day relative transition-colors",
                isToday(day) && "today",
                hasEvents && "has-events",
                !isCurrentMonth && "opacity-40"
              )}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "inline-block w-6 h-6 text-center text-sm leading-6 rounded-full",
                  isToday(day) && "bg-primary text-primary-foreground"
                )}>
                  {format(day, "d")}
                </span>
                
                {hasEvents && (
                  <span className="text-xs font-medium bg-primary text-primary-foreground px-1 rounded">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              
              <div className="mt-1 space-y-1 max-h-24 overflow-y-auto">
                {dayEvents.slice(0, 3).map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onClick={onEventClick}
                    compact 
                  />
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-2">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
