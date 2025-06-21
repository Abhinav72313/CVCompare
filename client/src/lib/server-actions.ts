'use server'

import { UTApi } from "uploadthing/server";

// UTApi will automatically use UPLOADTHING_SECRET or UPLOADTHING_TOKEN from environment
const utapi = new UTApi();

export async function deleteUploadThingFile(fileKey: string) {
  try {
    console.log("Server: Deleting file with key:", fileKey);

    // Check if we have the necessary environment variables
    if (!process.env.UPLOADTHING_SECRET && !process.env.UPLOADTHING_TOKEN) {
      throw new Error("UploadThing credentials not found in environment variables");
    }
    
    const result = await utapi.deleteFiles([fileKey]);
    console.log("Server: Delete result:", result);

    return true;
  } catch (error) {
    console.error("Server: Error deleting file:", error);
    return false;
  }
}
