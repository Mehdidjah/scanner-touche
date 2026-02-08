import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export function ImageUpload({ onImageSelect, selectedImage, onClear }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG image.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        onImageSelect(file, preview);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (selectedImage) {
    return (
      <div className="relative group">
        <div className="relative overflow-hidden border-2 border-border bg-card">
          <img
            src={selectedImage}
            alt="Preview"
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={onClear}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Remove Image
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="w-4 h-4" />
          <span>Image ready for analysis</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed transition-all duration-200 cursor-pointer",
        "bg-card hover:bg-accent/30 h-64 md:h-80",
        isDragging ? "border-primary bg-accent/50 scale-[1.02]" : "border-border"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Upload facial image"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className={cn(
          "w-16 h-16 flex items-center justify-center border-2 transition-colors",
          isDragging ? "border-primary text-primary" : "border-muted text-muted-foreground"
        )}>
          <Upload className="w-8 h-8" />
        </div>
        
        <div>
          <p className="font-semibold text-foreground">
            {isDragging ? "Drop your image here" : "Upload your facial photo"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Drag & drop or click to browse
          </p>
        </div>
        
        <div className="text-xs text-muted-foreground">
          JPG or PNG • Max 10MB
        </div>
      </div>
    </div>
  );
}
