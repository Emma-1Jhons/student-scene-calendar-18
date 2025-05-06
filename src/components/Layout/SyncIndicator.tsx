
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AirtableService, { SYNC_DELAY_MS } from "@/services/airtableService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Fonction pour formater le temps écoulé
const formatLastSync = (timestamp: number): string => {
  if (timestamp === 0) return "Jamais";
  
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: fr
  });
};

const SyncIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<string>("idle");
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [isConfigured, setIsConfigured] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState<string>("");
  const airtableService = AirtableService.getInstance();
  
  useEffect(() => {
    // Vérifier si Airtable est configuré
    setIsConfigured(airtableService.isConfigured());
    
    // Écouteur pour la synchronisation
    const syncListener = (status: string) => {
      setSyncStatus(status);
      if (status === "success" || status === "error") {
        updateLastSyncTime();
      }
    };
    
    // Écouteur pour la configuration
    const configListener = (configured: boolean) => {
      setIsConfigured(configured);
    };
    
    // Mettre à jour l'heure de la dernière synchronisation
    const updateLastSyncTime = () => {
      const status = airtableService.getSyncStatus();
      setLastSyncTime(status.lastSyncTime);
      
      if (status.lastSyncTime > 0) {
        const formattedTime = formatLastSync(status.lastSyncTime);
        setTimeDisplay(formattedTime);
      } else {
        setTimeDisplay("Jamais");
      }
    };
    
    // Mise à jour périodique de l'affichage du temps
    const intervalId = setInterval(() => {
      if (lastSyncTime > 0) {
        setTimeDisplay(formatLastSync(lastSyncTime));
      }
    }, 30000); // Mettre à jour toutes les 30 secondes
    
    // Ajouter les écouteurs
    airtableService.addSyncListener(syncListener);
    airtableService.addConfigListener(configListener);
    
    // Initialisation
    updateLastSyncTime();
    
    return () => {
      clearInterval(intervalId);
      airtableService.removeSyncListener(syncListener);
      airtableService.removeConfigListener(configListener);
    };
  }, [lastSyncTime]);
  
  // Déterminer le statut visuel
  const getBadgeStatus = () => {
    if (!isConfigured) return "not-configured";
    if (syncStatus === "syncing") return "syncing";
    if (syncStatus === "error") return "error";
    
    // Si la dernière synchronisation est trop ancienne
    const timeSinceLastSync = Date.now() - lastSyncTime;
    if (timeSinceLastSync > SYNC_DELAY_MS * 2) {
      return "outdated";
    }
    
    return "synced";
  };
  
  const status = getBadgeStatus();
  
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={
              status === "synced" ? "default" :
              status === "syncing" ? "outline" :
              status === "error" || status === "outdated" ? "destructive" :
              "secondary"
            }
            className="flex items-center gap-1 cursor-help"
          >
            {status === "syncing" && (
              <RefreshCw size={14} className="animate-spin" />
            )}
            {status === "synced" && (
              <CheckCircle size={14} />
            )}
            {status === "error" && (
              <XCircle size={14} />
            )}
            {status === "outdated" && (
              <AlertCircle size={14} />
            )}
            {status === "not-configured" && (
              <AlertCircle size={14} />
            )}
            <span>
              {status === "syncing" && "Synchronisation..."}
              {status === "synced" && "Synchronisé"}
              {status === "error" && "Erreur de sync"}
              {status === "outdated" && "Sync. expirée"}
              {status === "not-configured" && "Non configuré"}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {isConfigured ? (
            <>
              <p>Dernière synchronisation: {timeDisplay}</p>
              <p className="text-xs mt-1">
                Les modifications sont visibles par tous les utilisateurs après synchronisation (délai max: 1 minute).
              </p>
            </>
          ) : (
            <p>Airtable n'est pas encore configuré. Configurez-le pour synchroniser les événements.</p>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default SyncIndicator;
