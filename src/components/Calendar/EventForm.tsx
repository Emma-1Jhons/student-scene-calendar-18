
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X } from "lucide-react";
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
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
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, imageFile: "Please upload an image file" }));
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imageFile: "Image must be less than 5MB" }));
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
        // Store both the data URL and the file
        setFormData(prev => ({ 
          ...prev, 
          image: event.target?.result as string,
          imageFile: file
        }));
      }
    };
    reader.readAsDataURL(file);
    
    // Clear any errors
    if (errors.imageFile) {
      setErrors(prev => ({ ...prev, imageFile: "" }));
    }
  };
  
  const clearImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: "", imageFile: undefined }));
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
      setImagePreview(null);
      
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
            <Label>Event Image</Label>
            <div className="grid gap-4">
              {imagePreview ? (
                <div className="relative rounded-md overflow-hidden border border-input">
                  <img 
                    src={imagePreview} 
                    alt="Event preview" 
                    className="max-h-48 w-full object-contain" 
                  />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-input rounded-md p-6">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                  <label className="cursor-pointer mt-2">
                    <Input
                      id="imageFile"
                      name="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button type="button" variant="secondary" size="sm">
                      Select Image
                    </Button>
                  </label>
                </div>
              )}
              {errors.imageFile && <p className="text-sm text-destructive">{errors.imageFile}</p>}
              
              <div className="flex items-center">
                <div className="h-px flex-1 bg-border"></div>
                <span className="px-2 text-xs text-muted-foreground">OR</span>
                <div className="h-px flex-1 bg-border"></div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Image URL (optional)</Label>
                <Input
                  id="image"
                  name="image"
                  value={!imagePreview ? formData.image : ""}
                  onChange={handleChange}
                  placeholder="Enter image URL"
                  disabled={!!imagePreview}
                />
              </div>
            </div>
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
