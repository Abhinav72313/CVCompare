"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { memo } from "react";

import { ATSWeights } from '@/lib/atsCalculations';
import { Slider } from "./ui/slider";

interface WeightControlsProps {
  sectionScores: SectionScore[];
  onWeightChange: (section: keyof ATSWeights, value: number) => void;
  onResetToDefaults: () => void;
  getSectionKey: (sectionName: string) => keyof ATSWeights;
}

export const WeightControls = memo(function WeightControls({ 
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
         {sectionScores.map((section) => (
            <div key={section.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="font-medium">{section.name}</span>
                </div>
                <span className="text-sm text-gray-600">{(section.weight * 100).toFixed(0)}%</span>
              </div>               <Slider
                max={100}
                step={1}
                value={[Math.round(section.weight * 100)]}
                onValueChange={(value) => onWeightChange(getSectionKey(section.name), value[0])}
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
      </CardContent>    </Card>
  );
});
