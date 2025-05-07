
import React, { useState, useEffect } from "react";
import { CheckCircle, WifiOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SyncIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnected, setIsConnected] = useState(true);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Test connection to Supabase
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('events').select('count', { count: 'exact', head: true });
        setIsConnected(!error);
      } catch (e) {
        setIsConnected(false);
      }
    };
    
    // Test connection periodically
    testConnection();
    const interval = setInterval(testConnection, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);
  
  // Sync status
  let icon;
  let label;
  let colorClass;
  
  if (!isOnline) {
    icon = <WifiOff className="h-4 w-4" />;
    label = "Offline";
    colorClass = "text-yellow-600 bg-yellow-100";
  } else if (!isConnected) {
    icon = <Loader2 className="h-4 w-4 animate-spin" />;
    label = "Connecting...";
    colorClass = "text-blue-600 bg-blue-100";
  } else {
    icon = <CheckCircle className="h-4 w-4" />;
    label = "Synced";
    colorClass = "text-green-600 bg-green-100";
  }
  
  return (
    <div className={`flex items-center gap-1 text-xs py-1 px-2 rounded-full ${colorClass}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
};

export default SyncIndicator;
