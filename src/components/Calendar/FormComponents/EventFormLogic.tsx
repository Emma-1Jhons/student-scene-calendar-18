
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { EventFormData } from "@/types/eventTypes";

interface UseEventFormProps {
  onSubmit: (data: EventFormData) => void;
  onClose: () => void;
  initialDate?: Date;
}

export const useEventForm = ({ onSubmit, onClose, initialDate }: UseEventFormProps) => {
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
    console.log("Image upload triggered", e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      console.log("Not an image file:", file.type);
      setErrors(prev => ({ ...prev, imageFile: "Please upload an image file" }));
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log("File too large:", file.size);
      setErrors(prev => ({ ...prev, imageFile: "Image must be less than 5MB" }));
      return;
    }
    
    console.log("Processing image file:", file.name);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        console.log("Image loaded successfully");
        setImagePreview(event.target.result as string);
        // Store both the data URL and the file
        setFormData(prev => ({ 
          ...prev, 
          image: event.target?.result as string,
          imageFile: file
        }));
      }
    };
    reader.onerror = () => {
      console.error("Error reading file");
      setErrors(prev => ({ ...prev, imageFile: "Error reading file" }));
    };
    reader.readAsDataURL(file);
    
    // Clear any errors
    if (errors.imageFile) {
      setErrors(prev => ({ ...prev, imageFile: "" }));
    }
  };
  
  const clearImage = () => {
    console.log("Clearing image");
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

  return {
    formData,
    errors,
    imagePreview,
    handleChange,
    handleDateChange,
    handleImageUpload,
    clearImage,
    handleSubmit
  };
};
