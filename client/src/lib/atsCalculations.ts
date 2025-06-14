import { type ResumeAnalysis } from '@/lib/schemas';

export interface ATSWeights {
  education: number;
  workExperience: number;
  skills: number;
  certifications: number;
  summary: number;
}

export const defaultWeights: ATSWeights = {
  education: 0.20,
  workExperience: 0.35,
  skills: 0.25,
  certifications: 0.10,
  summary: 0.05,
};


// Calculate ATS score with custom weights
export function calculateDynamicATSScore(analysis: ResumeAnalysis | null, customWeights?: ATSWeights): number {
  if (!analysis) return 0;

  // Use custom weights if provided, otherwise use default weights
  const weights = customWeights ?? defaultWeights;
  console.log("Using weights:", weights);

  const educationScore = calculateEducationScore(analysis);
  const workExperienceScore = calculateWorkExperienceScore(analysis);
  const projectScore = calculateProjectScore(analysis);
  const skillsScore = calculateSkillsScore(analysis);
  const certificationScore = calculateCertificationScore(analysis);
  const summaryScore = calculateSummaryScore(analysis);

  // Combine skills and projects scores with 60/40 weighting
  const combinedSkillsScore = (0.6 * skillsScore + 0.4 * projectScore);
  // Convert individual scores to percentages (0-100)
  const scores = {
    education: educationScore * 100,
    workExperience: workExperienceScore * 100,
    skills: combinedSkillsScore * 100,
    certifications: certificationScore * 100,
    summary: summaryScore * 100
  };

  // Calculate weighted sum (each weight is already in decimal form 0-1)
  const finalScore = (
    scores.education * weights.education +
    scores.workExperience * weights.workExperience +
    scores.skills * weights.skills +
    scores.certifications * weights.certifications +
    scores.summary * weights.summary
  );
  console.log('Final score components:', scores,weights);

  return Math.max(0, Math.min(100, finalScore));
}

// Helper functions for calculating section scores
export function calculateEducationScore(analysis: ResumeAnalysis): number {
  const education = analysis.education;
  if (!education) return 0;

  const degreeMatch = education.degree_match ? 1 : 0;
  const fieldMatch = education.field_match ? 1 : 0;
  
  let institutionScore = 0;
  switch (education.institution_rank_tier) {
    case "Tier 1": institutionScore = 1; break;
    case "Tier 2": institutionScore = 0.7; break;
    case "Tier 3": institutionScore = 0.4; break;
    default: institutionScore = 0.2; break;
  }
  
  let gpaScore = 0;
  if (education.gpa) {
    const gpaValue = parseFloat(education.gpa);
    if (!isNaN(gpaValue)) {
      gpaScore = Math.min(1, Math.max(0, gpaValue / 10.0));
    }
  }

  return 0.5 * degreeMatch + 0.3 * fieldMatch + 0.1 * institutionScore + 0.1 * gpaScore;
}

export function calculateWorkExperienceScore(analysis: ResumeAnalysis): number {
  const workExp = analysis.work_experience;
  if (!workExp) return 0;

  const relevantYears = workExp.total_relevant_years || 0;
  const requiredYears = workExp.required_years || 0;
  const durationScore = Math.min(1, relevantYears / requiredYears) || 0;
  const totalTitles = workExp.jd_titles?.length || 0;
  const matchingTitles = workExp.matching_titles?.length || 0;
  const semanticMatches = workExp.semantic_title_matches?.length || 0;
  const titleMatchScore = Math.min(1, (matchingTitles + semanticMatches * 0.7) / totalTitles);

  const keywordOverlap = workExp.keyword_overlap?.length ??  0;
  const keywordMatchScore = Math.min(1, keywordOverlap / (analysis.skills?.technical_skills?.required_from_jd?.length || 10));

  const currentYear = new Date().getFullYear();
  const latestYear = workExp.latest_experience_year || 0;
  const yearsDiff = currentYear - latestYear;
  const recencyScore = Math.max(0, Math.min(1, 1 - (yearsDiff / 5)));

  return 0.3 * durationScore + 0.2 * titleMatchScore + 0.4 * keywordMatchScore + 0.1 * recencyScore;
}

export function calculateProjectScore(analysis: ResumeAnalysis): number {
  const projects = analysis.projects;
  if (!projects || projects.length === 0) return 0;

  let totalScore = 0;
  projects.forEach(project => {
    if (!project) return;

    const keywordsMatched = project.keywords_matched?.length || 0;
    const keywordScore = Math.min(1, keywordsMatched / 5);

    const domainScore = project.relevant_to_jd ? 1 : 0;

    let impactScore = 0;
    if (project.impact) {
      const impact = project.impact.toLowerCase();
      if (impact.includes('high') || impact.includes('significant')) impactScore = 1;
      else if (impact.includes('medium') || impact.includes('moderate')) impactScore = 0.6;
      else if (impact.includes('low') || impact.includes('minimal')) impactScore = 0.3;
      else impactScore = 0.5;
    }

    const currentYear = new Date().getFullYear();
    const projectYear = project.year || 0;
    const yearsDiff = currentYear - projectYear;
    const recencyScore = Math.max(0, Math.min(1, 1 - (yearsDiff / 3)));

    const projectScore = 0.3 * keywordScore + 0.4 * domainScore + 0.2 * impactScore + 0.1 * recencyScore;
    totalScore += projectScore;
  });

  return totalScore / projects.length;
}

