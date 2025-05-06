
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AirtableService from "@/services/airtableService";

interface AirtableConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AirtableConfigDialog: React.FC<AirtableConfigDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [baseId, setBaseId] = useState("");
  const [tableName, setTableName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const airtableService = AirtableService.getInstance();

  useEffect(() => {
    if (isOpen) {
      // Charger la configuration existante si disponible
      const savedConfig = localStorage.getItem("airtable_config");
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          setApiKey(config.apiKey || "");
          setBaseId(config.baseId || "");
          setTableName(config.tableName || "");
        } catch (error) {
          console.error("Erreur lors du chargement de la configuration:", error);
        }
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!apiKey || !baseId || !tableName) {
      toast({
        title: "Erreur de configuration",
        description: "Tous les champs sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = airtableService.configure({
        apiKey,
        baseId,
        tableName,
      });

      if (success) {
        toast({
          title: "Configuration réussie",
          description: "Connexion à Airtable établie avec succès.",
        });
        onClose();
      } else {
        toast({
          title: "Erreur de configuration",
          description: "Impossible de se connecter à Airtable avec ces paramètres.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la configuration:", error);
      toast({
        title: "Erreur de configuration",
        description: "Une erreur s'est produite lors de la configuration d'Airtable.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configuration d'Airtable</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">Clé API Airtable</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Entrez votre clé API Airtable"
              type="password"
            />
            <p className="text-xs text-muted-foreground">
              Trouvable dans votre compte Airtable sous "Account" &gt; "API"
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="baseId">ID de la Base</Label>
            <Input
              id="baseId"
              value={baseId}
              onChange={(e) => setBaseId(e.target.value)}
              placeholder="ex: app12345abcdef"
            />
            <p className="text-xs text-muted-foreground">
              Visible dans l'URL de votre base: airtable.com/{"{baseId}"}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tableName">Nom de la Table</Label>
            <Input
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="ex: Events"
            />
            <p className="text-xs text-muted-foreground">
              Nom exact de la table contenant vos événements
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Configuration..." : "Configurer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AirtableConfigDialog;
