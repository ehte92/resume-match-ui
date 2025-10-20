import { useQuery } from '@tanstack/react-query';
import { getCoverLetters, type CoverLetterFilters } from '@/lib/api';
import type { CoverLetterListResponse, APIError } from '@/types/api';

export const useCoverLetters = (
  page: number = 1,
  pageSize: number = 20,
  filters?: CoverLetterFilters
) => {
  return useQuery<CoverLetterListResponse, APIError>({
    queryKey: ['coverLetters', page, pageSize, filters],
    queryFn: () => getCoverLetters(page, pageSize, filters),
  });
};
