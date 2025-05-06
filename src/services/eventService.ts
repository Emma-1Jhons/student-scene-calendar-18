
import { Event, EventFormData } from "../types/eventTypes";
import { 
  getEvents, 
  saveEvents, 
  saveToRemoteStorage, 
  loadFromRemoteStorage 
} from "../utils/eventUtils";

// Intervalle de synchronisation en ms (5 secondes - plus fréquent pour une meilleure réactivité)
const SYNC_INTERVAL = 5000;

// Unique ID pour cette session du navigateur
const SESSION_ID = Date.now().toString();

// La dernière fois que nous avons synchronisé avec le stockage distant
let lastSyncTime = 0;

// Classe singleton pour gérer les événements et leur synchronisation
class EventService {
  private static instance: EventService;
  private events: Event[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    this.loadEvents();
    this.startSyncInterval();
    
    // Ajouter un événement au window pour indiquer que cette instance est prête
    window.addEventListener('focus', this.handleWindowFocus);
    
    // Pour déboguer
    console.log("EventService instance créée");
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
      
      // Toujours essayer de charger depuis le stockage distant en premier
      const remoteEvents = await loadFromRemoteStorage();
      
      if (remoteEvents && remoteEvents.length > 0) {
        console.log(`${remoteEvents.length} événements chargés depuis le stockage distant`);
        this.events = remoteEvents;
        
        // Sauvegarde locale pour l'accès hors ligne
        saveEvents(remoteEvents);
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
      this.isInitialized = true;
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error);
      // Fallback sur les événements locaux
      this.events = getEvents();
      this.isInitialized = true;
    }
  }

  // Gestionnaire pour focus de fenêtre - synchroniser immédiatement
  private handleWindowFocus = async (): Promise<void> => {
    console.log("Fenêtre a reçu le focus, synchronisation des données...");
    await this.syncWithRemoteStorage();
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
        console.log("Page visible, synchronisation des données...");
        await this.syncWithRemoteStorage();
      }
    });
  }

  // Synchronisation avec le stockage distant
  private async syncWithRemoteStorage(): Promise<void> {
    try {
      const remoteEvents = await loadFromRemoteStorage();
      
      if (remoteEvents && Array.isArray(remoteEvents)) {
        // Pour déboguer
        console.log(`Synchronisation: ${remoteEvents.length} événements trouvés dans le stockage distant`);
        
        // Toujours mettre à jour avec les données distantes
        this.events = remoteEvents;
        saveEvents(remoteEvents);
        console.log("Données locales mises à jour avec les données distantes");
      }
      
      lastSyncTime = Date.now();
    } catch (error) {
      console.error("Erreur lors de la synchronisation avec le stockage distant:", error);
    }
  }

  // Obtenir tous les événements, avec une attente si nécessaire
  public async getAllEvents(): Promise<Event[]> {
    // Si nous ne sommes pas encore initialisés, attendez un peu
    if (!this.isInitialized) {
      console.log("Service non initialisé, attente...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Si toujours pas initialisé, forcer une synchronisation
      if (!this.isInitialized) {
        await this.syncWithRemoteStorage();
      }
    }
    
    return [...this.events];
  }

  // Obtenir tous les événements (synchrone pour la compatibilité)
  public getAllEventsSync(): Event[] {
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
    
    // Obtenir les événements actuels du stockage distant
    let currentEvents: Event[];
    try {
      const remoteEvents = await loadFromRemoteStorage();
      currentEvents = Array.isArray(remoteEvents) && remoteEvents.length > 0 
        ? remoteEvents 
        : this.events;
    } catch (error) {
      console.error("Erreur lors du chargement des événements distants:", error);
      currentEvents = this.events;
    }
    
    // Ajouter le nouvel événement
    const updatedEvents = [...currentEvents, newEvent];
    this.events = updatedEvents;
    
    // Sauvegarder localement et à distance
    saveEvents(updatedEvents);
    
    try {
      await saveToRemoteStorage(updatedEvents);
      console.log("Nouvel événement synchronisé avec le stockage distant");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde dans le stockage distant:", error);
    }
    
    return newEvent;
  }

  // Supprimer un événement
  public async deleteEvent(id: string): Promise<void> {
    // Obtenir les événements actuels du stockage distant
    let currentEvents: Event[];
    try {
      const remoteEvents = await loadFromRemoteStorage();
      currentEvents = Array.isArray(remoteEvents) && remoteEvents.length > 0 
        ? remoteEvents 
        : this.events;
    } catch (error) {
      console.error("Erreur lors du chargement des événements distants:", error);
      currentEvents = this.events;
    }
    
    // Filtrer l'événement à supprimer
    const updatedEvents = currentEvents.filter(event => event.id !== id);
    this.events = updatedEvents;
    
    // Sauvegarder localement et à distance
    saveEvents(updatedEvents);
    
    try {
      await saveToRemoteStorage(updatedEvents);
      console.log("Suppression d'événement synchronisée avec le stockage distant");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde dans le stockage distant:", error);
    }
  }

  // Force une synchronisation immédiate
  public async forceSyncNow(): Promise<void> {
    console.log("Forçage de la synchronisation...");
    await this.syncWithRemoteStorage();
  }
  
  // Nettoyer les ressources lors de la destruction
  public cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('focus', this.handleWindowFocus);
  }
}

export default EventService;
