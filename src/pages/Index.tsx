
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event, EventFormData } from "@/types/eventTypes";
import { 
  getEvents, 
  addEvent, 
  deleteEvent, 
  getEventsForDate, 
  getEventsForMonth 
} from "@/utils/eventUtils";
import Navbar from "@/components/Layout/Navbar";
import CalendarView from "@/components/Calendar/CalendarView";
import EventsList from "@/components/Calendar/EventsList";
import EventForm from "@/components/Calendar/EventForm";
import EventDetails from "@/components/Calendar/EventDetails";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const { toast } = useToast();

  // Load events on mount
  useEffect(() => {
    const loadedEvents = getEvents();
    setEvents(loadedEvents);
  }, []);

  // Handle date click in calendar
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsEventFormOpen(true);
  };

  // Handle event click
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  // Handle adding a new event
  const handleAddEvent = (eventData: EventFormData) => {
    // Use the image from the file or the URL
    const newEventData = { ...eventData };
    
    // If we have an image file, it's already converted to data URL in the form
    // So we don't need to do anything special here, just pass along the data
    
    const newEvent = addEvent(newEventData);
    setEvents(prev => [...prev, newEvent]);
    toast({
      title: "Event created!",
      description: "Your event has been added to the calendar",
    });
  };

  // Handle deleting an event
  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
    setEvents(prev => prev.filter(event => event.id !== id));
    toast({
      title: "Event deleted",
      description: "The event has been removed from the calendar",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onAddEvent={() => setIsEventFormOpen(true)} />
      
      <main className="flex-1 container py-8">
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
      
      {/* Event Forms and Modals */}
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

export default Index;
