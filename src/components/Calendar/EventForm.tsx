
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EventFormData } from "@/types/eventTypes";
import { useToast } from "@/hooks/use-toast";

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
  initialDate?: Date;
}

const EventForm: React.FC<EventFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialDate 
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    clubName: "",
    date: initialDate || new Date(),
    startTime: "",
    endTime: "",
    location: "",
    image: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
      if (errors.date) {
        setErrors(prev => ({ ...prev, date: "" }));
      }
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.clubName.trim()) {
      newErrors.clubName = "Club name is required";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    
    // Validate time format if provided
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (formData.startTime && !timeRegex.test(formData.startTime)) {
      newErrors.startTime = "Use format HH:MM (24-hour)";
    }
    
    if (formData.endTime && !timeRegex.test(formData.endTime)) {
      newErrors.endTime = "Use format HH:MM (24-hour)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      toast({
        title: "Event created",
        description: "Your event has been added to the calendar",
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        clubName: "",
        date: new Date(),
        startTime: "",
        endTime: "",
        location: "",
        image: "",
      });
      
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="required">Event Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clubName" className="required">Club Name</Label>
            <Input
              id="clubName"
              name="clubName"
              value={formData.clubName}
              onChange={handleChange}
              placeholder="Enter club or organization name"
              className={errors.clubName ? "border-destructive" : ""}
            />
            {errors.clubName && <p className="text-sm text-destructive">{errors.clubName}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date" className="required">Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    errors.date ? "border-destructive" : ""
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(formData.date, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={handleDateChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time (HH:MM)</Label>
              <Input
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                placeholder="e.g. 14:30"
                className={errors.startTime ? "border-destructive" : ""}
              />
              {errors.startTime && <p className="text-sm text-destructive">{errors.startTime}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time (HH:MM)</Label>
              <Input
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                placeholder="e.g. 16:00"
                className={errors.endTime ? "border-destructive" : ""}
              />
              {errors.endTime && <p className="text-sm text-destructive">{errors.endTime}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter event location"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter event description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Image URL (optional)</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Enter image URL"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
