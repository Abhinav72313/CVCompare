"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Briefcase, Calculator, Code, FileText, GraduationCap } from "lucide-react";

interface ATSScoreDisplayProps {
  calculatedScore: number;
  sectionScores: SectionScore[];
}

export function ATSScoreDisplay({ calculatedScore,  sectionScores }: ATSScoreDisplayProps) {
  

  const sections = [
    { name: 'Education', score: sectionScores.find(section => section.name === 'Education')?.score || 0, icon: GraduationCap, weight: sectionScores.find(section => section.name === 'Education')?.weight || 0 },
    { name: 'Work Experience', score: sectionScores.find(section => section.name === 'Work Experience')?.score || 0, icon: Briefcase, weight: sectionScores.find(section => section.name === 'Work Experience')?.weight || 0 },
    { name: 'Skills & Projects', score: sectionScores.find(section => section.name === 'Skills & Projects')?.score || 0, icon: Code, weight: sectionScores.find(section => section.name === 'Skills & Projects')?.weight || 0 },
    { name: 'Certifications', score: sectionScores.find(section => section.name === 'Certifications')?.score || 0, icon: Award, weight: sectionScores.find(section => section.name === 'Certifications')?.weight || 0 },
    { name: 'Summary', score: sectionScores.find(section => section.name === 'Summary')?.score || 0, icon: FileText, weight: sectionScores.find(section => section.name === 'Summary')?.weight || 0 },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calculator className="h-6 w-6 text-blue-600" />
          ATS Score Calculation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-blue-600 mb-2">{Math.round(calculatedScore)}%</div>
          <p className="text-sm text-gray-600 mb-4">Final ATS Score</p>
          <Progress value={calculatedScore} className="w-full h-3" />
        </div>
        
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const sectionScore = Math.round(section.score);
            return (
              <div key={section.name} className="flex items-center gap-4">
                <Icon className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{section.name}</span>
                    <span className="text-sm text-gray-600">Weight: {(section.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={sectionScore} className="flex-1 h-2" />
                    <span className="text-sm font-medium w-12 text-right">{sectionScore}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
