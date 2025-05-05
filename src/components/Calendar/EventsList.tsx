
import React from "react";
import { Event } from "@/types/eventTypes";
import EventCard from "./EventCard";
import { format, isToday, isTomorrow, addDays, isSameDay } from "date-fns";

interface EventsListProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

const EventsList: React.FC<EventsListProps> = ({ events, onEventClick }) => {
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Group events by date
  const groupedEvents: { [key: string]: Event[] } = {};
  
  sortedEvents.forEach(event => {
    const dateKey = format(event.date, "yyyy-MM-dd");
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(event);
  });

  // Function to get display text for date
  const getDateDisplay = (date: Date): string => {
    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else {
      return format(date, "EEEE, MMMM d");
    }
  };

  // Check if we have upcoming events
  const hasEvents = Object.keys(groupedEvents).length > 0;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Upcoming Events</h2>
      
      {!hasEvents && (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No upcoming events found</p>
        </div>
      )}
      
      {Object.keys(groupedEvents).map(dateKey => {
        const date = new Date(dateKey);
        const dateEvents = groupedEvents[dateKey];
        
        return (
          <div key={dateKey} className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span>{getDateDisplay(date)}</span>
              {isToday(date) && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dateEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onClick={onEventClick} 
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventsList;
