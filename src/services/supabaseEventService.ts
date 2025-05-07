
import { supabase } from "@/integrations/supabase/client";
import { Event, EventFormData } from "@/types/eventTypes";

// Conversion functions between Supabase and app data formats
const fromSupabaseEvent = (item: any): Event => {
  return {
    id: item.id,
    title: item.title,
    description: item.description || "",
    clubName: item.club_name,
    date: new Date(item.date),
    startTime: item.start_time || "",
    endTime: item.end_time || "",
    location: item.location || "",
    image: item.image || "",
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  };
};

const toSupabaseEvent = (event: EventFormData): any => {
  return {
    title: event.title,
    description: event.description,
    club_name: event.clubName,
    date: event.date.toISOString().split('T')[0],
    start_time: event.startTime,
    end_time: event.endTime,
    location: event.location,
    image: event.image
  };
};

class SupabaseEventService {
  // Fetch all events
  async getAllEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        return [];
      }

      return data.map(fromSupabaseEvent);
    } catch (error) {
      console.error("Error in getAllEvents:", error);
      return [];
    }
  }

  // Add a new event
  async addEvent(eventData: EventFormData): Promise<Event | null> {
    try {
      const supabaseData = toSupabaseEvent(eventData);
      
      const { data, error } = await supabase
        .from('events')
        .insert([supabaseData])
        .select()
        .single();

      if (error) {
        console.error("Error adding event:", error);
        return null;
      }

      return fromSupabaseEvent(data);
    } catch (error) {
      console.error("Error in addEvent:", error);
      return null;
    }
  }

  // Delete an event
  async deleteEvent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting event:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteEvent:", error);
      return false;
    }
  }

  // Listen for realtime updates
  subscribeToEvents(callback: (events: Event[]) => void): () => void {
    // Initial load
    this.getAllEvents().then(callback);

    // Set up realtime listener
    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'events' 
        }, 
        () => {
          // On any change, reload all events
          this.getAllEvents().then(callback);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}

// Singleton instance
const supabaseEventService = new SupabaseEventService();
export default supabaseEventService;
