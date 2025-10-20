export interface AnalysisRequest {
  file?: File;
  resume_id?: string;
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

export interface UserProfileUpdateRequest {
  full_name?: string;
  email?: string;
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
}

export interface PasswordChangeResponse {
  message: string;
}

export interface AccountDeleteRequest {
  password: string;
  confirmation: string;
}

export interface AccountDeleteResponse {
  message: string;
}

// Cover Letter Types
export interface CoverLetterGenerateRequest {
  resume_id: string;
  job_description: string;
  job_title?: string;
  company_name?: string;
  tone: 'professional' | 'enthusiastic' | 'balanced';
  length: 'short' | 'medium' | 'long';
  tags?: string[];
}

export interface CoverLetterResponse {
  id: string;
  user_id: string;
  resume_id: string;
  job_title: string | null;
  company_name: string | null;
  job_description: string;
  cover_letter_text: string;
  tone: string;
  length: string;
  tags: string[] | null;
  openai_tokens_used: number;
  processing_time_ms: number;
  word_count: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface TagCategories {
  job_category: string[];
  work_type: string[];
  experience_level: string[];
  industry: string[];
  company_size: string[];
  status: string[];
}

export interface CoverLetterListResponse {
  cover_letters: CoverLetterResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface CoverLetterUpdateRequest {
  cover_letter_text: string;
}

export interface CoverLetterRefineRequest {
  refinement_instruction: string;
}

export interface CoverLetterRefineResponse {
  original_cover_letter: CoverLetterResponse;
  refined_cover_letter_text: string;
  refinement_instruction: string;
  tokens_used: number;
  processing_time_ms: number;
  word_count: number;
}

// Cover Letter Template Types
export interface CoverLetterTemplateResponse {
  id: string;
  name: string;
  description: string | null;
  category: string;
  tone: 'professional' | 'enthusiastic' | 'balanced';
  length: 'short' | 'medium' | 'long';
  template_text: string;
  is_system: boolean;
  user_id: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface CoverLetterTemplateListResponse {
  templates: CoverLetterTemplateResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface CoverLetterTemplateCreateRequest {
  name: string;
  description?: string;
  category: string;
  tone: 'professional' | 'enthusiastic' | 'balanced';
  length: 'short' | 'medium' | 'long';
  template_text: string;
}

export interface CoverLetterTemplateUpdateRequest {
  name?: string;
  description?: string;
  category?: string;
  tone?: 'professional' | 'enthusiastic' | 'balanced';
  length?: 'short' | 'medium' | 'long';
  template_text?: string;
}

export interface CoverLetterGenerateFromTemplateRequest {
  template_id: string;
  resume_id: string;
  job_description: string;
  job_title?: string;
  company_name?: string;
  tags?: string[];
}
