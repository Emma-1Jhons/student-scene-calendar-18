
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EventFormData } from "@/types/eventTypes";

// Import smaller components
import TextField from "./FormComponents/TextField";
import DatePickerField from "./FormComponents/DatePickerField";
import TimeFieldsGroup from "./FormComponents/TimeFieldsGroup";
import ImageUpload from "./FormComponents/ImageUpload";
import { useEventForm } from "./FormComponents/EventFormLogic";

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
  const {
    formData,
    errors,
    imagePreview,
    handleChange,
    handleDateChange,
    handleImageUpload,
    clearImage,
    handleSubmit
  } = useEventForm({ onSubmit, onClose, initialDate });
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <TextField
            id="title"
            name="title"
            label="Event Title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
            required
            error={errors.title}
          />
          
          <TextField
            id="clubName"
            name="clubName"
            label="Club Name"
            value={formData.clubName}
            onChange={handleChange}
            placeholder="Enter club or organization name"
            required
            error={errors.clubName}
          />
          
          <DatePickerField
            date={formData.date}
            onDateChange={handleDateChange}
            error={errors.date}
          />
          
          <TimeFieldsGroup
            startTime={formData.startTime || ""}
            endTime={formData.endTime || ""}
            onChange={handleChange}
            startTimeError={errors.startTime}
            endTimeError={errors.endTime}
            required={true}
          />
          
          <TextField
            id="location"
            name="location"
            label="Location"
            value={formData.location || ""}
            onChange={handleChange}
            placeholder="Enter event location"
            required
            error={errors.location}
          />
          
          <TextField
            id="description"
            name="description"
            label="Description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Enter event description"
            multiline
            rows={3}
            required
            error={errors.description}
          />
          
          <ImageUpload
            imagePreview={imagePreview}
            onImageUpload={handleImageUpload}
            onClearImage={clearImage}
            imageUrlValue={!imagePreview ? formData.image || "" : ""}
            onImageUrlChange={handleChange}
            error={errors.imageFile}
            imageUrlDisabled={!!imagePreview}
          />
          
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
