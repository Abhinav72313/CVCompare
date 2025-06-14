import { z } from "zod";



export const resumeAnalysisSchema = z.object({

  education: z.object({
    degrees_in_resume: z.array(z.string()).nullable(),
    required_degrees_in_jd: z.array(z.string()).nullable(),
    degree_match: z.boolean().nullable(),
    field_match: z.boolean().nullable(),
    gpa: z.string().nullable(),
    institution: z.string().nullable(),
    institution_rank_tier: z.enum(["Tier 1", "Tier 2", "Tier 3", "Unknown"]).nullable(),
    graduation_year: z.number().nullable(),
    notes: z.string().nullable(),
  }).nullable(),

  work_experience: z.object({
    total_relevant_years: z.number().nullable(),
    required_years: z.number().nullable(),
    years_calculation_breakdown: z.string().nullable(),
    jobs: z.array(z.object({
      title: z.string().nullable(),
      company: z.string().nullable(),
      duration_years: z.number().nullable(),
      start_date: z.string().nullable(),
      end_date: z.string().nullable(),
      tech_stack: z.array(z.string()).nullable(),
      relevant_to_jd: z.union([z.boolean(), z.literal("partially")]).nullable(),
    })).nullable(),
    matching_titles: z.array(z.string()).nullable(),
    jd_titles: z.array(z.string()).nullable(),
    keyword_overlap: z.array(z.string()).nullable(),
    latest_experience_year: z.number().nullable(),
    notes: z.string().nullable(),
    semantic_title_matches: z.array(z.object({
      resume_title: z.string(),
      jd_title: z.string(),
      similarity_reason: z.string()
    })).nullable(),
  }).nullable(),

  projects: z.array(z.object({
    title: z.string().nullable(),
    tech_stack: z.array(z.string()).nullable(),
    description: z.string().nullable(),
    domain: z.string().nullable(),
    relevant_to_jd: z.boolean().nullable(),
    keywords_matched: z.array(z.string()).nullable(),
    impact: z.string().nullable(),
    year: z.number().nullable()
  })).nullable(),

  skills: z.object({
    technical_skills: z.object({
      required_from_jd: z.array(z.string()).nullable(),
      matched_skills: z.array(z.string()).nullable(),
      missing_required_skills: z.array(z.string()).nullable(),
      equivalent_skills: z.array(z.object({
        resume_skill: z.string().nullable(),
        equivalent_to: z.string().nullable(),
        reason: z.string().nullable(),
        confidence: z.enum(["high", "medium", "low"]).nullable(),
      })).nullable(),
      irrelevant_skills: z.array(z.string()).nullable(),
    }).nullable(),
    soft_skills: z.object({
      required_from_jd: z.array(z.string()).nullable(),
      demonstrated_in_resume: z.array(z.string()).nullable(),
      missing_critical_soft_skills: z.array(z.string()).nullable(),
    }).nullable(),
    domain_expertise: z.object({
      required_from_jd: z.array(z.string()).nullable(),
      matching_domains: z.array(z.string()).nullable()
    }).nullable(),
    notes: z.string().nullable(),
  }).nullable(),

  certifications: z.object({
    certs_in_resume: z.array(z.string()).nullable(),
    missing_required_certifications: z.array(z.string()).nullable(),
    required_certs_in_jd: z.array(z.string()).nullable(),
    required_certifications_matched: z.array(z.string()).nullable(),
    equivalent_certifications: z.array(z.string()).nullable(),
    preferred_certs_in_jd: z.array(z.string()).nullable(),
    preferred_certifications_matched: z.array(z.string()).nullable(),
    notes: z.string().nullable(),
  }).nullable(),

  summary: z.object({
    text: z.string().nullable(),
    keywords_matched: z.array(z.string()).nullable(),
    semantic_alignment_indicators: z.array(z.string()).nullable(),
    intent_matches_jd: z.boolean().nullable(),
    customized_to_jd: z.boolean().nullable(),
    generic_indicators_found: z.array(z.string()).nullable(),
    value_proposition_strength: z.enum(["strong", "moderate", "weak"]).nullable(),
    notes: z.string().nullable(),
  }).nullable(),

  additional_qualifications: z.object({
    notes: z.string().nullable(),
  }).nullable(),

  suggestions: z.array(z.object({
    suggestion: z.string().nullable(),
    description: z.string().nullable(),
    part_of_resume: z.string().nullable(),
    improved_part_of_resume: z.string().nullable(),
    section_name: z.string().nullable(),
  })).nullable(),
});

export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;
