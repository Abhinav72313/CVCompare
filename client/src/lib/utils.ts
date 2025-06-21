import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { deleteUploadThingFile } from "./server-actions";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function deleteFile(fileUrl: string) {
  try {
    const fileKey = fileUrl.split("/").pop() || "";
    if (!fileKey) {
      throw new Error("Invalid file URL");
    }
    
    // Use server action to delete the file
    const result = await deleteUploadThingFile(fileKey);
    
    if (!result) {
      throw new Error('Failed to delete file');
    }

    return result;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}