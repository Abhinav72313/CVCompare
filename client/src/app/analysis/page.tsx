"use client";

import FileChanger from '@/components/FileChanger';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFileContext } from '@/contexts/fileContext';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { ATSWeights, calculateDynamicATSScore, defaultWeights } from '@/lib/atsCalculations';
import { ResumeAnalysis, resumeAnalysisSchema } from '@/lib/schemas';
import { useUser } from '@clerk/nextjs';
import { AlertCircle, CheckCircle, FileText, Search, XCircle } from "lucide-react";
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Dynamic imports for heavy components
const AnalysisDisplay = dynamic(() => import('@/components/AnalysisDisplay').then(mod => ({ default: mod.AnalysisDisplay })), {
    loading: () => (
        <Card>
            <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </CardContent>
        </Card>
    ),
    ssr: false
});

const ATSCalculation = dynamic(() => import('@/components/ATSCalculation').then(mod => ({ default: mod.ATSCalculation })), {
    loading: () => (
        <Card>
            <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    ),
    ssr: false
});

const ChatInterface = dynamic(() => import('@/components/ChatInterface'), {
    loading: () => (
        <Card>
            <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-64 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
            </CardContent>
        </Card>
    ),
    ssr: false
});

const PdfHighlighter = dynamic(() => import('@/components/PDFViewer'), {
    loading: () => (
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="animate-pulse text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Loading PDF viewer...</p>
            </div>
        </div>
    ),
    ssr: false
});

const JobDescriptionHighlighter = dynamic(() => import('@/components/JobDescriptionHighlighter').then(mod => ({ default: mod.JobDescriptionHighlighter })), {
    loading: () => (
        <div className="p-4">
            <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
        </div>
    ),
    ssr: false
});

