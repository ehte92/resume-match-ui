import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const analysisFormSchema = z.object({
  resume: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, {
      message: 'Resume file is required',
    })
    .refine((files) => files[0]?.size <= MAX_FILE_SIZE, {
      message: 'File size must be less than 5MB',
    })
    .refine((files) => ACCEPTED_FILE_TYPES.includes(files[0]?.type), {
      message: 'Only PDF and DOCX files are accepted',
    }),
  jobDescription: z
    .string()
    .min(50, { message: 'Job description must be at least 50 characters' })
    .max(10000, { message: 'Job description is too long (max 10,000 characters)' }),
});

export type AnalysisFormData = z.infer<typeof analysisFormSchema>;
