"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function FormulaExplanation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Calculation Formula
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-mono text-gray-700 mb-2">
            ATS Score = 100 × (w₁×E + w₂×W + w₃×P + w₄×S + w₅×C + w₆×O)
          </p>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Where: E=Education, W=Work Experience, P=Projects, S=Skills, C=Certifications, O=Summary</p>
            <p>Weights: Education(15%), Work Experience(35%), Projects(15%), Skills(20%), Certifications(5%), Summary(10%)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
