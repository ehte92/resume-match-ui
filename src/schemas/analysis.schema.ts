import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

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
        {
          message: 'File size must be less than 5MB',
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
          message: 'Only PDF and DOCX files are accepted',
        }
      ),
    resumeId: z.string().optional(),
    jobDescription: z
      .string()
      .min(50, { message: 'Job description must be at least 50 characters' })
      .max(10000, { message: 'Job description is too long (max 10,000 characters)' }),
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
      message: 'Please either upload a resume file or select one from your library',
      path: ['resume'], // Show error on resume field
    }
  );

export type AnalysisFormData = z.infer<typeof analysisFormSchema>;
