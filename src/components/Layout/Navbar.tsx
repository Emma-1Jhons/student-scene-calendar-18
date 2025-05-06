
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Home } from "lucide-react";
import { Link } from "react-router-dom";
import SyncIndicator from "./SyncIndicator";

interface NavbarProps {
  onAddEvent: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAddEvent }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/d50f5daa-4070-437e-a1af-9fb7ac666d49.png" 
            alt="ENSA Kenitra Logo" 
            className="h-8 w-auto"
          />
          <h1 className="text-xl font-bold">ENSAK Events Calendar</h1>
          <div className="hidden sm:flex">
            <SyncIndicator />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home size={18} />
              <span className="hidden sm:inline">Accueil</span>
            </Link>
          </Button>
          <Button onClick={onAddEvent} className="flex items-center gap-2">
            <CalendarPlus size={18} />
            <span className="hidden sm:inline">Ajouter</span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
