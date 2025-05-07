
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event, EventFormData } from "@/types/eventTypes";
import supabaseEventService from "@/services/supabaseEventService";
import Navbar from "@/components/Layout/Navbar";
import CalendarView from "@/components/Calendar/CalendarView";
import EventsList from "@/components/Calendar/EventsList";
import EventForm from "@/components/Calendar/EventForm";
import EventDetails from "@/components/Calendar/EventDetails";
import SyncIndicator from "@/components/Layout/SyncIndicator";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

const CalendarPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load and subscribe to events
  useEffect(() => {
    setIsLoading(true);
    
    // Subscribe to real-time updates
    const unsubscribe = supabaseEventService.subscribeToEvents((updatedEvents) => {
      setEvents(updatedEvents);
      setIsLoading(false);
    });
    
    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  // Click on a date in calendar
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsEventFormOpen(true);
  };

  // Click on an event
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  // Add a new event
  const handleAddEvent = async (eventData: EventFormData) => {
    try {
      const newEvent = await supabaseEventService.addEvent(eventData);
      
      if (newEvent) {
        toast({
          title: "Event created!",
          description: "Your event has been published and is visible to all users.",
        });
      } else {
        toast({
          title: "Error",
          description: "Unable to create the event. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        title: "Error",
        description: "Unable to create the event. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete an event
  const handleDeleteEvent = async (id: string) => {
    try {
      const success = await supabaseEventService.deleteEvent(id);
      
      if (success) {
        toast({
          title: "Event deleted",
          description: "The event has been removed from the calendar.",
        });
      } else {
        toast({
          title: "Error",
          description: "Unable to delete the event. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Unable to delete the event. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Share calendar link
  const handleShareLink = () => {
    const url = window.location.href;
    
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard"
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Unable to copy the link",
        variant: "destructive"
      });
    });
  };

  // Show loading message
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onAddEvent={() => setIsEventFormOpen(true)} />
        <div className="flex-1 container py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onAddEvent={() => setIsEventFormOpen(true)} />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Events Calendar</h1>
            <SyncIndicator />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleShareLink}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 size={16} />
              <span>Share</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="border rounded-lg p-6">
            <CalendarView 
              events={events}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
            />
          </TabsContent>
          
          <TabsContent value="list" className="border rounded-lg p-6">
            <EventsList 
              events={events}
              onEventClick={handleEventClick}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Event forms and modals */}
      <EventForm 
        isOpen={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
        onSubmit={handleAddEvent}
        initialDate={selectedDate}
      />
      
      <EventDetails 
        event={selectedEvent}
        isOpen={isEventDetailsOpen}
        onClose={() => setIsEventDetailsOpen(false)}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default CalendarPage;
