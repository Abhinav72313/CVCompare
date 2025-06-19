"use client";

import { FileUpload } from "@/components/FileUpload";
import { JobDescriptionInput } from "@/components/JobDescriptionInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileContext } from "@/contexts/fileContext";
import { useSession } from "@/contexts/sessionContext";
import { resumeAnalysisSchema } from "@/lib/schemas";
import { BarChart3, Briefcase, FileText } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useState } from 'react';



export default function Home() {
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
      
      const {analysis,resume_hash,jd_hash} = result
      console.log({analysis, resume_hash, jd_hash});
      const parsed = resumeAnalysisSchema.parse(analysis);

      setFiles(resumeFile);      
      setResumeHash(resume_hash);
      setJDHash(jd_hash);

      // Store the analysis data and file for the analysis page
      localStorage.setItem('analysisResult', JSON.stringify(parsed));
      localStorage.setItem('resumeFileName', resumeFile.name);
      localStorage.setItem('jobDescription', jobDescription);
      localStorage.setItem('resumeHash', resume_hash);
      localStorage.setItem('jdHash', jd_hash);

      // Navigate to analysis page
      router.push('/analysis');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Resume Fitter
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get detailed insights on how well your resume matches job descriptions and improve your ATS score
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Step Indicators */} {/* <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-sm font-medium">Upload Resume</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm font-medium">Add Job Description</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm font-medium text-gray-500">Get Analysis</span>
            </div>
          </div> */}

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Your Resume
              </CardTitle>
              <CardDescription>
                Upload your resume in PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onFileSelect={setResumeFile}
                label="Upload Resume"
              />
            </CardContent>
          </Card>

          {/* Job Description Section */}
          <JobDescriptionInput
            value={jobDescription}
            onChange={setJobDescription}
          />

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Analyze Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleAnalyze}
              disabled={!resumeFile || !jobDescription.trim() || isAnalyzing}
              size="lg"
              className="px-8"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
