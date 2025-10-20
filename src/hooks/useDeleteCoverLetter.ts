import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCoverLetter } from '@/lib/api';
import type { APIError } from '@/types/api';

export const useDeleteCoverLetter = () => {
  const queryClient = useQueryClient();

  return useMutation<void, APIError, string>({
    mutationFn: deleteCoverLetter,
    onSuccess: () => {
      // Invalidate cover letters list to refetch
      queryClient.invalidateQueries({ queryKey: ['coverLetters'] });
    },
  });
};
