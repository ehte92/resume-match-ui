import { z } from 'zod';

export const coverLetterGenerateSchema = z.object({
  resume_id: z.string().uuid('Please select a valid resume'),
  job_description: z
    .string()
    .min(50, 'Job description must be at least 50 characters')
    .max(10000, 'Job description cannot exceed 10,000 characters'),
  job_title: z.string().max(255).optional(),
  company_name: z.string().max(255).optional(),
  tone: z.enum(['professional', 'enthusiastic', 'balanced'], {
    errorMap: () => ({ message: 'Please select a valid tone' }),
  }),
  length: z.enum(['short', 'medium', 'long'], {
    errorMap: () => ({ message: 'Please select a valid length' }),
  }),
});

export const coverLetterUpdateSchema = z.object({
  cover_letter_text: z
    .string()
    .min(100, 'Cover letter must be at least 100 characters'),
});

export type CoverLetterGenerateFormData = z.infer<typeof coverLetterGenerateSchema>;
export type CoverLetterUpdateFormData = z.infer<typeof coverLetterUpdateSchema>;
