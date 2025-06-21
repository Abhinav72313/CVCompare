"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn } from "@clerk/nextjs";
import { CheckCircle, FileText, Target, Upload, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Optimize Your Resume for
            <span className="text-blue-600"> Any Job</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered resume analysis that helps you tailor your resume to specific job descriptions, 
            increasing your chances of landing interviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button size="lg" className="px-8 py-3">
                Analyze Resume Now
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose CVCompare?
          </h2>
          <p className="text-lg text-gray-600">
            Get detailed insights and actionable recommendations to improve your resume
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Smart Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI-powered analysis that compares your resume against job descriptions 
                and identifies missing keywords and skills.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>ATS Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Optimize your resume for Applicant Tracking Systems with 
                detailed scoring and improvement suggestions.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Instant Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get immediate feedback with actionable recommendations 
                to improve your resume&apos;s effectiveness.
              </p>
            </CardContent>
          </Card>
        </div>      </div>

      {/* User Dashboard Section (for signed-in users) */}
      <SignedIn>
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome Back!
              </h2>
              <p className="text-lg text-gray-600">
                Continue improving your resume or view your analysis history
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="text-center">
                <CardHeader>
                  <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>Upload New Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    Analyze a new resume against job descriptions and get personalized feedback.
                  </p>
                  <Link href="/upload">
                    <Button className="w-full">
                      <Upload className="mr-2 h-4 w-4" />
                      Start New Analysis
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>View Analysis History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    Review your previous analyses and track your progress over time.
                  </p>
                  <Link href="/history">
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      View History
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SignedIn>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Land Your Dream Job?
          </h2>          <p className="text-xl mb-8 opacity-90">
            Join thousands of job seekers who have improved their resume with CVCompare
          </p>
          <Link href="/upload">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Start Your Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FileText className="h-6 w-6" />
              <span className="ml-2 font-semibold">CVCompare</span>
            </div>
            <p className="text-gray-400">
              © 2025 CVCompare. All rights reserved.            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
