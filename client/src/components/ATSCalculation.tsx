"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  type ATSWeights,
  calculateCertificationScore,
  calculateDynamicATSScore,
  calculateEducationScore,
  calculateProjectScore,
  calculateSkillsScore,
  calculateSummaryScore,
  calculateWorkExperienceScore,
  defaultWeights
} from '@/lib/atsCalculations';
import { ResumeAnalysis } from '@/lib/schemas';
import {
  getCertificationDetails,
  getEducationDetails,
  getProjectDetails,
  getSkillsDetails,
  getSummaryDetails,
  getWorkExperienceDetails
} from '@/lib/sectionDetails';
import { Brain, Briefcase, FileText, GraduationCap, Ribbon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ATSScoreDisplay } from './ATSScoreDisplay';
import { FormulaExplanation } from './FormulaExplanation';
import { SectionBreakdown } from './SectionBreakdown';
import { WeightControls } from './WeightControls';
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { useSearchParams } from "next/navigation";

interface ATSCalculationProps {
  analysis: ResumeAnalysis;
  calculatedScore: number;
  weights: ATSWeights|null;
  setWeights: (weights: ATSWeights) => void;
  w: { [key: string]: number };
  setCalculatedScore: (score: number) => void;
}

export function ATSCalculation({ analysis, calculatedScore,weights,setWeights,setCalculatedScore,w }: ATSCalculationProps) {
  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  // Local state for immediate UI updates
  const [localWeights, setLocalWeights] = useState<ATSWeights|null>(weights);
  const authfetch = useAuthenticatedFetch()
  const params = useSearchParams()

  const handleWeightChange = useCallback((section: keyof ATSWeights, value: number) => {
    // Update local weights immediately for responsive UI

    if(!localWeights) return;

    const newWeights = { ...localWeights };
    newWeights[section] = value / 100;
    
    setLocalWeights(newWeights);

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the expensive calculations
    debounceRef.current = setTimeout(async () => {
      // Calculate total weight
      let total = 0;
      for (const key in newWeights) {
        total += newWeights[key as keyof ATSWeights];
      }

      // Normalize weights to sum to 1.0
      if (total > 0) {
        const normalized: ATSWeights = { ...newWeights };
        for (const key in normalized) {
          normalized[key as keyof ATSWeights] = key != section ? newWeights[key as keyof ATSWeights] / total : newWeights[section];
        }
        setWeights(normalized);
        const score = calculateDynamicATSScore(analysis, normalized);
        setCalculatedScore(Math.round(score));
        setLocalWeights(normalized); // Sync local state with normalized weights

        const resume_hash = params.get('resume_hash') 
        const jd_hash = params.get('jd_hash')

        if (!resume_hash || !jd_hash) {
          return
        }

        await authfetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/set-score`, {
          method: 'POST',
          body: JSON.stringify({
            resume_hash: resume_hash,
            jd_hash: jd_hash,
            score: Math.round(score),
            weights: JSON.stringify(normalized)
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

      }
    }, 100); // 100ms debounce

  }, [localWeights, analysis, setWeights, setCalculatedScore]);
  // Sync local weights when props change


  useEffect(() => {

    setLocalWeights(weights);
    if(!weights) return;
    const score = calculateDynamicATSScore(analysis, weights);
    setCalculatedScore(Math.round(score));
  }, [weights]);


  const getSectionKey = (sectionName: string): keyof ATSWeights => {
    const keyMap: Record<string, keyof ATSWeights> = {
      'Education': 'education',
      'Work Experience': 'workExperience',
      'Skills & Projects': 'skills',
      'Certifications': 'certifications',
      'Summary': 'summary',
    };
    return keyMap[sectionName] || 'education';
  };
  const resetToDefaults = () => {
    setWeights(defaultWeights);
    setLocalWeights(defaultWeights);
  };

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No analysis data available for calculation</p>
        </CardContent>
      </Card>
    );
  }
  // Calculate individual section scores
  const getSectionScores = (): SectionScore[] => {
    if(!localWeights) return [];
    const educationScore = calculateEducationScore(analysis);
    const workExperienceScore = calculateWorkExperienceScore(analysis);
    const projectScore = calculateProjectScore(analysis);
    const skillsScore = calculateSkillsScore(analysis);
    const certificationScore = calculateCertificationScore(analysis);
    const summaryScore = calculateSummaryScore(analysis);    // Calculate combined skills score (60% skills, 40% projects)
    const combinedSkillsScore = (0.6 * skillsScore + 0.4 * projectScore);
    return [
      {
        name: "Education",
        score: w['education'] > 0 ? Math.round(educationScore * 100) : 0,
        weight: localWeights.education,
        weightedScore: educationScore * localWeights.education * 100,
        icon: <GraduationCap className="h-5 w-5" />,
        details: getEducationDetails(analysis),
        description: "Academic qualifications, degree relevance, and institution quality"
      },
      {
        name: "Work Experience",
        score: w['workExperience'] > 0 ? Math.round(workExperienceScore * 100) : 0,
        weight: localWeights.workExperience,
        weightedScore: workExperienceScore * localWeights.workExperience * 100,
        icon: <Briefcase className="h-5 w-5" />,
        details: getWorkExperienceDetails(analysis),
        description: "Job history relevance, years of experience, and role alignment"
      }, {
        name: "Skills & Projects",
        score: w['skills'] > 0 ? Math.round(combinedSkillsScore * 100) : 0,
        weight: localWeights.skills,
        weightedScore: (skillsScore + projectScore) * localWeights.skills * 100,
        icon: <Brain className="h-5 w-5" />,
        details: [...getSkillsDetails(analysis), ...getProjectDetails(analysis)],
        description: "Technical skills, projects, and demonstrated expertise"
      },
      {
        name: "Certifications",
        score: w['certification'] > 0 ? Math.round(certificationScore * 100) : 0,
        weight: localWeights.certifications,        weightedScore: certificationScore * localWeights.certifications * 100,
        icon: <Ribbon className="h-5 w-5" />,
        details: getCertificationDetails(analysis),
        description: "Professional certifications and industry credentials"
      },
      {
        name: "Summary",
        score: w['summary'] > 0 ? Math.round(summaryScore * 100) : 0,
        weight: localWeights.summary,
        weightedScore: summaryScore * localWeights.summary * 100,
        icon: <FileText className="h-5 w-5" />,
        details: getSummaryDetails(analysis),
        description: "Resume summary quality, keyword optimization, and customization"
      }
    ];
  };

  const sectionScores = getSectionScores();
  return (
    <div className="space-y-6">      {/* Overall Score */}
      <ATSScoreDisplay
        calculatedScore={calculatedScore}
        sectionScores={sectionScores}

      />

      {/* Weight Adjustment Controls */}
      <WeightControls
        sectionScores={sectionScores}
        onWeightChange={handleWeightChange}
        onResetToDefaults={resetToDefaults}
        getSectionKey={getSectionKey}
        
      />

      {/* Formula Explanation */}
      <FormulaExplanation />

      {/* Section Breakdown */}
      <SectionBreakdown sectionScores={sectionScores} />

     
    </div>
  );
}

