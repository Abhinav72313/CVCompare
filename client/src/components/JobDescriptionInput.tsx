import { Card } from '@/components/ui/card';
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
    <Card className='p-1'>
      <div className="space-y-2">
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
    </Card>
  );
};