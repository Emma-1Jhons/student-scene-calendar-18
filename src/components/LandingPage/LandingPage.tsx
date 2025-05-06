
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-secondary/50 to-background p-4">
      <div className="max-w-4xl w-full bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side with logo and school info */}
          <div className="w-full md:w-2/5 bg-primary p-8 flex flex-col items-center justify-center text-primary-foreground">
            <div className="mb-6">
              <img 
                src="/lovable-uploads/d50f5daa-4070-437e-a1af-9fb7ac666d49.png" 
                alt="ENSA Kenitra Logo" 
                className="w-64 h-auto"
              />
            </div>
            <h2 className="text-xl font-bold mb-2 text-center">École Nationale des Sciences Appliquées</h2>
            <p className="text-center mb-4">National School of Applied Science - ENSAK</p>
            <p className="text-center text-sm italic">Université Ibn Tofail Kenitra</p>
          </div>
          
          {/* Right side with welcome text */}
          <div className="w-full md:w-3/5 p-8">
            <h1 className="text-3xl font-bold mb-6 text-foreground">Campus Events Calendar</h1>
            
            <div className="prose prose-sm mb-8">
              <p className="mb-4">
                Welcome to the official event platform for students and clubs of ENSAK!
              </p>
              <p className="mb-4">
                This platform is dedicated to organizing and promoting events hosted by various clubs 
                and organizations within our school community.
              </p>
              <p className="mb-4">
                Here you can:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Browse upcoming events on campus</li>
                <li>Create and publish your own club events</li>
                <li>Stay informed about activities and opportunities</li>
                <li>Connect with the vibrant ENSAK community</li>
              </ul>
              <p>
                All announcements and events published here are visible to the entire ENSAK community,
                making it the perfect place to showcase your club's activities.
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate("/calendar")} 
                className="px-8 py-6 text-lg"
              >
                Enter Calendar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
