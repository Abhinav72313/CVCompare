import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResumeAnalysis } from '@/lib/schemas';
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle,
  GraduationCap,
  Star,
  TrendingUp,
  User,
  Wrench,
  XCircle
} from 'lucide-react';

export const AnalysisDisplay = ({ analysis }: { analysis: ResumeAnalysis }) => {
  return (
    <div className='space-y-4'>
      {/* Education Section */}
      {analysis.education && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.education.degrees_in_resume && analysis.education.degrees_in_resume.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700">Degrees in Resume:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {analysis.education.degrees_in_resume.map((degree, index) => (
                    <Badge key={index} variant="outline">{degree}</Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.education.required_degrees_in_jd && analysis.education.required_degrees_in_jd.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700">Required Degrees:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {analysis.education.required_degrees_in_jd.map((degree, index) => (
                    <Badge key={index} variant="secondary">{degree}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {analysis.education.degree_match !== null && (
                <div className="flex items-center gap-2">
                  {analysis.education.degree_match ?
                    <CheckCircle className="h-4 w-4 text-green-600" /> :
                    <XCircle className="h-4 w-4 text-red-600" />
                  }
                  <span>Degree Match: {analysis.education.degree_match ? 'Yes' : 'No'}</span>
                </div>
              )}

              {analysis.education.field_match !== null && (
                <div className="flex items-center gap-2">
                  {analysis.education.field_match ?
                    <CheckCircle className="h-4 w-4 text-green-600" /> :
                    <XCircle className="h-4 w-4 text-red-600" />
                  }
                  <span>Field Match: {analysis.education.field_match ? 'Yes' : 'No'}</span>
                </div>
              )}

              {analysis.education.institution && (
                <div>
                  <span className="font-medium">Institution:</span> {analysis.education.institution}
                </div>
              )}

              {analysis.education.graduation_year && (
                <div>
                  <span className="font-medium">Graduation Year:</span> {analysis.education.graduation_year}
                </div>
              )}
            </div>

            {analysis.education.notes && (
              <div className="bg-blue-50 p-3 rounded text-sm">
                <strong>Notes:</strong> {analysis.education.notes}
              </div>
            )}
          </CardContent>
        </Card>
      )}      
      
      {/* Work Experience Section */}
      {analysis.work_experience && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5 text-purple-600" />
              Work Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {analysis.work_experience.total_relevant_years !== null && (
                <div>
                  <span className="font-medium">Total Relevant Years:</span> {analysis.work_experience.total_relevant_years}
                </div>
              )}

              {analysis.work_experience.required_years !== null && (
                <div>
                  <span className="font-medium">Required Years:</span> {analysis.work_experience.required_years}
                </div>
              )}
            </div>

            {analysis.work_experience.years_calculation_breakdown && (
              <div className="bg-gray-50 p-3 rounded text-sm">
                <strong>Calculation:</strong> {analysis.work_experience.years_calculation_breakdown}
              </div>
            )}

            {analysis.work_experience.jobs && analysis.work_experience.jobs.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Job History:</h4>
                <div className="space-y-2">
                  {analysis.work_experience.jobs.map((job, index) => (
                    <div key={index} className="border rounded p-3 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{job.title || 'N/A'}</h5>
                          <p className="text-sm text-gray-600">{job.company || 'N/A'}</p>
                          <p className="text-xs text-gray-500">
                            {job.start_date} - {job.end_date} ({job.duration_years} years)
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {job.relevant_to_jd === true && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {job.relevant_to_jd === false && <XCircle className="h-4 w-4 text-red-600" />}
                          {job.relevant_to_jd === "partially" && <div className="h-4 w-4 bg-yellow-500 rounded-full" />}
                        </div>
                      </div>
                      {job.tech_stack && job.tech_stack.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {job.tech_stack.map((tech, techIndex) => (
                              <Badge key={techIndex} variant="outline" className="text-xs">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.work_experience.notes && (
              <div className="bg-purple-50 p-3 rounded text-sm">
                <strong>Notes:</strong> {analysis.work_experience.notes}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Skills Section */}
      {analysis.skills && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="h-5 w-5 text-orange-600" />
              Skills Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Technical Skills */}
            {analysis.skills.technical_skills && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Technical Skills</h4>
                <div className="space-y-2">
                  {analysis.skills.technical_skills.matched_skills && analysis.skills.technical_skills.matched_skills.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">Matched Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.skills.technical_skills.matched_skills.map((skill, index) => (
                          <Badge key={index} variant="default" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.skills.technical_skills.missing_required_skills && analysis.skills.technical_skills.missing_required_skills.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">Missing Required Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.skills.technical_skills.missing_required_skills.map((skill, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {analysis.skills.soft_skills && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2">Soft Skills</h4>
                <div className="space-y-2">
                  {analysis.skills.soft_skills.demonstrated_in_resume && analysis.skills.soft_skills.demonstrated_in_resume.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500">Demonstrated:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.skills.soft_skills.demonstrated_in_resume.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {analysis.skills.notes && (
              <div className="bg-orange-50 p-3 rounded text-sm">
                <strong>Notes:</strong> {analysis.skills.notes}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Projects Section */}
      {analysis.projects && analysis.projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5 text-yellow-600" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.projects.map((project, index) => (
                <div key={index} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{project.title || 'Untitled Project'}</h5>
                      <p className="text-sm text-gray-600">{project.description || 'No description'}</p>
                      {project.domain && (
                        <p className="text-xs text-gray-500">Domain: {project.domain}</p>
                      )}
                    </div>
                    {project.relevant_to_jd !== null && (
                      <div className="flex items-center gap-1">
                        {project.relevant_to_jd ?
                          <div title='Relevant to JD'>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          :
                          <div title='Not Relevant to JD'>
                            <XCircle className="h-4 w-4 text-red-600" />
                          </div>
                        }
                      </div>
                    )}
                  </div>
                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {project.tech_stack.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications Section */}
      {analysis.certifications && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-green-600" />
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.certifications.certs_in_resume && analysis.certifications.certs_in_resume.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700">Certifications in Resume:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {analysis.certifications.certs_in_resume.map((cert, index) => (
                    <Badge key={index} variant="default">{cert}</Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.certifications.missing_required_certifications && analysis.certifications.missing_required_certifications.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700">Missing Required:</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {analysis.certifications.missing_required_certifications.map((cert, index) => (
                    <Badge key={index} variant="destructive">{cert}</Badge>
                  ))}
                </div>
              </div>
            )}

            {analysis.certifications.notes && (
              <div className="bg-green-50 p-3 rounded text-sm">
                <strong>Notes:</strong> {analysis.certifications.notes}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Professional Summary */}
      {analysis.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-indigo-600" />
              Professional Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.summary.text && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm">{analysis.summary.text}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {analysis.summary.intent_matches_jd !== null && (
                <div className="flex items-center gap-2">
                  {analysis.summary.intent_matches_jd ?
                    <CheckCircle className="h-4 w-4 text-green-600" /> :
                    <XCircle className="h-4 w-4 text-red-600" />
                  }
                  <span>Intent Matches JD</span>
                </div>
              )}

              {analysis.summary.customized_to_jd !== null && (
                <div className="flex items-center gap-2">
                  {analysis.summary.customized_to_jd ?
                    <CheckCircle className="h-4 w-4 text-green-600" /> :
                    <XCircle className="h-4 w-4 text-red-600" />
                  }
                  <span>Customized to JD</span>
                </div>
              )}

              {analysis.summary.value_proposition_strength && (
                <div>
                  <span className="font-medium">Value Proposition:</span>
                  <span className={`ml-1 capitalize ${analysis.summary.value_proposition_strength === 'strong' ? 'text-green-600' :
                      analysis.summary.value_proposition_strength === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                    {analysis.summary.value_proposition_strength}
                  </span>
                </div>
              )}
            </div>

            {analysis.summary.notes && (
              <div className="bg-indigo-50 p-3 rounded text-sm">
                <strong>Notes:</strong> {analysis.summary.notes}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Qualifications */}
      {analysis.additional_qualifications && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-teal-600" />
              Additional Qualifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(analysis.additional_qualifications).map(([key, value]) => {
              if (key === 'notes' || !value || (Array.isArray(value) && value.length === 0)) return null;

              return (
                <div key={key}>
                  <h4 className="font-medium text-sm text-gray-700 capitalize mb-1">
                    {key.replace(/_/g, ' ')}:
                  </h4>
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-1">
                      {value.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{item}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm">{value}</p>
                  )}
                </div>
              );
            })}

            {analysis.additional_qualifications.notes && (
              <div className="bg-teal-50 p-3 rounded text-sm">
                <strong>Notes:</strong> {analysis.additional_qualifications.notes}
              </div>
            )}
          </CardContent>
        </Card>
      )}      {/* Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-3">
                      {suggestion.suggestion && (
                        <div>
                          <h4 className="font-medium text-gray-900">{suggestion.suggestion}</h4>
                          {suggestion.description && (
                            <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                          )}
                        </div>
                      )}
                      
                      {suggestion.section_name && (
                        <div className="text-xs">
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Section: {suggestion.section_name}
                          </span>
                        </div>
                      )}
                      
                      {suggestion.part_of_resume && (
                        <div className="bg-red-50 border-l-4 border-red-200 p-3 rounded">
                          <p className="text-xs text-red-600 font-medium">Current:</p>
                          <p className="text-sm text-red-700">{suggestion.part_of_resume}</p>
                        </div>
                      )}
                      
                      {suggestion.improved_part_of_resume && (
                        <div className="bg-green-50 border-l-4 border-green-200 p-3 rounded">
                          <p className="text-xs text-green-600 font-medium">Improved:</p>
                          <p className="text-sm text-green-700">{suggestion.improved_part_of_resume}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};