export function calculateSkillsScore(analysis: ResumeAnalysis): number {
  const skills = analysis.skills;
  if (!skills) return 0;

  const requiredTechSkills = skills.technical_skills?.required_from_jd?.length || 0;
  const matchedTechSkills = skills.technical_skills?.matched_skills?.length || 0;
  const equivalentSkills = skills.technical_skills?.equivalent_skills?.length || 0;
  const techCoverage = requiredTechSkills > 0 ? 
    Math.min(1, (matchedTechSkills + equivalentSkills * 0.8) / requiredTechSkills) : 0;

  const requiredSoftSkills = skills.soft_skills?.required_from_jd?.length || 0;
  const demonstratedSoftSkills = skills.soft_skills?.demonstrated_in_resume?.length || 0;
  const softCoverage = requiredSoftSkills > 0 ? 
    Math.min(1, demonstratedSoftSkills / requiredSoftSkills) : 0;

  const requiredDomains = skills.domain_expertise?.required_from_jd?.length || 0;
  const matchingDomains = skills.domain_expertise?.matching_domains?.length || 0;
  const domainBonus = requiredDomains > 0 ? 
    Math.min(1, matchingDomains / requiredDomains) : 0;

  return 0.6 * techCoverage + 0.3 * softCoverage + 0.1 * domainBonus;
}

export function calculateCertificationScore(analysis: ResumeAnalysis): number {
  const certs = analysis.certifications;
  if (!certs) return 0;

  const requiredCerts = certs.required_certs_in_jd?.length || 0;
  const matchedRequiredCerts = certs.required_certifications_matched?.length || 0;
  const equivalentCerts = certs.equivalent_certifications?.length || 0;
  const requiredCoverage = requiredCerts > 0 ? 
    Math.min(1, (matchedRequiredCerts + equivalentCerts * 0.8) / requiredCerts) : 1;

  const preferredCerts = certs.preferred_certs_in_jd?.length || 0;
  const matchedPreferredCerts = certs.preferred_certifications_matched?.length || 0;
  const bonusScore = preferredCerts > 0 ? 
    Math.min(1, matchedPreferredCerts / preferredCerts) : 0;

  return 0.7 * requiredCoverage + 0.3 * bonusScore;
}

export function calculateSummaryScore(analysis: ResumeAnalysis): number {
  const summary = analysis.summary;
  if (!summary) return 0;

  const keywordsMatched = summary.keywords_matched?.length || 0;
  const keywordAlignment = Math.min(1, keywordsMatched / 8);

  const intentMatch = summary.intent_matches_jd ? 1 : 0;

  const isCustomized = summary.customized_to_jd ? 1 : 0;
  const hasGenericIndicators = summary.generic_indicators_found?.length || 0;
  const customizationScore = isCustomized ? Math.max(0, 1 - (hasGenericIndicators * 0.2)) : 0;

  return 0.4 * keywordAlignment + 0.4 * intentMatch + 0.2 * customizationScore;
}

// Get all section scores as percentages (0-100)
export function getAllSectionScores(analysis: ResumeAnalysis | null): {
  education: number;
  workExperience: number;
  skills: number;
  projects: number;
  certifications: number;
  summary: number;
  combinedSkills: number;
} {
  if (!analysis) {
    return {
      education: 0,
      workExperience: 0,
      skills: 0,
      projects: 0,
      certifications: 0,
      summary: 0,
      combinedSkills: 0
    };
  }

  const educationScore = calculateEducationScore(analysis) * 100;
  const workExperienceScore = calculateWorkExperienceScore(analysis) * 100;
  const skillsScore = calculateSkillsScore(analysis) * 100;
  const projectScore = calculateProjectScore(analysis) * 100;
  const certificationScore = calculateCertificationScore(analysis) * 100;
  const summaryScore = calculateSummaryScore(analysis) * 100;
  const combinedSkillsScore = (0.6 * skillsScore + 0.4 * projectScore);

  return {
    education: Math.round(educationScore * 10) / 10,
    workExperience: Math.round(workExperienceScore * 10) / 10,
    skills: Math.round(skillsScore * 10) / 10,
    projects: Math.round(projectScore * 10) / 10,
    certifications: Math.round(certificationScore * 10) / 10,
    summary: Math.round(summaryScore * 10) / 10,
    combinedSkills: Math.round(combinedSkillsScore * 10) / 10
  };
}
