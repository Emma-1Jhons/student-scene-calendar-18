
import { Event, EventFormData } from "../types/eventTypes";
import { 
  getEvents, 
  saveEvents, 
  saveToRemoteStorage, 
  loadFromRemoteStorage 
} from "../utils/eventUtils";

// Intervalle de synchronisation en ms (30 secondes)
const SYNC_INTERVAL = 30000;

// Unique ID pour cette session du navigateur
const SESSION_ID = Date.now().toString();

// La dernière fois que nous avons synchronisé avec le stockage distant
let lastSyncTime = 0;

// Classe singleton pour gérer les événements et leur synchronisation
class EventService {
  private static instance: EventService;
  private events: Event[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.loadEvents();
    this.startSyncInterval();
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  // Chargement initial des événements
  private async loadEvents(): Promise<void> {
    try {
      console.log("Chargement des événements depuis le stockage distant...");
      const remoteEvents = await loadFromRemoteStorage();
      if (remoteEvents && remoteEvents.length > 0) {
        this.events = remoteEvents;
        // Sauvegarde locale pour l'accès hors ligne
        saveEvents(remoteEvents);
        console.log(`${remoteEvents.length} événements chargés depuis le stockage distant`);
      } else {
        // Fallback sur le stockage local
        const localEvents = getEvents();
        this.events = localEvents;
        
        // Si nous avons des événements locaux, poussons-les vers le stockage distant
        if (localEvents.length > 0) {
          await saveToRemoteStorage(localEvents);
          console.log(`${localEvents.length} événements locaux sauvegardés dans le stockage distant`);
        }
      }
      lastSyncTime = Date.now();
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
      // Fallback sur les événements locaux
      this.events = getEvents();
    }
  }

  // Synchronisation périodique avec le stockage distant
  private startSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      await this.syncWithRemoteStorage();
    }, SYNC_INTERVAL);
    
    // Aussi synchroniser quand la page devient visible
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        await this.syncWithRemoteStorage();
      }
    });
  }

  // Synchronisation avec le stockage distant
  private async syncWithRemoteStorage(): Promise<void> {
    try {
      const remoteEvents = await loadFromRemoteStorage();
      
      if (remoteEvents && Array.isArray(remoteEvents)) {
        // Vérifier si les données distantes sont plus récentes
        const remoteHasNewer = remoteEvents.some(event => {
          // Trouver l'événement correspondant localement
          const localEvent = this.events.find(e => e.id === event.id);
          // Si l'événement n'existe pas localement ou a été mis à jour à distance
          return !localEvent || new Date(event.updatedAt) > new Date(localEvent.updatedAt);
        });
        
        // Si les données distantes sont plus récentes, mettre à jour localement
        if (remoteHasNewer) {
          console.log("Nouvelles données trouvées dans le stockage distant, mise à jour locale...");
          this.events = remoteEvents;
          saveEvents(remoteEvents);
        }
      }
      
      lastSyncTime = Date.now();
    } catch (error) {
      console.error("Erreur lors de la synchronisation avec le stockage distant:", error);
    }
  }

  // Obtenir tous les événements
  public getAllEvents(): Event[] {
    return [...this.events];
  }

  // Ajouter un nouvel événement
  public async addEvent(eventData: EventFormData): Promise<Event> {
    const newEvent: Event = {
      ...eventData,
      id: `${SESSION_ID}-${Date.now()}`, // ID unique avec préfixe de session
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.events.push(newEvent);
    
    // Sauvegarder localement
    saveEvents(this.events);
    
    // Synchroniser avec le stockage distant
    try {
      await saveToRemoteStorage(this.events);
      console.log("Nouvel événement synchronisé avec le stockage distant");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde dans le stockage distant:", error);
    }
    
    return newEvent;
  }

  // Supprimer un événement
  public async deleteEvent(id: string): Promise<void> {
    this.events = this.events.filter(event => event.id !== id);
    
    // Sauvegarder localement
    saveEvents(this.events);
    
    // Synchroniser avec le stockage distant
    try {
      await saveToRemoteStorage(this.events);
      console.log("Suppression d'événement synchronisée avec le stockage distant");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde dans le stockage distant:", error);
    }
  }

  // Force une synchronisation immédiate
  public async forceSyncNow(): Promise<void> {
    await this.syncWithRemoteStorage();
  }
}

export default EventService;