export default function AnalysisPage() {
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [jobDescription, setJobDescription] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [selectedResume, setSelectedResume] = useState<boolean>(true);
    const [file, setFile] = useState<File | null>(null);
    const [matched_skills, setMatchedSkills] = useState<string[]>([]);
    const [keywordMatchRate, setKeywordMatchRate] = useState<number>(0);
    const [matchedKeywords, setMatchedKeywords] = useState<number>(0);

    const [weights, setWeights] = useState<ATSWeights | null>(null);

    const [calculatedScore, setCalculatedScore] = useState(0);

    const [w, setw] = useState<{ [key: string]: number }>({
        'education': 0,
        'workExperience': 0,
        'skills': 0,
        'certifications': 0,
        'summary': 0
    })
    const { isSignedIn } = useUser()
    const authfetch = useAuthenticatedFetch()
    const { setJDHash, setResumeHash, setChatHistory } = useFileContext()


    useEffect(() => {
        const search = new URLSearchParams(window.location.search)
        if (!search.get('resume_hash') || !search.get('jd_hash') || !isSignedIn) {
            return;
        }

        setResumeHash(search.get('resume_hash'))
        setJDHash(search.get('jd_hash'))

        authfetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get-analysis`, {
            method: 'POST',
            body: JSON.stringify({
                resume_hash: search.get('resume_hash'),
                jd_hash: search.get('jd_hash')
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch analysis');
            }
            return res.json();
        }).then(async (res) => {
            if (!res.analysis) {
                throw new Error('No analysis found for the given hashes');
            }

            if (!res.file_path) {
                throw new Error('No file URL found in the analysis response');
            }

            if (!res.job_description) {
                throw new Error('No job description found in the analysis response');
            }

            const file = await fetch(res.file_path)

            if (!file.ok) {
                throw new Error('Failed to fetch resume file');
            }

            const blob = await file.blob();
            const urlParams = new URLSearchParams(search);
            urlParams.append('resume_hash', search.get('resume_hash') || '')
            urlParams.append('jd_hash', search.get('jd_hash') || '')

            const messages = await authfetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/history?${urlParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },

            })

            if (!messages.ok) {
                throw new Error('Failed to fetch chat history');
            }

            const history = await messages.json()
            const chatHisotry = history.chat_history
            chatHisotry.forEach((chat: ChatMessage) => {
                chat.created_at = new Date(chat.created_at)
            });

            if (chatHisotry.length == 0) {
                chatHisotry.push({
                    id: Date.now().toString(),
                    role: "Assistant",
                    message: "Welcome to the ATS analysis chat! You can ask me questions about your resume and job description.",
                    created_at: new Date(),
                    user_id: null,
                    resume_hash: search.get('resume_hash') || '',
                    jd_hash: search.get('jd_hash') || ''
                })

            };

            setChatHistory(chatHisotry)
            setFile(new File([blob], 'resume.pdf', { type: blob.type }));
            setAnalysis(resumeAnalysisSchema.parse(res.analysis));
            setJobDescription(res.job_description);

            if (res.weights) {
                setWeights(res.weights)
            } 

            if (res.score) {
                setCalculatedScore(res.score)
            }


        }).catch(err => {
            console.log('Error fetching analysis:', err);
            toast.error('Failed to load analysis. Please try again later.');
        }).finally(() => setIsLoading(false));
    }, [authfetch, isSignedIn,  setChatHistory, setJDHash, setResumeHash]);

    // Debounced heavy calculations for analysis processing
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Clear previous timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Debounce heavy calculations
        debounceTimeoutRef.current = setTimeout(() => {
            if (!analysis) return;

            // Calculate matched skills
            let skills: string[] = [];
            if (analysis?.skills?.technical_skills?.matched_skills) {
                skills = skills.concat(analysis.skills.technical_skills.matched_skills);
            }

            if (analysis?.skills?.soft_skills?.required_from_jd) {
                skills = skills.concat(analysis.skills.soft_skills.required_from_jd);
            }

            setMatchedSkills(skills);

            // Calculate keyword match rate
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

            if (!weights) {
                const w = {
                    'education': analysis.education?.required_degrees_in_jd?.length ? 1 : 0,
                    'workExperience': analysis.work_experience?.required_years ? 1 : 0,
                    'skills': analysis.skills?.technical_skills?.required_from_jd?.length ? 1 : 0,
                    'certifications': analysis.certifications?.required_certs_in_jd?.length ? 1 : 0,
                    'summary': analysis.summary?.intent_matches_jd ? 1 : 0
                }

                setw(w);

                const normalizedWeights: ATSWeights = { ...defaultWeights };

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
            } else {
                const score = Math.round(calculateDynamicATSScore(analysis, weights));
                setCalculatedScore(score);
            }
        }, 300); // 300ms debounce

        // Cleanup function
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [analysis, weights])


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
    const getKeywordsToHighlight = useCallback((): string[] => {
        return matched_skills;
    }, [matched_skills]);

    // Get matched keywords from analysis
    const getMatchedKeywords = useCallback((): string[] => {
        if (!analysis) return [];
        
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
    }, [analysis]);

    // Get missing keywords from analysis
    const getMissingKeywords = useCallback((): string[] => {
        if (!analysis) return [];
        
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
    }, [analysis]);

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
            </div>);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

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
                                </div>                                <Tabs defaultValue="Analysis" className="w-full ">
                                    <TabsList className='w-full '>
                                        <TabsTrigger value="Analysis">Analysis</TabsTrigger>
                                        <TabsTrigger value="Calculation">Calculation</TabsTrigger>
                                        <TabsTrigger value="Chat">Chat</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="Analysis" className='overflow-y-auto pb-1 pr-2 max-h-[calc(100vh-200px)]'>
                                        <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
                                            <AnalysisDisplay analysis={analysis} />
                                        </Suspense>
                                    </TabsContent>
                                    <TabsContent value="Calculation" className='overflow-y-auto pb-1 pr-2 max-h-[calc(100vh-200px)]'>
                                        <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
                                            <ATSCalculation analysis={analysis} setCalculatedScore={setCalculatedScore} weights={weights} setWeights={setWeights} w={w} calculatedScore={calculatedScore} />
                                        </Suspense>
                                    </TabsContent>
                                    <TabsContent value="Chat" className='overflow-y-auto pb-1 pr-2 max-h-[calc(100vh-200px)]'>
                                        <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded"></div>}>
                                            <ChatInterface />
                                        </Suspense>
                                    </TabsContent>
                                </Tabs>
                            </>
                        )}
                    </div>

                    {/* Right Panel - Resume Preview */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col  ">
                        <div className="p-4 border-b border-gray-200" onClick={() => setSelectedResume(!selectedResume)}>
                            <FileChanger resume={selectedResume} />
                        </div>                        <div className="flex-1 mx-auto w-full">
                            {file ? (
                                selectedResume ?
                                    <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded"></div>}>
                                        <PdfHighlighter
                                            file={file}
                                            highlightWords={getKeywordsToHighlight()}
                                        />
                                    </Suspense> :
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
                                            <Suspense fallback={<div className="p-4 animate-pulse space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                                            </div>}>
                                                <JobDescriptionHighlighter
                                                    text={jobDescription}
                                                    matchedKeywords={getMatchedKeywords()}
                                                    missingKeywords={getMissingKeywords()}
                                                />
                                            </Suspense>
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
