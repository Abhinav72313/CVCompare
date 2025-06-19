"use client";

import { AnalysisDisplay } from '@/components/AnalysisDisplay';
import { ATSCalculation } from '@/components/ATSCalculation';
import ChatInterface from '@/components/ChatInterface';
import FileChanger from '@/components/FileChanger';
import { JobDescriptionHighlighter } from '@/components/JobDescriptionHighlighter';
import PdfHighlighter from '@/components/PDFViewer';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFileContext } from "@/contexts/fileContext";
import { ATSWeights, calculateDynamicATSScore, defaultWeights } from '@/lib/atsCalculations';
import { ResumeAnalysis } from '@/lib/schemas';
import { AlertCircle, ArrowLeft, CheckCircle, FileText, Search, XCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AnalysisPage() {
    const router = useRouter();
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [resumeFileName, setResumeFileName] = useState<string | null>(null);
    const [jobDescription, setJobDescription] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedResume, setSelectedResume] = useState<boolean>(true);
    const { file } = useFileContext();
    const [matched_skills, setMatchedSkills] = useState<string[]>([]);
    const [keywordMatchRate, setKeywordMatchRate] = useState<number>(0);
    const [matchedKeywords, setMatchedKeywords] = useState<number>(0);

    const [weights, setWeights] = useState<ATSWeights>(defaultWeights);

    const [calculatedScore, setCalculatedScore] = useState(0);

    const [w, setw] = useState<{ [key: string]: number }>({
        'education': 0,
        'workExperience': 0,
        'skills': 0,
        'certifications': 0,
        'summary': 0
    })

    useEffect(() => {

        if(!analysis) return;
        const w = {
            'education': analysis.education?.required_degrees_in_jd?.length ? 1 : 0,
            'workExperience': analysis.work_experience?.required_years ? 1 : 0,
            'skills': analysis.skills?.technical_skills?.required_from_jd?.length ? 1 : 0,
            'certifications': analysis.certifications?.required_certs_in_jd?.length ? 1 : 0,
            'summary': analysis.summary?.intent_matches_jd ? 1 : 0
        }

        setw(w);

        const normalizedWeights: ATSWeights = weights

        normalizedWeights.education = normalizedWeights.education * w['education'];
        normalizedWeights.workExperience = normalizedWeights.workExperience * w['workExperience'];
        normalizedWeights.skills = normalizedWeights.skills * w['skills'];
        normalizedWeights.certifications = normalizedWeights.certifications * w['certifications'];
        normalizedWeights.summary = normalizedWeights.summary * w['summary'];

        let total = 0;
        for (const key in normalizedWeights) {
            total += normalizedWeights[key as keyof ATSWeights];
        }

        for (const key in normalizedWeights) {
            normalizedWeights[key as keyof ATSWeights] = normalizedWeights[key as keyof ATSWeights] / total;
        }


        setWeights(normalizedWeights)

        const score = Math.round(calculateDynamicATSScore(analysis, normalizedWeights));
        setCalculatedScore(score);


    }, [analysis, weights]);

    useEffect(() => {
        // Load analysis data from localStorage
        try {
            const analysisData = localStorage.getItem('analysisResult');
            const fileName = localStorage.getItem('resumeFileName');
            const jobDesc = localStorage.getItem('jobDescription');

            if (!file) {
                router.push('/');
                return;
            }

            if (analysisData) {
                setAnalysis(JSON.parse(analysisData));
                setResumeFileName(fileName);
                setJobDescription(jobDesc || "");


            } else {
                // No analysis data found, redirect to home
                router.push('/');
                return;
            }
        } catch (error) {
            console.error('Error loading analysis data:', error);
            router.push('/');
            return;
        }

        setIsLoading(false);
    }, [file, router]);


    useEffect(() => {
        let skills: string[] = [];
        if (analysis?.skills?.technical_skills?.matched_skills) {
            skills = skills.concat(analysis.skills.technical_skills.matched_skills);
        }

        if (analysis?.skills?.soft_skills?.required_from_jd) {
            skills = skills.concat(analysis.skills.soft_skills.required_from_jd);
        }

        setMatchedSkills(skills);

        // Calculate keyword match rate
        if (analysis) {
            let totalKeywords = 0;
            let matchedKeywordCount = 0;

            // Count keywords from work experience
            if (analysis.work_experience?.keyword_overlap) {
                matchedKeywordCount += analysis.work_experience.keyword_overlap.length;
            }

            // Count keywords from summary
            if (analysis.summary?.keywords_matched) {
                matchedKeywordCount += analysis.summary.keywords_matched.length;
            }

            // Count keywords from projects
            if (analysis.projects) {
                analysis.projects.forEach(project => {
                    if (project?.keywords_matched) {
                        matchedKeywordCount += project.keywords_matched.length;
                    }
                });
            }

            // Count keywords from skills
            if (analysis.skills?.technical_skills?.matched_skills) {
                matchedKeywordCount += analysis.skills.technical_skills.matched_skills.length;
            }

            // Estimate total keywords (this could be improved with actual JD keyword extraction)
            // For now, we'll base it on the analysis data structure
            totalKeywords = matchedKeywordCount * 1.5; // Assuming we match about 67% of keywords

            const rate = totalKeywords > 0 ? Math.round((matchedKeywordCount / totalKeywords) * 100) : 0;
            setKeywordMatchRate(rate);
            setMatchedKeywords(matchedKeywordCount);
        }
    }, [analysis])


    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreIcon = (score: number) => {
        if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
        if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
        return <XCircle className="h-5 w-5 text-red-600" />;
    };    // Prepare keywords to highlight in the PDF
    const getKeywordsToHighlight = (): string[] => {
        return matched_skills

    };

    // Get matched keywords from analysis
    const getMatchedKeywords = (): string[] => {
        const keywords: string[] = [];

        if (analysis?.skills?.technical_skills?.matched_skills) {
            keywords.push(...analysis.skills.technical_skills.matched_skills);
        }

        if (analysis?.work_experience?.keyword_overlap) {
            keywords.push(...analysis.work_experience.keyword_overlap);
        }

        if (analysis?.summary?.keywords_matched) {
            keywords.push(...analysis.summary.keywords_matched);
        }

        // Remove duplicates
        return [...new Set(keywords)];
    };

    // Get missing keywords from analysis
    const getMissingKeywords = (): string[] => {
        const keywords: string[] = [];

        if (analysis?.skills?.technical_skills?.missing_required_skills) {
            keywords.push(...analysis.skills.technical_skills.missing_required_skills);
        }

        if (analysis?.skills?.technical_skills?.required_from_jd) {
            // Add required skills that are not in matched skills
            const matched = analysis.skills.technical_skills.matched_skills || [];
            const required = analysis.skills.technical_skills.required_from_jd;
            const missing = required.filter(skill =>
                !matched.some(matchedSkill =>
                    matchedSkill.toLowerCase() === skill.toLowerCase()
                )
            );
            keywords.push(...missing);
        }

        // Remove duplicates
        return [...new Set(keywords)];
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <Card className="w-96">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="text-lg font-medium">Loading analysis...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-2 shadow-sm">
                <div className=" flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Resume Analysis</h1>
                            <p className="text-sm text-gray-600">
                                {resumeFileName ? `File: ${resumeFileName}` : "Detailed insights and recommendations"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">

                        {analysis && (
                            <>
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${getScoreColor(calculatedScore)}`}>
                                        {calculatedScore}%
                                    </div>
                                    <p className="text-xs text-gray-600">ATS Score</p>
                                </div>

                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className=" mx-auto p-6 min-h-screen">
                <div className="grid  grid-cols-1 lg:grid-cols-2 gap-2 ">
                    {/* Left Panel - Analysis */}
                    <div className="space-y-6 pr-4 rounded-lg ">
                        {analysis && (
                            <>
                                {/* Score Overview */}
                                <div className="grid grid-cols-2 gap-4 ">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center space-y-0 pb-2 space-x-2">
                                            <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
                                            {getScoreIcon(calculatedScore)}
                                        </CardHeader>
                                        <CardContent>
                                            <div className={`text-2xl font-bold mb-2 ${getScoreColor(calculatedScore)}`}>
                                                {calculatedScore}%
                                            </div>
                                            <Progress value={calculatedScore} className="mb-2" />
                                            <p className="text-xs text-muted-foreground">
                                                How likely your resume is to pass ATS systems
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Keyword Match</CardTitle>
                                            <Search className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className={`text-2xl font-bold mb-2 ${getScoreColor(keywordMatchRate)}`}>
                                                {keywordMatchRate}%
                                            </div>
                                            <Progress value={keywordMatchRate} className="mb-2" />
                                            <p className="text-xs text-muted-foreground">
                                                {matchedKeywords} key terms matched in resume
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <Tabs defaultValue="Analysis" className="w-full ">
                                    <TabsList className='w-full '>
                                        <TabsTrigger value="Analysis">Analysis</TabsTrigger>
                                        <TabsTrigger value="Calculation">Calculation</TabsTrigger>
                                        <TabsTrigger value="Chat">Chat</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="Analysis" className='overflow-y-auto pb-1 pr-2 max-h-[calc(100vh-200px)]'>
                                        <AnalysisDisplay analysis={analysis} />
                                    </TabsContent>
                                    <TabsContent value="Calculation" className='overflow-y-auto pb-1 pr-2 max-h-[calc(100vh-200px)]'>
                                        <ATSCalculation analysis={analysis} weights={weights} setWeights={setWeights} w={w} calculatedScore={calculatedScore} />
                                    </TabsContent>
                                    <TabsContent value="Chat" className='overflow-y-auto pb-1 pr-2 max-h-[calc(100vh-200px)]'>
                                        <ChatInterface />
                                    </TabsContent>
                                </Tabs>
                            </>
                        )}
                    </div>

                    {/* Right Panel - Resume Preview */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col  ">
                        <div className="p-4 border-b border-gray-200" onClick={() => setSelectedResume(!selectedResume)}>
                            <FileChanger resume={selectedResume} />
                        </div>
                        <div className="flex-1 mx-auto w-full">
                            {file ? (
                                selectedResume ?
                                    <PdfHighlighter
                                        file={file}
                                        highlightWords={getKeywordsToHighlight()}
                                    /> :
                                    <div className="h-full flex flex-col max-h-[calc(100vh-100px)]">
                                        {/* Legend */}
                                        <div className="p-3 border-b border-gray-100 bg-gray-50">
                                            <div className="text-xs text-gray-600 mb-2 font-medium">Keywords Legend:</div>
                                            <div className="flex gap-4 text-xs">
                                                <div className="flex items-center gap-1">
                                                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded">Found</span>
                                                    <span className="text-gray-600">in resume</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="bg-red-200 text-red-800 px-2 py-1 rounded">Missing</span>
                                                    <span className="text-gray-600">from resume</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Job Description with highlighting */}
                                        <div className="flex-1 overflow-auto">
                                            <JobDescriptionHighlighter
                                                text={jobDescription}
                                                matchedKeywords={getMatchedKeywords()}
                                                missingKeywords={getMissingKeywords()}
                                            />
                                        </div>
                                    </div>
                            ) : (
                                <div className="h-full bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 font-medium">PDF Preview Not Available</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Preview not supported: &apos;Unable to load PDF preview&apos;
                                        </p>
                                        <div className="mt-4 space-y-2">
                                            <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                                                <strong>Keywords to look for:</strong><br />
                                                {getKeywordsToHighlight().slice(0, 5).join(', ')}
                                                {getKeywordsToHighlight().length > 5 && '...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
