'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import { useUser } from '@clerk/nextjs';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Analysis {
  id: string;
  resume_filename: string;
  job_description: string;
  ats_score: number;
  created_at: string;
  resume_hash: string;
  jd_hash: string;
  file_path?: string;
}

interface AnalysisResponse {
  analyses: Analysis[];
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const authfetch = useAuthenticatedFetch();

  const fetchAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authfetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/analyses?limit=20`);

      if (!response.ok) {
        throw new Error('Failed to fetch analyses');
      }

      const data: AnalysisResponse = await response.json();
      setAnalyses(data.analyses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      fetchAnalyses();
    }
  }, [isLoaded, user, fetchAnalyses]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'secondary';
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const columnHelper = createColumnHelper<Analysis>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('resume_filename', {
        header: 'Filename',
        cell: (info) => (
          <div className="flex items-center">
            <FileText className="mr-2 h-4 w-4 text-gray-500" />
            <span className="font-medium">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('job_description', {
        header: 'Job Description',
        cell: (info) => (
          <div className="max-w-[60rem]">
            <p className="text-sm text-gray-600 line-clamp-2  w-full">
              {info.getValue()}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('ats_score', {
        header: 'ATS Score',
        cell: (info) => {
          const score = info.getValue();
          return score ? (
            <Badge variant={getScoreColor(score)}>
              {score}%
            </Badge>
          ) : (
            <span className="text-gray-400 text-sm">Not scored</span>
          );
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Uploaded Date',
        cell: (info) => (
          <span className="text-sm text-gray-600">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: analyses,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleRowClick = (analysis: Analysis) => {
    router.push(`/analysis?resume_hash=${analysis.resume_hash}&jd_hash=${analysis.jd_hash}`);
  };

  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your analysis history</h1>
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">      
    <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
        <p className="text-gray-600">View all your resume analyses and track your progress over time.</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading your analyses...</span>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchAnalyses} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No analyses yet</h2>
              <p className="text-gray-600 mb-6">
                Upload your first resume to start analyzing it against job descriptions.
              </p>
              <Link href="/upload">
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Upload Resume
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center space-x-1">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                            <span>
                              {{
                                asc: ' ↑',
                                desc: ' ↓',
                              }[header.column.getIsSorted() as string] ?? null}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {analyses.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Showing {analyses.length} analysis{analyses.length !== 1 ? 'es' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
