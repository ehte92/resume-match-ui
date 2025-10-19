import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnalyses, getAnalysisById, deleteAnalysis } from '@/lib/api';
import type { AnalysisListResponse, AnalysisResponse, APIError } from '@/types/api';

export const useAnalysisHistory = (page: number = 1, pageSize: number = 10) => {
  return useQuery<AnalysisListResponse, APIError>({
    queryKey: ['analyses', page, pageSize],
    queryFn: () => getAnalyses(page, pageSize),
  });
};

export const useAnalysisById = (id: string) => {
  return useQuery<AnalysisResponse, APIError>({
    queryKey: ['analysis', id],
    queryFn: () => getAnalysisById(id),
    enabled: !!id,
  });
};

export const useDeleteAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation<void, APIError, string>({
    mutationFn: deleteAnalysis,
    onSuccess: () => {
      // Invalidate and refetch analyses list
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
  });
};
