
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  imagePreview: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  imageUrlValue: string;
  onImageUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  imageUrlDisabled: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  imagePreview,
  onImageUpload,
  onClearImage,
  imageUrlValue,
  onImageUrlChange,
  error,
  imageUrlDisabled
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleButtonClick = () => {
    // Trigger the hidden file input when the button is clicked
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileInput = fileInputRef.current;
      if (fileInput) {
        // Create a new event with the dropped file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(e.dataTransfer.files[0]);
        fileInput.files = dataTransfer.files;
        
        // Trigger the change event manually
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
        
        // Call the onImageUpload function with a synthetic event
        onImageUpload({ target: { files: dataTransfer.files } } as any);
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
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
              onClick={onClearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-input rounded-md p-6 cursor-pointer"
            onClick={handleButtonClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
            <input
              ref={fileInputRef}
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
            <Button type="button" variant="secondary" size="sm" onClick={(e) => {
              e.stopPropagation(); // Prevent the div's onClick from firing
              handleButtonClick();
            }}>
              Select Image
            </Button>
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        
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
            value={imageUrlValue}
            onChange={onImageUrlChange}
            placeholder="Enter image URL"
            disabled={imageUrlDisabled}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
