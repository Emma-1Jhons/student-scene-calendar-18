
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
import { Calendar, Clock, MapPin, Trash } from "lucide-react";
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
  
  const handleDelete = () => {
    if (event) {
      onDelete(event.id);
      setShowDeleteDialog(false);
      onClose();
    }
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
            <DialogTitle className="text-xl">{event.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                {event.clubName}
              </Badge>
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
