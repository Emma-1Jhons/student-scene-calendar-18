
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

  // Chargement et abonnement aux événements
  useEffect(() => {
    setIsLoading(true);
    
    // S'abonner aux mises à jour en temps réel
    const unsubscribe = supabaseEventService.subscribeToEvents((updatedEvents) => {
      setEvents(updatedEvents);
      setIsLoading(false);
    });
    
    // Nettoyage
    return () => {
      unsubscribe();
    };
  }, []);

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
      const newEvent = await supabaseEventService.addEvent(eventData);
      
      if (newEvent) {
        toast({
          title: "Événement créé!",
          description: "Votre événement a été publié et est visible par tous les utilisateurs.",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'événement. Veuillez réessayer.",
          variant: "destructive"
        });
      }
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
      const success = await supabaseEventService.deleteEvent(id);
      
      if (success) {
        toast({
          title: "Événement supprimé",
          description: "L'événement a été retiré du calendrier.",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'événement. Veuillez réessayer.",
          variant: "destructive"
        });
      }
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
    </div>
  );
};

export default CalendarPage;
