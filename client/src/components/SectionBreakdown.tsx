"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SectionScore {
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  icon: React.ReactNode;
  details: string[];
  description: string;
}

interface SectionBreakdownProps {
  sectionScores: SectionScore[];
}

export function SectionBreakdown({ sectionScores }: SectionBreakdownProps) {
  return (
    <div className="grid gap-4">
      {sectionScores.map((section, index) => {
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {section.icon}
                    {section.name}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      Weight: {(section.weight * 100).toFixed(0)}%
                    </Badge>
                    <div className="text-right">
                      <div className="text-lg font-bold">{section.score}%</div>
                      <div className="text-xs text-gray-600">
                        Weighted: {section.weightedScore.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={section.score} className="mb-3" />
                <div className="space-y-2">
                  {section.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
      }
      )}
    </div>
  );
}
