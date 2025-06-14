import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  accept = ".pdf,.doc,.docx", 
  label 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <Card 
        className={`cursor-pointer transition-all hover:border-primary/50 ${
          isDragOver ? 'border-primary bg-primary/5' : ''
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-4 text-center">
            {selectedFile ? (
              <>
                <FileText className="h-12 w-12 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change File
                </Button>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">Click to browse or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports PDF files</p>
                </div>
                <Button variant="outline">
                  Choose File
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};