
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Trash, Share2 } from "lucide-react";
import { Event } from "@/types/eventTypes";
import { formatEventDate, formatEventTime } from "@/utils/eventUtils";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface EventDetailsProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ 
  event, 
  isOpen, 
  onClose,
  onDelete
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const { toast } = useToast();
  
  const handleDelete = () => {
    if (event) {
      onDelete(event.id);
      setShowDeleteDialog(false);
      onClose();
    }
  };
  
  const handleShare = () => {
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

  if (!event) return null;

  const hasTimeInfo = event.startTime || event.endTime;
  const timeDisplay = hasTimeInfo 
    ? `${formatEventTime(event.startTime)} ${event.endTime ? `- ${formatEventTime(event.endTime)}` : ""}`
    : "All day";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-black">{event.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {event.clubName}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShare}
                className="flex items-center gap-1"
              >
                <Share2 size={14} />
                <span>Partager</span>
              </Button>
            </div>
            
            {event.image && (
              <div className="overflow-hidden rounded-md">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-auto object-cover" 
                />
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={18} />
                <span>{formatEventDate(event.date)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={18} />
                <span>{timeDisplay}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={18} />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
            
            {event.description && (
              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="destructive" 
              className="flex items-center gap-2"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash size={16} />
              <span>Delete</span>
            </Button>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event "{event.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventDetails;
