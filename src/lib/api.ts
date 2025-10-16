import apiClient from './axios';
import type { AnalysisRequest, AnalysisResponse } from '@/types/api';

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
