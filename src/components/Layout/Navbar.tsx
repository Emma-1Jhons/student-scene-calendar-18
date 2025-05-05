
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";

interface NavbarProps {
  onAddEvent: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAddEvent }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarPlus className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Campus Events Calendar</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button onClick={onAddEvent} className="flex items-center gap-2">
            <CalendarPlus size={18} />
            <span>Add Event</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
