import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateCoverLetter } from '@/lib/api';
import type { CoverLetterGenerateRequest, CoverLetterResponse, APIError } from '@/types/api';

export const useGenerateCoverLetter = () => {
  const queryClient = useQueryClient();

  return useMutation<CoverLetterResponse, APIError, CoverLetterGenerateRequest>({
    mutationFn: generateCoverLetter,
    onSuccess: () => {
      // Invalidate cover letters list to refetch
      queryClient.invalidateQueries({ queryKey: ['coverLetters'] });
    },
  });
};
