import apiClient from './axios';
import { getAccessToken } from './cookies';
import type {
  AnalysisRequest,
  AnalysisResponse,
  AnalysisListResponse,
  ResumeResponse,
  ResumeListResponse,
  CoverLetterGenerateRequest,
  CoverLetterResponse,
  CoverLetterListResponse,
  CoverLetterUpdateRequest,
  CoverLetterRefineRequest,
  CoverLetterRefineResponse,
  CoverLetterTemplateResponse,
  CoverLetterTemplateListResponse,
  CoverLetterTemplateCreateRequest,
  CoverLetterTemplateUpdateRequest,
  CoverLetterGenerateFromTemplateRequest,
  ParsedJobData,
} from '@/types/api';

export const analyzeResume = async (data: AnalysisRequest): Promise<AnalysisResponse> => {
  const formData = new FormData();

  // Add file or resume_id
  if (data.file) {
    formData.append('file', data.file);
  }
  if (data.resume_id) {
    formData.append('resume_id', data.resume_id);
  }

  formData.append('job_description', data.job_description);

  if (data.job_title) {
    formData.append('job_title', data.job_title);
  }
  if (data.company_name) {
    formData.append('company_name', data.company_name);
  }

  // Use authenticated endpoint if user is logged in, otherwise use guest endpoint
  const isAuthenticated = !!getAccessToken();
  const endpoint = isAuthenticated ? '/api/analyses/create' : '/api/analyses/create-guest';

  const response = await apiClient.post<AnalysisResponse>(
    endpoint,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

export const getAnalyses = async (page: number = 1, pageSize: number = 10): Promise<AnalysisListResponse> => {
  const response = await apiClient.get<AnalysisListResponse>('/api/analyses/', {
    params: { page, page_size: pageSize },
  });
  return response.data;
};

export const getAnalysisById = async (id: string): Promise<AnalysisResponse> => {
  const response = await apiClient.get<AnalysisResponse>(`/api/analyses/${id}`);
  return response.data;
};

export const deleteAnalysis = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/analyses/${id}`);
};

// Resume API functions
export const uploadResume = async (file: File): Promise<ResumeResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ResumeResponse>(
    '/api/resumes/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const getResumes = async (page: number = 1, pageSize: number = 10): Promise<ResumeListResponse> => {
  const response = await apiClient.get<ResumeListResponse>('/api/resumes/', {
    params: { page, page_size: pageSize },
  });
  return response.data;
};

export const getResumeById = async (id: string): Promise<ResumeResponse> => {
  const response = await apiClient.get<ResumeResponse>(`/api/resumes/${id}`);
  return response.data;
};

export const deleteResume = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/resumes/${id}`);
};

export const getResumeDownloadUrl = async (id: string): Promise<{ download_url: string; expires_at: string }> => {
  const response = await apiClient.get(`/api/resumes/${id}/download`);
  return response.data;
};

// Cover Letter API functions
export const generateCoverLetter = async (data: CoverLetterGenerateRequest): Promise<CoverLetterResponse> => {
  const response = await apiClient.post<CoverLetterResponse>('/api/cover-letters/generate', data);
  return response.data;
};

export interface CoverLetterFilters {
  search?: string;
  tags?: string[];
  tone?: string | null;
  length?: string | null;
  sortBy?: string;
  sortOrder?: string;
}

export const getCoverLetters = async (
  page: number = 1,
  pageSize: number = 20,
  filters?: CoverLetterFilters
): Promise<CoverLetterListResponse> => {
  const params: Record<string, string | number> = {
    page,
    page_size: pageSize,
  };

  if (filters) {
    if (filters.search) params.search = filters.search;
    if (filters.tags && filters.tags.length > 0) params.tags = filters.tags.join(',');
    if (filters.tone) params.tone = filters.tone;
    if (filters.length) params.length = filters.length;
    if (filters.sortBy) params.sort_by = filters.sortBy;
    if (filters.sortOrder) params.sort_order = filters.sortOrder;
  }

  const response = await apiClient.get<CoverLetterListResponse>('/api/cover-letters/', {
    params,
  });
  return response.data;
};

