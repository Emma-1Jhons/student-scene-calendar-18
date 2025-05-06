
import { Event, EventFormData } from "../types/eventTypes";
import { format, isSameDay, isSameMonth, parseISO } from "date-fns";

// Mock data for initial events
const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Computer Science Club Meeting",
    description: "Weekly meeting to discuss upcoming hackathon and projects.",
    clubName: "CS Club",
    date: new Date(2025, 4, 10, 15, 0),
    startTime: "15:00",
    endTime: "16:30",
    location: "Engineering Building, Room 201",
    image: "/placeholder.svg",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    title: "Student Government Elections",
    description: "Cast your vote for next year's student representatives.",
    clubName: "Student Government",
    date: new Date(2025, 4, 15, 10, 0),
    startTime: "10:00",
    endTime: "16:00",
    location: "Student Center",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    title: "Photography Workshop",
    description: "Learn portrait photography techniques with professional equipment.",
    clubName: "Photography Club",
    date: new Date(2025, 4, 12, 14, 0),
    startTime: "14:00",
    endTime: "17:00",
    location: "Arts Building, Studio 3",
    image: "/placeholder.svg",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "4",
    title: "Basketball Tournament",
    description: "Inter-class basketball tournament. Sign up your team!",
    clubName: "Sports Association",
    date: new Date(2025, 4, 20, 9, 0),
    startTime: "09:00",
    endTime: "18:00",
    location: "Gymnasium",
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

// Local storage key
const EVENTS_STORAGE_KEY = "student_events";
// Remote storage key (using Firebase Realtime Database style endpoint)
const REMOTE_STORAGE_URL = "https://ensak-events-default-rtdb.firebaseio.com/events.json";

// Parse dates from JSON
const parseDatesFromJSON = (events: any[]): Event[] => {
  return events.map(event => ({
    ...event,
    date: new Date(event.date),
    createdAt: new Date(event.createdAt),
    updatedAt: new Date(event.updatedAt)
  }));
};

// Get all events from local storage
export const getEvents = (): Event[] => {
  const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
  if (storedEvents) {
    // Parse stored events and convert date strings back to Date objects
    return JSON.parse(storedEvents, (key, value) => {
      if (key === "date" || key === "createdAt" || key === "updatedAt") {
        return new Date(value);
      }
      return value;
    });
  }
  
  // Initialize with mock data if no stored events
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(MOCK_EVENTS));
  return MOCK_EVENTS;
};

// Save events to local storage
export const saveEvents = (events: Event[]): void => {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
};

// Remote storage functions
export const saveToRemoteStorage = async (events: Event[]): Promise<void> => {
  try {
    // Using localStorage as a simulation of remote storage since we can't actually 
    // connect to Firebase in this environment. In a real app, this would be an API call.
    localStorage.setItem('remote_' + EVENTS_STORAGE_KEY, JSON.stringify(events));
    
    // This would be the actual remote storage implementation:
    // const response = await fetch(REMOTE_STORAGE_URL, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(events),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to save events to remote storage');
    // }
    
    // Also update local storage as a backup
    saveEvents(events);
    
    console.log('Events saved to remote storage successfully');
  } catch (error) {
    console.error('Error saving to remote storage:', error);
    // Still update local storage even if remote fails
    saveEvents(events);
    throw error;
  }
};

export const loadFromRemoteStorage = async (): Promise<Event[]> => {
  try {
    // Simulating remote storage with another localStorage key
    const remoteData = localStorage.getItem('remote_' + EVENTS_STORAGE_KEY);
    
    // This would be the actual remote storage implementation:
    // const response = await fetch(REMOTE_STORAGE_URL);
    // if (!response.ok) {
    //   throw new Error('Failed to fetch events from remote storage');
    // }
    // const remoteData = await response.json();
    
    if (remoteData) {
      const parsedEvents = JSON.parse(remoteData, (key, value) => {
        if (key === "date" || key === "createdAt" || key === "updatedAt") {
          return new Date(value);
        }
        return value;
      });
      
      // Update local storage with remote data
      saveEvents(parsedEvents);
      
      return parsedEvents;
    }
    return [];
  } catch (error) {
    console.error('Error loading from remote storage:', error);
    throw error;
  }
};

// Add a new event
export const addEvent = (eventData: EventFormData): Event => {
  const events = getEvents();
  
  const newEvent: Event = {
    ...eventData,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  events.push(newEvent);
  saveEvents(events);
  
  return newEvent;
};

// Get a specific event by ID
export const getEventById = (id: string): Event | undefined => {
  const events = getEvents();
  return events.find(event => event.id === id);
};

// Delete an event
export const deleteEvent = (id: string): void => {
  const events = getEvents();
  const updatedEvents = events.filter(event => event.id !== id);
  saveEvents(updatedEvents);
};

// Get events for a specific date
export const getEventsForDate = (date: Date): Event[] => {
  const events = getEvents();
  return events.filter(event => isSameDay(event.date, date));
};

// Get events for a specific month
export const getEventsForMonth = (date: Date): Event[] => {
  const events = getEvents();
  return events.filter(event => isSameMonth(event.date, date));
};

// Format date for display
export const formatEventDate = (date: Date): string => {
  return format(date, "EEEE, MMMM d, yyyy");
};

// Format time for display
export const formatEventTime = (time?: string): string => {
  if (!time) return "";
  
  try {
    const [hours, minutes] = time.split(":");
    const parsedDate = new Date();
    parsedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return format(parsedDate, "h:mm a");
  } catch (error) {
    console.error("Error formatting time:", error);
    return time;
  }
};
