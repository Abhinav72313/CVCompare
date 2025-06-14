import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ 
  value, 
  onChange 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Job Description</CardTitle>
        <CardDescription>
          Paste the complete job description below to analyze how well your resume matches
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="job-description">Job Description</Label>
          <Textarea
            id="job-description"
            placeholder="Paste the complete job description here including requirements, responsibilities, and qualifications..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[200px] resize-y"
          />
          <p className="text-sm text-muted-foreground">
            {value.length} characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
};