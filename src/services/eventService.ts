
import { Event, EventFormData } from "../types/eventTypes";
import { 
  getEvents, 
  saveEvents, 
  saveToRemoteStorage, 
  loadFromRemoteStorage 
} from "../utils/eventUtils";

// Make synchronization more frequent (1.5 seconds - for better real-time experience)
const SYNC_INTERVAL = 1500;

// Unique ID for this browser session
const SESSION_ID = Date.now().toString();

// Last sync timestamp
let lastSyncTime = 0;

// Singleton class for event management and synchronization
class EventService {
  private static instance: EventService;
  private events: Event[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;
  private syncInProgress: boolean = false;

  private constructor() {
    this.loadEvents();
    this.startSyncInterval();
    
    // Add window event listeners for better synchronization
    window.addEventListener('focus', this.handleWindowFocus);
    window.addEventListener('online', this.handleOnline);
    
    // For debugging
    console.log("EventService instance created");
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  // Initial event loading
  private async loadEvents(): Promise<void> {
    try {
      console.log("Loading events from remote storage...");
      
      // Always try to load from remote storage first
      const remoteEvents = await loadFromRemoteStorage();
      
      if (remoteEvents && remoteEvents.length > 0) {
        console.log(`${remoteEvents.length} events loaded from remote storage`);
        this.events = remoteEvents;
        
        // Save locally for offline access
        saveEvents(remoteEvents);
      } else {
        // Fallback to local storage
        const localEvents = getEvents();
        this.events = localEvents;
        
        // Push local events to remote storage
        if (localEvents.length > 0) {
          await saveToRemoteStorage(localEvents);
          console.log(`${localEvents.length} local events saved to remote storage`);
        }
      }
      
      lastSyncTime = Date.now();
      this.isInitialized = true;
    } catch (error) {
      console.error("Error loading events:", error);
      // Fallback to local events
      this.events = getEvents();
      this.isInitialized = true;
    }
  }

  // Window focus handler - sync immediately
  private handleWindowFocus = async (): Promise<void> => {
    console.log("Window received focus, syncing data...");
    await this.syncWithRemoteStorage();
  }
  
  // Online status handler - sync when coming back online
  private handleOnline = async (): Promise<void> => {
    console.log("Device is online, syncing data...");
    await this.syncWithRemoteStorage();
  }

  // Start periodic synchronization
  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      await this.syncWithRemoteStorage();
    }, SYNC_INTERVAL);
    
    // Sync when page becomes visible
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        console.log("Page visible, syncing data...");
        await this.syncWithRemoteStorage();
      }
    });
  }

  // Sync with remote storage
  private async syncWithRemoteStorage(): Promise<void> {
    // Prevent concurrent syncs
    if (this.syncInProgress) {
      return;
    }
    
    this.syncInProgress = true;
    
    try {
      const remoteEvents = await loadFromRemoteStorage();
      
      if (remoteEvents && Array.isArray(remoteEvents)) {
        // For debugging
        console.log(`Synchronization: ${remoteEvents.length} events found in remote storage`);
        
        // Always update with remote data
        this.events = remoteEvents;
        saveEvents(remoteEvents);
        console.log("Local data updated with remote data");
      }
      
      lastSyncTime = Date.now();
    } catch (error) {
      console.error("Error syncing with remote storage:", error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Get all events, with waiting if necessary
  public async getAllEvents(): Promise<Event[]> {
    // If not yet initialized, wait a bit
    if (!this.isInitialized) {
      console.log("Service not initialized, waiting...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // If still not initialized, force a sync
      if (!this.isInitialized) {
        await this.syncWithRemoteStorage();
      }
    }
    
    // Force a sync with remote storage to get latest data
    await this.syncWithRemoteStorage();
    
    return [...this.events];
  }

  // Get all events (synchronous for compatibility)
  public getAllEventsSync(): Event[] {
    return [...this.events];
  }

  // Add a new event
  public async addEvent(eventData: EventFormData): Promise<Event> {
    // Sync first to get latest events
    await this.syncWithRemoteStorage();
    
    const newEvent: Event = {
      ...eventData,
      id: `${SESSION_ID}-${Date.now()}`, // Unique ID with session prefix
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      // Get current events from remote storage
      const remoteEvents = await loadFromRemoteStorage();
      const currentEvents = Array.isArray(remoteEvents) && remoteEvents.length > 0 
        ? remoteEvents 
        : this.events;
      
      // Add new event
      const updatedEvents = [...currentEvents, newEvent];
      this.events = updatedEvents;
      
      // Save locally and remotely
      saveEvents(updatedEvents);
      
      // Force immediate remote save with verification
      await saveToRemoteStorage(updatedEvents);
      console.log("New event synced to remote storage");
      
      // Verify the save by loading again
      await this.syncWithRemoteStorage();
      
      return newEvent;
    } catch (error) {
      console.error("Error saving to remote storage:", error);
      throw error;
    }
  }

  // Delete an event
  public async deleteEvent(id: string): Promise<void> {
    // Sync first to get latest events
    await this.syncWithRemoteStorage();
    
    try {
      // Get current events from remote storage
      const remoteEvents = await loadFromRemoteStorage();
      const currentEvents = Array.isArray(remoteEvents) && remoteEvents.length > 0 
        ? remoteEvents 
        : this.events;
      
      // Filter the event to delete
      const updatedEvents = currentEvents.filter(event => event.id !== id);
      this.events = updatedEvents;
      
      // Save locally and remotely
      saveEvents(updatedEvents);
      
      await saveToRemoteStorage(updatedEvents);
      console.log("Event deletion synced with remote storage");
      
      // Verify the delete by loading again
      await this.syncWithRemoteStorage();
    } catch (error) {
      console.error("Error saving to remote storage:", error);
      throw error;
    }
  }

  // Force immediate sync
  public async forceSyncNow(): Promise<void> {
    console.log("Forcing synchronization...");
    await this.syncWithRemoteStorage();
  }
  
  // Clean up resources when destroying
  public cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('online', this.handleOnline);
  }
}

export default EventService;