export const getCoverLetterById = async (id: string): Promise<CoverLetterResponse> => {
  const response = await apiClient.get<CoverLetterResponse>(`/api/cover-letters/${id}`);
  return response.data;
};

export const updateCoverLetter = async (id: string, data: CoverLetterUpdateRequest): Promise<CoverLetterResponse> => {
  const response = await apiClient.put<CoverLetterResponse>(`/api/cover-letters/${id}`, data);
  return response.data;
};

export const deleteCoverLetter = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/cover-letters/${id}`);
};

export const exportCoverLetter = async (
  id: string,
  format: 'pdf' | 'docx' | 'txt',
  includeMetadata: boolean = false
): Promise<Blob> => {
  const response = await apiClient.get(`/api/cover-letters/${id}/export`, {
    params: { format, include_metadata: includeMetadata },
    responseType: 'blob',
  });
  return response.data;
};

export const getAvailableTags = async (): Promise<import('@/types/api').TagCategories> => {
  const response = await apiClient.get('/api/cover-letters/tags');
  return response.data;
};

export const refineCoverLetter = async (
  id: string,
  data: CoverLetterRefineRequest
): Promise<CoverLetterRefineResponse> => {
  const response = await apiClient.post<CoverLetterRefineResponse>(
    `/api/cover-letters/${id}/refine`,
    data
  );
  return response.data;
};

// Cover Letter Template API functions
export interface TemplateFilters {
  category?: string;
  tone?: string | null;
  is_system?: boolean | null;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const getTemplateCategories = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>('/api/cover-letter-templates/categories');
  return response.data;
};

export const getTemplates = async (
  page: number = 1,
  pageSize: number = 20,
  filters?: TemplateFilters
): Promise<CoverLetterTemplateListResponse> => {
  const params: Record<string, string | number | boolean> = {
    page,
    page_size: pageSize,
  };

  if (filters) {
    if (filters.category) params.category = filters.category;
    if (filters.tone) params.tone = filters.tone;
    if (filters.is_system !== null && filters.is_system !== undefined) params.is_system = filters.is_system;
    if (filters.search) params.search = filters.search;
    if (filters.sortBy) params.sort_by = filters.sortBy;
    if (filters.sortOrder) params.sort_order = filters.sortOrder;
  }

  const response = await apiClient.get<CoverLetterTemplateListResponse>('/api/cover-letter-templates/', {
    params,
  });
  return response.data;
};

export const getTemplateById = async (id: string): Promise<CoverLetterTemplateResponse> => {
  const response = await apiClient.get<CoverLetterTemplateResponse>(`/api/cover-letter-templates/${id}`);
  return response.data;
};

export const createTemplate = async (data: CoverLetterTemplateCreateRequest): Promise<CoverLetterTemplateResponse> => {
  const response = await apiClient.post<CoverLetterTemplateResponse>('/api/cover-letter-templates/', data);
  return response.data;
};

export const updateTemplate = async (id: string, data: CoverLetterTemplateUpdateRequest): Promise<CoverLetterTemplateResponse> => {
  const response = await apiClient.put<CoverLetterTemplateResponse>(`/api/cover-letter-templates/${id}`, data);
  return response.data;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/cover-letter-templates/${id}`);
};

export const generateCoverLetterFromTemplate = async (data: CoverLetterGenerateFromTemplateRequest): Promise<CoverLetterResponse> => {
  // This will be implemented when we add the backend endpoint for template-based generation
  // For now, we'll get the template and use regular generation with the template text as guidance
  const template = await getTemplateById(data.template_id);

  // Use regular cover letter generation
  return generateCoverLetter({
    resume_id: data.resume_id,
    job_description: data.job_description,
    job_title: data.job_title,
    company_name: data.company_name,
    tone: template.tone,
    length: template.length,
    tags: data.tags,
  });
};

// Job Parser API functions
export const parseJobDescription = async (
  sourceType: 'text' | 'url',
  content: string
): Promise<ParsedJobData> => {
  const response = await apiClient.post<ParsedJobData>('/api/job-parser/parse', {
    source_type: sourceType,
    content,
  });
  return response.data;
};
