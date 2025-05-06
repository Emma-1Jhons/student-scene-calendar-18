
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Images, Share2 } from "lucide-react";
import { Event } from "@/types/eventTypes";
import { formatEventDate, formatEventTime } from "@/utils/eventUtils";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create the full URL with the calendar route
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/calendar`;
    
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Lien copié !",
        description: "Le lien a été copié dans votre presse-papiers"
      });
    }).catch(() => {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    });
  };

  if (compact) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div 
            className="px-2 py-1 mb-1 text-xs font-bold text-black bg-primary/10 rounded cursor-pointer hover:bg-primary/20 transition-colors truncate flex items-center gap-1"
            onClick={() => onClick(event)}
          >
            {event.image && <Images size={12} className="shrink-0" />}
            <span className="truncate font-semibold text-black">{event.title}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64 p-2" align="start">
          <h4 className="font-bold text-sm mb-1 text-black">{event.title}</h4>
          <p className="text-xs text-muted-foreground mb-2">{formatEventDate(event.date)} • {timeDisplay}</p>
          
          {event.image && (
            <div className="aspect-video overflow-hidden rounded mb-2">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          
          {event.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
          )}
          
          <div className="flex justify-between items-center mt-2">
            <Button 
              variant="link"
              size="sm"
              className="p-0 text-xs text-primary hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onClick(event);
              }}
            >
              Voir les détails
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleShare}
            >
              <Share2 size={14} />
            </Button>
          </div>
        </HoverCardContent>
      </HoverCard>
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
          <h3 className="font-bold text-lg line-clamp-2 text-black">{event.title}</h3>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 ml-2 shrink-0"
            onClick={handleShare}
          >
            <Share2 size={16} />
          </Button>
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
