
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event, EventFormData } from "@/types/eventTypes";
import EventService from "@/services/eventService";
import AirtableService from "@/services/airtableService";
import Navbar from "@/components/Layout/Navbar";
import CalendarView from "@/components/Calendar/CalendarView";
import EventsList from "@/components/Calendar/EventsList";
import EventForm from "@/components/Calendar/EventForm";
import EventDetails from "@/components/Calendar/EventDetails";
import AirtableConfigDialog from "@/components/Config/AirtableConfigDialog";
import SyncIndicator from "@/components/Layout/SyncIndicator";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Share2, Database } from "lucide-react";

const CalendarPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [isAirtableConfigOpen, setIsAirtableConfigOpen] = useState(false);
  const [isAirtableConfigured, setIsAirtableConfigured] = useState(false);
  const [activeTab, setActiveTab] = useState("calendar");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Référence aux services
  const eventService = EventService.getInstance();
  const airtableService = AirtableService.getInstance();

  // Vérifier la configuration d'Airtable au chargement
  useEffect(() => {
    setIsAirtableConfigured(airtableService.isConfigured());
    
    // Écouteur pour les changements de configuration
    const configListener = (configured: boolean) => {
      setIsAirtableConfigured(configured);
    };
    
    airtableService.addConfigListener(configListener);
    
    return () => {
      airtableService.removeConfigListener(configListener);
    };
  }, []);

  // Chargement des événements
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        // Forcer une synchronisation au chargement de la page
        await eventService.forceSyncNow();
        const allEvents = await eventService.getAllEvents();
        setEvents(allEvents);
        console.log(`Chargé ${allEvents.length} événements`);
      } catch (error) {
        console.error("Erreur lors du chargement des événements:", error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les événements. Veuillez réessayer.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvents();
    
    // Configurer une actualisation périodique des événements
    const refreshInterval = setInterval(async () => {
      try {
        const refreshedEvents = await eventService.getAllEvents();
        setEvents(refreshedEvents);
        console.log(`Rafraîchi avec ${refreshedEvents.length} événements`);
      } catch (error) {
        console.error("Erreur lors du rafraîchissement des événements:", error);
      }
    }, 15000); // Rafraîchir toutes les 15 secondes
    
    return () => {
      clearInterval(refreshInterval);
      // Nettoyer le service d'événements
      eventService.cleanup();
    };
  }, [toast]);

  // Clic sur une date dans le calendrier
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsEventFormOpen(true);
  };

  // Clic sur un événement
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailsOpen(true);
  };

  // Ajout d'un nouvel événement
  const handleAddEvent = async (eventData: EventFormData) => {
    try {
      const newEvent = await eventService.addEvent(eventData);
      // Rafraîchir tous les événements pour s'assurer d'avoir les données les plus récentes
      const refreshedEvents = await eventService.getAllEvents();
      setEvents(refreshedEvents);
      
      toast({
        title: "Événement créé!",
        description: "Votre événement a été publié et sera visible par tous les utilisateurs après synchronisation (max: 1 minute)",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'événement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Suppression d'un événement
  const handleDeleteEvent = async (id: string) => {
    try {
      await eventService.deleteEvent(id);
      // Rafraîchir tous les événements pour s'assurer d'avoir les données les plus récentes
      const refreshedEvents = await eventService.getAllEvents();
      setEvents(refreshedEvents);
      
      toast({
        title: "Événement supprimé",
        description: "L'événement sera retiré du calendrier pour tous les utilisateurs après synchronisation (max: 1 minute)",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Partager le lien du calendrier
  const handleShareLink = () => {
    const url = window.location.href;
    
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

  // Ouvrir la configuration Airtable
  const handleOpenAirtableConfig = () => {
    setIsAirtableConfigOpen(true);
  };

  // Afficher un message de chargement
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar onAddEvent={() => setIsEventFormOpen(true)} />
        <div className="flex-1 container py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Chargement des événements...</p>
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
            <h1 className="text-2xl font-bold">Calendrier des Événements</h1>
            <SyncIndicator />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleOpenAirtableConfig}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Database size={16} />
              <span>
                {isAirtableConfigured ? "Config. Airtable" : "Configurer Airtable"}
              </span>
            </Button>
            
            <Button 
              onClick={handleShareLink}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 size={16} />
              <span>Partager</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="calendar">Vue Calendrier</TabsTrigger>
            <TabsTrigger value="list">Vue Liste</TabsTrigger>
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
        
        {!isAirtableConfigured && events.length === 0 && (
          <div className="mt-8 p-6 border border-dashed rounded-lg flex flex-col items-center justify-center text-center">
            <Database size={32} className="text-muted-foreground mb-2" />
            <h3 className="font-medium text-lg">Configurez Airtable pour une synchronisation en temps réel</h3>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Pour que les événements soient visibles par tous les utilisateurs, configurez Airtable comme source de données centralisée.
            </p>
            <Button onClick={handleOpenAirtableConfig} className="mt-4">
              Configurer Airtable
            </Button>
          </div>
        )}
      </main>
      
      {/* Formulaires et modales d'événements */}
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
      
      <AirtableConfigDialog
        isOpen={isAirtableConfigOpen}
        onClose={() => setIsAirtableConfigOpen(false)}
      />
    </div>
  );
};

export default CalendarPage;
