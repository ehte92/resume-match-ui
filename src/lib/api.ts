import apiClient from './axios';
import type { AnalysisRequest, AnalysisResponse, AnalysisListResponse } from '@/types/api';

export const analyzeResume = async (data: AnalysisRequest): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', data.file);
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
