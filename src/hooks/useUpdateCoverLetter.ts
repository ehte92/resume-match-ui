import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCoverLetter } from '@/lib/api';
import type { CoverLetterUpdateRequest, CoverLetterResponse, APIError } from '@/types/api';

export const useUpdateCoverLetter = () => {
  const queryClient = useQueryClient();

  return useMutation<CoverLetterResponse, APIError, { id: string; data: CoverLetterUpdateRequest }>({
    mutationFn: ({ id, data }) => updateCoverLetter(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific cover letter and list
      queryClient.invalidateQueries({ queryKey: ['coverLetter', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['coverLetters'] });
    },
  });
};
