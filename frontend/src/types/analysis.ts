export interface AnalysisStep {
  step_number: number;
  step_name: string;
  start_time: number;
  end_time: number;
  confidence: number;
  feedback: string;
}

export interface Analysis {
  id: string;
  video_id: string;
  steps: AnalysisStep[];
  overall_score: number;
  recommendations: string[];
  created_at: Date;
  updated_at: Date;
} 