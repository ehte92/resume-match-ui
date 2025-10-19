import apiClient from './axios';
import type { AnalysisRequest, AnalysisResponse, AnalysisListResponse, ResumeResponse, ResumeListResponse } from '@/types/api';

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

  const response = await apiClient.post<AnalysisResponse>(
    '/api/analyses/create-guest',
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
