
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage/LandingPage";
import CalendarPage from "./pages/CalendarPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import EventService from "./services/eventService";

const queryClient = new QueryClient();

const App = () => {
  // Initialisation du service d'événements lors du chargement de l'application
  useEffect(() => {
    // Précharger le service pour garantir qu'il commence à synchroniser dès le début
    EventService.getInstance();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
