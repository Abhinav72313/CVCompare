"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  type ATSWeights,
  calculateCertificationScore,
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
import { ATSScoreDisplay } from './ATSScoreDisplay';
import { FormulaExplanation } from './FormulaExplanation';
import { SectionBreakdown } from './SectionBreakdown';
import { WeightControls } from './WeightControls';

interface ATSCalculationProps {
  analysis: ResumeAnalysis;
  calculatedScore: number;
  weights: ATSWeights;
  setWeights: (weights: ATSWeights) => void;
  w: { [key: string]: number };
}

export function ATSCalculation({ analysis, calculatedScore,weights,setWeights,w }: ATSCalculationProps) {

  // useEffect(() => {
  //   const w = {
  //     'education': analysis.education?.required_degrees_in_jd?.length ? 1 : 0,
  //     'workExperience': analysis.work_experience?.required_years ? 1 : 0,
  //     'skills': analysis.skills?.technical_skills?.required_from_jd?.length ? 1 : 0,
  //     'certifications': analysis.certifications?.required_certs_in_jd?.length ? 1 : 0,
  //     'summary': analysis.summary?.intent_matches_jd ? 1 : 0
  //   }

  //   setw(w);

  //   const normalizedWeights: ATSWeights = weights

  //     normalizedWeights.education = normalizedWeights.education * w['education'];
  //     normalizedWeights.workExperience = normalizedWeights.workExperience * w['workExperience'];
  //     normalizedWeights.skills = normalizedWeights.skills * w['skills'];
  //     normalizedWeights.certifications = normalizedWeights.certifications * w['certifications'];
  //     normalizedWeights.summary = normalizedWeights.summary * w['summary'];

  //     let total = 0;
  //     for (const key in normalizedWeights) {
  //       total += normalizedWeights[key as keyof ATSWeights];
  //     }

  //     for (const key in normalizedWeights) {
  //       normalizedWeights[key as keyof ATSWeights] = normalizedWeights[key as keyof ATSWeights] / total;
  //     }


  //   setWeights(normalizedWeights)

  // }, [])

  // useEffect(() => {
  //   const newScore = Math.round(calculateDynamicATSScore(analysis, weights));
  //   setCalculatedScore(newScore);

  // }, [analysis, weights]);

  const handleWeightChange = (section: keyof ATSWeights, value: number) => {
    const newWeights = { ...weights };
    newWeights[section] = value / 100;
    // Calculate total weight
    let total = 0;
    for (const key in newWeights) {
      total += newWeights[key as keyof ATSWeights];
    }

    // Normalize weights to sum to 1.0
    if (total > 0) {
      const normalized: ATSWeights = { ...newWeights };
      for (const key in normalized) {
        normalized[key as keyof ATSWeights] = newWeights[key as keyof ATSWeights] / total;
      }
      setWeights(normalized);
    }
  };
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
        weight: weights.education,
        weightedScore: educationScore * weights.education * 100,
        icon: <GraduationCap className="h-5 w-5" />,
        details: getEducationDetails(analysis),
        description: "Academic qualifications, degree relevance, and institution quality"
      },
      {
        name: "Work Experience",
        score: w['workExperience'] > 0 ? Math.round(workExperienceScore * 100) : 0,
        weight: weights.workExperience,
        weightedScore: workExperienceScore * weights.workExperience * 100,
        icon: <Briefcase className="h-5 w-5" />,
        details: getWorkExperienceDetails(analysis),
        description: "Job history relevance, years of experience, and role alignment"
      }, {
        name: "Skills & Projects",
        score: w['skills'] > 0 ? Math.round(combinedSkillsScore * 100) : 0,
        weight: weights.skills,
        weightedScore: (skillsScore + projectScore) * weights.skills * 100,
        icon: <Brain className="h-5 w-5" />,
        details: [...getSkillsDetails(analysis), ...getProjectDetails(analysis)],
        description: "Technical skills, projects, and demonstrated expertise"
      },
      {
        name: "Certifications",
        score: w['certification'] > 0 ? Math.round(certificationScore * 100) : 0,
        weight: weights.certifications,
        weightedScore: certificationScore * weights.certifications * 100,
        icon: <Ribbon className="h-5 w-5" />,
        details: getCertificationDetails(analysis),
        description: "Professional certifications and industry credentials"
      },
      {
        name: "Summary",
        score: w['summary'] > 0 ? Math.round(summaryScore * 100) : 0,
        weight: weights.summary,
        weightedScore: summaryScore * weights.summary * 100,
        icon: <FileText className="h-5 w-5" />,
        details: getSummaryDetails(analysis),
        description: "Resume summary quality, keyword optimization, and customization"
      }
    ];
  };

  const sectionScores = getSectionScores();
  console.log(sectionScores)
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

