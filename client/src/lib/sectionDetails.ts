import { ResumeAnalysis } from '@/lib/schemas';

// Helper functions for getting section details
export function getEducationDetails(analysis: ResumeAnalysis): string[] {
  const education = analysis.education;
  if (!education) return ["No education data available"];

  const details = [];
  details.push(`Degree match: ${education.degree_match ? 'Yes' : 'No'} (50% weight)`);
  details.push(`Field match: ${education.field_match ? 'Yes' : 'No'} (30% weight)`);
  details.push(`Institution tier: ${education.institution_rank_tier || 'Unknown'} (10% weight)`);
  details.push(`GPA: ${education.gpa || 'Not provided'} (10% weight)`);
  
  return details;
}

export function getWorkExperienceDetails(analysis: ResumeAnalysis): string[] {
  const workExp = analysis.work_experience;
  if (!workExp) return ["No work experience data available"];

  const details = [];
  details.push(`Experience: ${workExp.total_relevant_years || 0}/${workExp.required_years || 0} years (30% weight)`);
  details.push(`Title matches: ${workExp.matching_titles?.length || 0} direct, ${workExp.semantic_title_matches?.length || 0} semantic (20% weight)`);
  details.push(`Keyword overlap: ${workExp.keyword_overlap?.length || 0} keywords (40% weight)`);
  details.push(`Latest experience: ${workExp.latest_experience_year || 'Unknown'} (10% weight)`);
  
  return details;
}

export function getProjectDetails(analysis: ResumeAnalysis): string[] {
  const projects = analysis.projects;
  if (!projects || projects.length === 0) return ["No projects data available"];

  const details = [];
  const relevantProjects = projects.filter(p => p?.relevant_to_jd).length;
  const totalKeywords = projects.reduce((sum, p) => sum + (p?.keywords_matched?.length || 0), 0);
  
  details.push(`Relevant projects: ${relevantProjects}/${projects.length} (30% weight)`);
  details.push(`Total keywords matched: ${totalKeywords} (30% weight)`);
  details.push(`Average project recency calculated (20% weight)`);
  details.push(`Impact levels assessed (20% weight)`);
  
  return details;
}

export function getSkillsDetails(analysis: ResumeAnalysis): string[] {
  const skills = analysis.skills;
  if (!skills) return ["No skills data available"];

  const details = [];
  const requiredSkills = skills.technical_skills?.required_from_jd?.length || 0;
  const matchedSkills = skills.technical_skills?.matched_skills?.length || 0;
  const softSkillsRequired = skills.soft_skills?.required_from_jd?.length || 0;
  const softSkillsDemonstrated = skills.soft_skills?.demonstrated_in_resume?.length || 0;
  
  details.push(`Technical skills: ${matchedSkills}/${requiredSkills} required (60% weight)`);
  details.push(`Soft skills: ${softSkillsDemonstrated}/${softSkillsRequired} demonstrated (30% weight)`);
  details.push(`Domain expertise bonus calculated (10% weight)`);
  
  return details;
}

export function getCertificationDetails(analysis: ResumeAnalysis): string[] {
  const certs = analysis.certifications;
  if (!certs) return ["No certifications data available"];

  const details = [];
  const requiredCerts = certs.required_certs_in_jd?.length || 0;
  const matchedRequired = certs.required_certifications_matched?.length || 0;
  const preferredCerts = certs.preferred_certs_in_jd?.length || 0;
  const matchedPreferred = certs.preferred_certifications_matched?.length || 0;
  
  details.push(`Required certifications: ${matchedRequired}/${requiredCerts} (70% weight)`);
  details.push(`Preferred certifications: ${matchedPreferred}/${preferredCerts} (30% weight)`);
  if (certs.equivalent_certifications?.length) {
    details.push(`Equivalent certifications: ${certs.equivalent_certifications.length} found`);
  }
  
  return details;
}

export function getSummaryDetails(analysis: ResumeAnalysis): string[] {
  const summary = analysis.summary;
  if (!summary) return ["No summary data available"];

  const details = [];
  details.push(`Keywords matched: ${summary.keywords_matched?.length || 0} (40% weight)`);
  details.push(`Intent matches JD: ${summary.intent_matches_jd ? 'Yes' : 'No'} (40% weight)`);
  details.push(`Customization: ${summary.customized_to_jd ? 'Yes' : 'No'} (20% weight)`);
  if (summary.generic_indicators_found?.length) {
    details.push(`Generic indicators found: ${summary.generic_indicators_found.length}`);
  }
  
  return details;
}
