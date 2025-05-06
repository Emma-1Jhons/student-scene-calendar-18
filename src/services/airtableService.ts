
import Airtable from "airtable";
import { Event, EventFormData } from "../types/eventTypes";

// Délai de synchronisation (1 minute comme demandé)
export const SYNC_DELAY_MS = 60000; // 60 secondes

// Configuration Airtable
interface AirtableConfig {
  apiKey: string;
  baseId: string;
  tableName: string;
}

// Singleton pour la gestion d'Airtable
class AirtableService {
  private static instance: AirtableService;
  private config: AirtableConfig | null = null;
  private base: any = null;
  private table: any = null;
  private lastSyncTime = 0;
  private isSyncing = false;
  private syncListeners: Array<(status: string) => void> = [];
  private configListeners: Array<(isConfigured: boolean) => void> = [];

  private constructor() {
    // Essayer de charger la configuration depuis le localStorage
    this.loadConfig();
  }

  public static getInstance(): AirtableService {
    if (!AirtableService.instance) {
      AirtableService.instance = new AirtableService();
    }
    return AirtableService.instance;
  }

  // Charger la configuration depuis localStorage
  private loadConfig(): void {
    try {
      const savedConfig = localStorage.getItem('airtable_config');
      if (savedConfig) {
        this.config = JSON.parse(savedConfig);
        this.initializeAirtable();
        this.notifyConfigListeners(true);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration Airtable:", error);
    }
  }

  // Initialiser la connexion Airtable
  private initializeAirtable(): void {
    if (!this.config) return;

    try {
      Airtable.configure({
        apiKey: this.config.apiKey
      });

      this.base = Airtable.base(this.config.baseId);
      this.table = this.base(this.config.tableName);
      console.log("Connexion Airtable initialisée");
    } catch (error) {
      console.error("Erreur lors de l'initialisation d'Airtable:", error);
    }
  }

  // Configurer le service
  public configure(config: AirtableConfig): boolean {
    try {
      this.config = config;
      this.initializeAirtable();
      
      // Sauvegarder dans localStorage
      localStorage.setItem('airtable_config', JSON.stringify(config));
      
      this.notifyConfigListeners(true);
      return true;
    } catch (error) {
      console.error("Erreur lors de la configuration d'Airtable:", error);
      return false;
    }
  }

  // Vérifier si configuré
  public isConfigured(): boolean {
    return !!this.config;
  }

  // Convertir un enregistrement Airtable en événement
  private recordToEvent(record: any): Event {
    const fields = record.fields;
    
    return {
      id: record.id,
      title: fields.title || "Sans titre",
      description: fields.description || "",
      clubName: fields.clubName || "Inconnu",
      date: new Date(fields.date),
      startTime: fields.startTime || "",
      endTime: fields.endTime || "",
      location: fields.location || "",
      image: fields.image || "",
      createdAt: new Date(fields.createdAt || Date.now()),
      updatedAt: new Date(fields.updatedAt || Date.now())
    };
  }

  // Convertir un événement en objet compatible Airtable
  private eventToRecord(event: Event | EventFormData): any {
    return {
      title: event.title,
      description: event.description || "",
      clubName: event.clubName || "",
      date: event.date instanceof Date ? event.date.toISOString() : event.date,
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      location: event.location || "",
      image: event.image || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Récupérer tous les événements depuis Airtable
  public async fetchAllEvents(): Promise<Event[]> {
    if (!this.isConfigured()) {
      console.error("Airtable n'est pas configuré");
      return [];
    }

    this.isSyncing = true;
    this.notifySyncListeners("syncing");
    
    try {
      const records = await this.table.select().all();
      const events = records.map((record: any) => this.recordToEvent(record));
      
      this.lastSyncTime = Date.now();
      this.isSyncing = false;
      this.notifySyncListeners("success");
      
      return events;
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
      this.isSyncing = false;
      this.notifySyncListeners("error");
      return [];
    }
  }

  // Ajouter un événement
  public async createEvent(event: EventFormData): Promise<Event | null> {
    if (!this.isConfigured()) {
      console.error("Airtable n'est pas configuré");
      return null;
    }

    this.isSyncing = true;
    this.notifySyncListeners("syncing");
    
    try {
      const record = await this.table.create([
        { fields: this.eventToRecord(event) }
      ]);
      
      this.lastSyncTime = Date.now();
      this.isSyncing = false;
      this.notifySyncListeners("success");
      
      return this.recordToEvent(record[0]);
    } catch (error) {
      console.error("Erreur lors de la création de l'événement:", error);
      this.isSyncing = false;
      this.notifySyncListeners("error");
      return null;
    }
  }

  // Supprimer un événement
  public async deleteEvent(id: string): Promise<boolean> {
    if (!this.isConfigured()) {
      console.error("Airtable n'est pas configuré");
      return false;
    }

    this.isSyncing = true;
    this.notifySyncListeners("syncing");
    
    try {
      await this.table.destroy([id]);
      
      this.lastSyncTime = Date.now();
      this.isSyncing = false;
      this.notifySyncListeners("success");
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error);
      this.isSyncing = false;
      this.notifySyncListeners("error");
      return false;
    }
  }

  // Obtenir le temps écoulé depuis la dernière synchronisation
  public getTimeSinceLastSync(): number {
    return Date.now() - this.lastSyncTime;
  }

  // Obtenir l'état de synchronisation
  public getSyncStatus(): { isSyncing: boolean, lastSyncTime: number } {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime
    };
  }

  // Ajouter un écouteur de synchronisation
  public addSyncListener(listener: (status: string) => void): void {
    this.syncListeners.push(listener);
  }

  // Retirer un écouteur de synchronisation
  public removeSyncListener(listener: (status: string) => void): void {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  // Notifier les écouteurs de synchronisation
  private notifySyncListeners(status: string): void {
    this.syncListeners.forEach(listener => listener(status));
  }

  // Ajouter un écouteur de configuration
  public addConfigListener(listener: (isConfigured: boolean) => void): void {
    this.configListeners.push(listener);
  }

  // Retirer un écouteur de configuration
  public removeConfigListener(listener: (isConfigured: boolean) => void): void {
    this.configListeners = this.configListeners.filter(l => l !== listener);
  }

  // Notifier les écouteurs de configuration
  private notifyConfigListeners(isConfigured: boolean): void {
    this.configListeners.forEach(listener => listener(isConfigured));
  }
}

export default AirtableService;
