
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event, EventFormData } from "@/types/eventTypes";
import { 
  getEvents, 
  addEvent, 
  deleteEvent,
  saveToRemoteStorage,
  loadFromRemoteStorage
} from "@/utils/eventUtils";
import Navbar from "@/components/Layout/Navbar";
import CalendarView from "@/components/Calendar/CalendarView";
import EventsList from "@/components/Calendar/EventsList";
import EventForm from "@/components/Calendar/EventForm";
import EventDetails from "@/components/Calendar/EventDetails";
import { useToast } from "@/hooks/use-toast";

const CalendarPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const { toast } = useToast();

  // Load events on mount - now using the remote storage first
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // First try to load from remote storage
        const remoteEvents = await loadFromRemoteStorage();
        if (remoteEvents && remoteEvents.length > 0) {
          setEvents(remoteEvents);
        } else {
          // Fall back to local storage if remote fails
          const localEvents = getEvents();
          setEvents(localEvents);
          
          // If we have local events, push them to remote storage
          if (localEvents.length > 0) {
            await saveToRemoteStorage(localEvents);
          }
        }
      } catch (error) {
        console.error("Error loading events:", error);
        // Fall back to local storage
        const localEvents = getEvents();
        setEvents(localEvents);
      }
    };
    
    fetchEvents();
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
  const handleAddEvent = async (eventData: EventFormData) => {
    // Use the image from the file or the URL
    const newEventData = { ...eventData };
    
    // If we have an image file, it's already converted to data URL in the form
    // So we don't need to do anything special here, just pass along the data
    
    const newEvent = addEvent(newEventData);
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    
    // Save to remote storage to ensure all users see the new event
    try {
      await saveToRemoteStorage(updatedEvents);
    } catch (error) {
      console.error("Error saving to remote storage:", error);
    }
    
    toast({
      title: "Event created!",
      description: "Your event has been published to the calendar",
    });
  };

  // Handle deleting an event
  const handleDeleteEvent = async (id: string) => {
    deleteEvent(id);
    const updatedEvents = events.filter(event => event.id !== id);
    setEvents(updatedEvents);
    
    // Save to remote storage to ensure all users see the deletion
    try {
      await saveToRemoteStorage(updatedEvents);
    } catch (error) {
      console.error("Error saving to remote storage:", error);
    }
    
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

export default CalendarPage;
