import { useMutation } from '@tanstack/react-query';
import { analyzeResume } from '@/lib/api';
import type { AnalysisRequest, AnalysisResponse, APIError } from '@/types/api';

export const useAnalyzeResume = () => {
  return useMutation<AnalysisResponse, APIError, AnalysisRequest>({
    mutationFn: analyzeResume,
  });
};
