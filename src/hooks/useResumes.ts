import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResumes, getResumeById, uploadResume, deleteResume, getResumeDownloadUrl } from '@/lib/api';
import type { ResumeListResponse, ResumeResponse, APIError } from '@/types/api';

export const useResumes = (page: number = 1, pageSize: number = 10) => {
  return useQuery<ResumeListResponse, APIError>({
    queryKey: ['resumes', page, pageSize],
    queryFn: () => getResumes(page, pageSize),
  });
};

export const useResumeById = (id: string) => {
  return useQuery<ResumeResponse, APIError>({
    queryKey: ['resume', id],
    queryFn: () => getResumeById(id),
    enabled: !!id,
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();

  return useMutation<ResumeResponse, APIError, File>({
    mutationFn: uploadResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
};

export const useDeleteResume = () => {
  const queryClient = useQueryClient();

  return useMutation<void, APIError, string>({
    mutationFn: deleteResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
};

export const useResumeDownloadUrl = (id: string) => {
  return useQuery({
    queryKey: ['resume-download', id],
    queryFn: () => getResumeDownloadUrl(id),
    enabled: false, // Only run when manually triggered
    staleTime: 0, // Always fetch fresh URL
  });
};
