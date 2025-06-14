"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

import { ATSWeights } from '@/lib/atsCalculations';

interface SectionScore {
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  icon: React.ReactNode;
  details: string[];
  description: string;
}

interface WeightControlsProps {
  sectionScores: SectionScore[];
  onWeightChange: (section: keyof ATSWeights, value: number) => void;
  onResetToDefaults: () => void;
  getSectionKey: (sectionName: string) => keyof ATSWeights;
}

export function WeightControls({ 
  sectionScores, 
  onWeightChange, 
  onResetToDefaults, 
  getSectionKey 
}: WeightControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-purple-600" />
          Adjust Scoring Weights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {sectionScores.map((section, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="font-medium">{section.name}</span>
                </div>
                <span className="text-sm text-gray-600">{(section.weight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={section.weight * 100}
                onChange={(e) => onWeightChange(getSectionKey(section.name), parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-gray-500">{section.description}</p>
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <button 
              onClick={onResetToDefaults}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
