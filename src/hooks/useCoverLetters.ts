import { useQuery } from '@tanstack/react-query';
import { getCoverLetters } from '@/lib/api';
import type { CoverLetterListResponse, APIError } from '@/types/api';

export const useCoverLetters = (page: number = 1, pageSize: number = 20) => {
  return useQuery<CoverLetterListResponse, APIError>({
    queryKey: ['coverLetters', page, pageSize],
    queryFn: () => getCoverLetters(page, pageSize),
  });
};
