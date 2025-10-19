export interface AnalysisRequest {
  file: File;
  job_description: string;
  job_title?: string;
  company_name?: string;
}

export interface ATSIssue {
  type: string;
  severity: string;
  section?: string;
  message: string;
  recommendation: string;
}

export interface AISuggestion {
  type: string;
  priority: string;
  category?: string;
  issue: string;
  suggestion: string;
  example?: string;
  impact?: string;
}

export interface RewrittenBullet {
  original: string;
  improved: string;
  reason?: string;
}

export interface AnalysisResponse {
  id: string;
  user_id: string | null;
  resume_id: string | null;
  job_description: string;
  job_title: string | null;
  company_name: string | null;
  match_score: number;
  ats_score: number;
  semantic_similarity: number;
  matching_keywords: string[];
  missing_keywords: string[];
  ats_issues: ATSIssue[];
  ai_suggestions?: AISuggestion[];
  rewritten_bullets?: RewrittenBullet[];
  openai_tokens_used?: number;
  processing_time_ms: number;
  created_at: string;
}

export interface APIError {
  message: string;
  status: number;
  data?: unknown;
}

export interface AnalysisListResponse {
  analyses: AnalysisResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface ResumeResponse {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  parsed_text: string | null;
  parsed_data: Record<string, unknown> | null;
  storage_backend: string;
  download_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ResumeListResponse {
  resumes: ResumeResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface ResumeUploadRequest {
  file: File;
}
