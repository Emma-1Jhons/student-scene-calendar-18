
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { Event } from "@/types/eventTypes";
import { formatEventDate, formatEventTime } from "@/utils/eventUtils";

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  compact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick, compact = false }) => {
  const hasTimeInfo = event.startTime || event.endTime;
  const timeDisplay = hasTimeInfo 
    ? `${formatEventTime(event.startTime)} ${event.endTime ? `- ${formatEventTime(event.endTime)}` : ""}`
    : "All day";

  if (compact) {
    return (
      <div 
        className="px-2 py-1 mb-1 text-xs font-medium bg-primary/10 text-primary-foreground rounded cursor-pointer hover:bg-primary/20 transition-colors truncate"
        onClick={() => onClick(event)}
      >
        {event.title}
      </div>
    );
  }

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(event)}
    >
      {event.image && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
          />
        </div>
      )}
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
        </div>
        <Badge variant="outline" className="mt-1 text-xs">
          {event.clubName}
        </Badge>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 text-sm">
        <p className="text-muted-foreground mb-2">{formatEventDate(event.date)}</p>
        {event.description && (
          <p className="line-clamp-2 mb-3 text-muted-foreground">{event.description}</p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-col items-start gap-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{timeDisplay}</span>
        </div>
        
        {event.location && (
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{event.location}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;
