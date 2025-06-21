"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UploadButton } from '@/lib/uploadthing';
import { deleteFile } from '@/lib/utils';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface UploadThingFileUploadProps {
  setFileUrl: (url: string | null) => void;
  setFileName: (name: string | null) => void;
  label: string;
}

interface UploadedFile {
  url: string;
  name: string;
  size: number;
  key: string;
}

export const UploadThingFileUpload: React.FC<UploadThingFileUploadProps> = ({
  setFileUrl,
  setFileName,
  label
}) => {
  const [selectedFile, setSelectedFile] = useState<{ file: File; url: string } | null>(null);
  const [isdeleteing, setIsDeleting] = useState(false);

  const handleUploadComplete = (files: UploadedFile[]) => {
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      // Create a File object for compatibility
      const file = new File([], uploadedFile.name, { type: 'application/pdf' });

      setSelectedFile({ file, url: uploadedFile.url });
      setFileUrl(uploadedFile.url);
      toast.success('Resume uploaded successfully!');
    }
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
    setFileUrl(null);
    setFileName(null);
    setIsDeleting(false);
    toast.error('Failed to upload resume. Please try again.');
  };

  const handleUploadBegin = (fileName: string) => {
    setFileName(fileName);
  };

  const handleRemoveFile = async () => {
    setIsDeleting(true);
    if (selectedFile) {
      await deleteFile(selectedFile.url);
    }

    setSelectedFile(null);
    setFileUrl(null);
    setFileName(null);
    setIsDeleting(false);

    toast.success('Resume removed successfully!');
    // You might want to call a callback to notify parent component
  };

  return (
    <div className="w-full">
      {selectedFile ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{selectedFile.file.name}</p>
                  <p className="text-sm text-green-600">Upload successful</p>
                </div>
              </div>
              {isdeleteing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-gray-300 hover:border-primary/50 transition-colors">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4 text-center">

              <Upload className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">Upload your resume in PDF format</p>
                <p className="text-xs text-muted-foreground mt-1">Maximum file size: 8MB</p>
              </div>
              <UploadButton
                endpoint="resumeUploader"
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                onUploadBegin={handleUploadBegin}
                appearance={{
                  button: "bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md transition-colors",
                  allowedContent: "text-xs text-muted-foreground mt-2",
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
