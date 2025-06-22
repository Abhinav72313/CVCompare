"use client";

import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadThingFileUpload } from "@/components/UploadThingFileUpload";
import { useFileContext } from "@/contexts/fileContext";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { useUser } from '@clerk/nextjs';
import { BarChart3, Briefcase, FileText } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useUser();
  const authenticatedFetch = useAuthenticatedFetch();
  const [jobDescription, setJobDescription] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {  setResumeHash, setJDHash } = useFileContext();

  const handleAnalyze = async () => {
    if (!fileUrl || !jobDescription.trim() || !fileName) {
      setError("Please upload a resume and enter a job description");
      return;
    }

    if (!user) {
      setError("Please sign in to analyze your resume");
      return;
    }

    if(!fileUrl){
      setError("Please upload a resume file first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    const formData = new FormData();
    formData.append('job_description', jobDescription);
    formData.append('file_url', fileUrl);
    formData.append('file_name', fileName); // Use the uploaded file name

    try {

      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/analysis/analyze-resume`, {
        method: 'POST',
        body: formData,
        headers: {
          'Origin': 'http://localhost:3000',
        }
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();

      setResumeHash(result.resume_hash);
      setJDHash(result.jd_hash);

      // Navigate to analysis page
      router.push('/analysis?resume_hash=' + result.resume_hash + '&jd_hash=' + result.jd_hash);

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Resume Analysis Tool
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Upload your resume and paste the job description to get AI-powered insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Resume Upload Section */}
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Upload Resume</CardTitle>
                <CardDescription>
                  Upload your resume in PDF format for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadThingFileUpload
                  label="Upload your resume (PDF only)"
                  setFileUrl={setFileUrl}
                  setFileName={setFileName}
                />
                {fileUrl && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {fileName} uploaded successfully
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Job Description Section */}
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>
                  Paste the job description you&apos;re applying for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JobDescriptionInput
                  value={jobDescription}
                  onChange={setJobDescription}
                />
              </CardContent>
            </Card>
          </div>

          {/* Analyze Button */}
          <div className="mt-8 text-center">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-gray-600 mb-6">
                  Get detailed insights about how well your resume matches the job requirements. This might take a few minutes
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={!fileUrl || !jobDescription.trim() || isAnalyzing}
                  size="lg"
                  className="px-8 py-3"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Resume'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
