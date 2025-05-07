
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CalendarDays, Users, School } from "lucide-react";

const CoverPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-b from-background to-muted/50">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <img 
              src="/lovable-uploads/d50f5daa-4070-437e-a1af-9fb7ac666d49.png" 
              alt="Logo ENSA Kenitra" 
              className="h-24 w-auto mb-4"
            />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Calendrier des Événements ENSAK
            </h1>
            <p className="text-xl text-muted-foreground max-w-[42rem]">
              Bienvenue sur la plateforme dédiée aux étudiants et aux clubs de 
              l'École Nationale des Sciences Appliquées de Kénitra (ENSAK).
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm">
              <School className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Notre Mission</h3>
              <p className="text-muted-foreground text-center">
                Faciliter l'organisation et la découverte des événements académiques 
                et extrascolaires au sein de notre établissement.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm">
              <Users className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Pour les Clubs</h3>
              <p className="text-muted-foreground text-center">
                Un espace centralisé pour promouvoir vos activités et toucher 
                un maximum d'étudiants intéressés.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-card rounded-lg border shadow-sm">
              <CalendarDays className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Pour les Étudiants</h3>
              <p className="text-muted-foreground text-center">
                Restez informés des prochains événements sur le campus et ne manquez 
                aucune opportunité enrichissante.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/calendar">Accéder au Calendrier</Link>
            </Button>
          </div>
        </div>
      </div>
      
      <footer className="border-t py-6 bg-background">
        <div className="container flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ENSAK - École Nationale des Sciences Appliquées de Kénitra
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CoverPage;
