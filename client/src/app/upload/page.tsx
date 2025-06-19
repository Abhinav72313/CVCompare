"use client";

import { FileUpload } from "@/components/FileUpload";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileContext } from "@/contexts/fileContext";
import { useSession } from "@/contexts/sessionContext";
import { resumeAnalysisSchema } from "@/lib/schemas";
import { BarChart3, Briefcase, FileText } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UploadPage() {
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {setFiles, setResumeHash, setJDHash} = useFileContext();
  const {sessionId} = useSession()

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setError("Please upload a resume and enter a job description");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('job_description', jobDescription);
    formData.append('session_id', sessionId);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Validate response with zod schema
      const validatedResult = resumeAnalysisSchema.parse(result.analysis);
      
      // Store analysis result and file data
      localStorage.setItem('analysisResult', JSON.stringify(validatedResult));
      localStorage.setItem('resumeFileName', resumeFile.name);
      localStorage.setItem('jobDescription', jobDescription);
      
      setFiles(resumeFile);
      setResumeHash(result.resume_hash);
      setJDHash(result.jd_hash);
      
      // Navigate to analysis page
      router.push('/analysis');
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

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
                <FileUpload 
                  label="Upload Resume"
                  onFileSelect={setResumeFile} 
                />
                {resumeFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {resumeFile.name} uploaded successfully
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
                  Get detailed insights about how well your resume matches the job requirements
                </p>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={!resumeFile || !jobDescription.trim() || isAnalyzing}
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
