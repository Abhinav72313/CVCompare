interface SectionScore {
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  icon: React.ReactNode;
  details: string[];
  description: string;
}

interface ChatMessage {
  id: string;
  user_id:string|null;
  resume_hash:string|null;
  jd_hash:string | null;
  role: 'user' | 'assistant';
  message: string;
  created_at: Date;
}