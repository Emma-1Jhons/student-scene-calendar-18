import { Event, EventFormData } from "../types/eventTypes";
import { 
  getEvents, 
  saveEvents, 
  saveToRemoteStorage, 
  loadFromRemoteStorage 
} from "../utils/eventUtils";
import AirtableService from "./airtableService";

// Sync interval en millisecondes
const SYNC_INTERVAL = 10000; // 10 secondes pour voir plus rapidement l'état
const INITIAL_SYNC_DELAY = 500; // Délai avant la première synchronisation

// Singleton class for event management and synchronization
class EventService {
  private static instance: EventService;
  private events: Event[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;
  private syncInProgress: boolean = false;
  private airtableService: AirtableService;
  private useAirtable: boolean = false;

  private constructor() {
    this.airtableService = AirtableService.getInstance();
    this.useAirtable = this.airtableService.isConfigured();
    
    // Écouter les changements de configuration Airtable
    this.airtableService.addConfigListener((isConfigured) => {
      this.useAirtable = isConfigured;
      if (isConfigured) {
        console.log("Airtable configuré, synchronisation des événements...");
        this.syncEventsFromAirtable();
      }
    });
    
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
      console.log("Loading events...");
      
      if (this.useAirtable) {
        // If Airtable is configured, load from there
        await this.syncEventsFromAirtable();
      } else {
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
      }
      
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
    await this.syncWithDataSource();
  }
  
  // Online status handler - sync when coming back online
  private handleOnline = async (): Promise<void> => {
    console.log("Device is online, syncing data...");
    await this.syncWithDataSource();
  }

  // Start periodic synchronization
  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      await this.syncWithDataSource();
    }, SYNC_INTERVAL);
    
    // Sync when page becomes visible
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        console.log("Page visible, syncing data...");
        await this.syncWithDataSource();
      }
    });
  }

  // Synchroniser les données avec Airtable
  private async syncEventsFromAirtable(): Promise<void> {
    if (!this.airtableService.isConfigured()) {
      return;
    }
    
    try {
      const airtableEvents = await this.airtableService.fetchAllEvents();
      
      if (airtableEvents && airtableEvents.length >= 0) {
        console.log(`${airtableEvents.length} events loaded from Airtable`);
        this.events = airtableEvents;
        
        // Also save to local storage for offline use
        saveEvents(airtableEvents);
      }
    } catch (error) {
      console.error("Error synchronizing with Airtable:", error);
    }
  }

  // Sync with data source (Airtable or remote storage)
  private async syncWithDataSource(): Promise<void> {
    // Prevent concurrent syncs
    if (this.syncInProgress) {
      return;
    }
    
    this.syncInProgress = true;
    
    try {
      if (this.useAirtable) {
        await this.syncEventsFromAirtable();
      } else {
        const remoteEvents = await loadFromRemoteStorage();
        
        if (remoteEvents && Array.isArray(remoteEvents)) {
          // For debugging
          console.log(`Synchronization: ${remoteEvents.length} events found in remote storage`);
          
          // Always update with remote data
          this.events = remoteEvents;
          saveEvents(remoteEvents);
          console.log("Local data updated with remote data");
        }
      }
    } catch (error) {
      console.error("Error syncing with data source:", error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Get all events, with waiting if necessary
  public async getAllEvents(): Promise<Event[]> {
    // If not yet initialized, wait a bit
    if (!this.isInitialized) {
      console.log("Service not initialized, waiting...");
      await new Promise(resolve => setTimeout(resolve, INITIAL_SYNC_DELAY));
      
      // If still not initialized, force a sync
      if (!this.isInitialized) {
        await this.syncWithDataSource();
      }
    }
    
    // Force a sync with data source to get latest data
    await this.syncWithDataSource();
    
    return [...this.events];
  }

  // Get all events (synchronous for compatibility)
  public getAllEventsSync(): Event[] {
    return [...this.events];
  }

  // Add a new event
  public async addEvent(eventData: EventFormData): Promise<Event> {
    // If using Airtable, add to Airtable
    if (this.useAirtable) {
      const newEvent = await this.airtableService.createEvent(eventData);
      
      if (newEvent) {
        // Sync after adding to make sure we have the latest data
        await this.syncEventsFromAirtable();
        return newEvent;
      } else {
        throw new Error("Failed to create event in Airtable");
      }
    }
    
    // Otherwise use local storage + browser sync like before
    // Sync first to get latest events
    await this.syncWithDataSource();
    
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}`, // Unique ID
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
      await this.syncWithDataSource();
      
      return newEvent;
    } catch (error) {
      console.error("Error saving to remote storage:", error);
      throw error;
    }
  }

  // Delete an event
  public async deleteEvent(id: string): Promise<void> {
    // If using Airtable, delete from Airtable
    if (this.useAirtable) {
      const success = await this.airtableService.deleteEvent(id);
      
      if (success) {
        // Sync after deleting to make sure we have the latest data
        await this.syncEventsFromAirtable();
        return;
      } else {
        throw new Error("Failed to delete event from Airtable");
      }
    }
    
    // Otherwise use local storage + browser sync like before
    // Sync first to get latest events
    await this.syncWithDataSource();
    
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
      await this.syncWithDataSource();
    } catch (error) {
      console.error("Error saving to remote storage:", error);
      throw error;
    }
  }

  // Force immediate sync
  public async forceSyncNow(): Promise<void> {
    console.log("Forcing synchronization...");
    await this.syncWithDataSource();
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
