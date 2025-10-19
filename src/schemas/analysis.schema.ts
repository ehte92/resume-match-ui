import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Helper function to format bytes to human-readable size
const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const analysisFormSchema = z
  .object({
    resume: z
      .instanceof(FileList)
      .optional()
      .refine(
        (files) => {
          // If files is provided, it should have content
          if (files && files.length > 0) {
            return files[0]?.size <= MAX_FILE_SIZE;
          }
          return true;
        },
        (files) => {
          if (files && files.length > 0 && files[0]) {
            const actualSize = formatBytes(files[0].size);
            const maxSize = formatBytes(MAX_FILE_SIZE);
            return {
              message: `File too large (${actualSize}). Maximum allowed size is ${maxSize}.`,
            };
          }
          return { message: 'File size must be less than 5MB' };
        }
      )
      .refine(
        (files) => {
          // If files is provided, check file type
          if (files && files.length > 0) {
            return ACCEPTED_FILE_TYPES.includes(files[0]?.type);
          }
          return true;
        },
        {
          message: 'Invalid file format. Please upload a PDF (.pdf) or Word document (.docx).',
        }
      ),
    resumeId: z.string().optional(),
    jobDescription: z
      .string()
      .min(50, {
        message: 'Job description is too short. Please provide at least 50 characters for accurate analysis.'
      })
      .max(10000, {
        message: 'Job description is too long. Please keep it under 10,000 characters.'
      }),
    jobTitle: z.string().optional(),
    companyName: z.string().optional(),
  })
  .refine(
    (data) => {
      // Either resume file OR resumeId must be present, but not both
      const hasFile = data.resume && data.resume.length > 0;
      const hasResumeId = !!data.resumeId;
      return hasFile || hasResumeId;
    },
    {
      message: 'Please upload a resume file or select one from your library to continue.',
      path: ['resume'], // Show error on resume field
    }
  );

export type AnalysisFormData = z.infer<typeof analysisFormSchema>;
