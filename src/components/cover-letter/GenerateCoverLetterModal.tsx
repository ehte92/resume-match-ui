import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X, Loader2, Sparkles, AlertCircle, CheckCircle, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { Label } from '@/components/retroui/Label';
import { Input } from '@/components/retroui/Input';
import { Textarea } from '@/components/retroui/Textarea';
import { Badge } from '@/components/retroui/Badge';
import { ResumeSelector } from '@/components/resume/ResumeSelector';
import { useGenerateCoverLetter } from '@/hooks/useGenerateCoverLetter';
import { coverLetterGenerateSchema, type CoverLetterGenerateFormData } from '@/schemas/cover-letter.schema';
import { getAvailableTags } from '@/lib/api';
import type { TagCategories } from '@/types/api';

interface GenerateCoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (id: string) => void;
  preSelectedResumeId?: string;
  preFilledJobData?: {
    jobDescription?: string;
    jobTitle?: string;
    companyName?: string;
  };
}

export const GenerateCoverLetterModal = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedResumeId,
  preFilledJobData,
}: GenerateCoverLetterModalProps) => {
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(preSelectedResumeId || null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<TagCategories | null>(null);
  const { mutate: generateCoverLetter, isPending } = useGenerateCoverLetter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CoverLetterGenerateFormData>({
    resolver: zodResolver(coverLetterGenerateSchema),
    defaultValues: {
      resume_id: preSelectedResumeId || '',
      job_description: preFilledJobData?.jobDescription || '',
      job_title: preFilledJobData?.jobTitle || '',
      company_name: preFilledJobData?.companyName || '',
      tone: 'professional',
      length: 'medium',
      tags: [],
    },
  });

  // Fetch available tags when modal opens
  useEffect(() => {
    if (isOpen && !availableTags) {
      getAvailableTags()
        .then(setAvailableTags)
        .catch(() => toast.error('Failed to load tags'));
    }
  }, [isOpen, availableTags]);

  const jobDescription = watch('job_description');
  const jobDescriptionLength = jobDescription?.length || 0;

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setValue('resume_id', resumeId);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      setValue('tags', newTags);
      return newTags;
    });
  };

  const onSubmit = (data: CoverLetterGenerateFormData) => {
    // Ensure tags are included
    const submissionData = {
      ...data,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    };

    generateCoverLetter(submissionData, {
      onSuccess: (response) => {
        toast.success('Cover letter generated successfully!');
        onSuccess?.(response.id);
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to generate cover letter');
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black shadow-2xl rounded max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary-hover p-6 border-b-2 border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-foreground" />
              <h2 className="text-2xl font-bold text-foreground">Generate Cover Letter</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-black/10 rounded transition-colors"
              disabled={isPending}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            {/* Resume Selection */}
            <div>
              <Label className="mb-2">Select Resume</Label>
              <ResumeSelector selectedResumeId={selectedResumeId} onSelectResume={handleResumeSelect} />
              {errors.resume_id && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.resume_id.message}
                </p>
              )}
            </div>

            {/* Job Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="job_description">Job Description</Label>
                <span
                  className={`text-xs ${
                    jobDescriptionLength < 50
                      ? 'text-red-600 font-medium'
                      : jobDescriptionLength > 10000
                      ? 'text-red-600 font-medium'
                      : jobDescriptionLength > 9000
                      ? 'text-yellow-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  {jobDescriptionLength.toLocaleString()} / 10,000
                </span>
              </div>
              <Textarea
                id="job_description"
                rows={6}
                placeholder="Paste the job description here..."
                {...register('job_description')}
                className={errors.job_description ? 'border-red-500' : ''}
              />
              {errors.job_description && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.job_description.message}
                </p>
              )}
            </div>

            {/* Job Title & Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job_title">
                  Job Title <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Input id="job_title" placeholder="e.g., Senior Software Engineer" {...register('job_title')} />
              </div>
              <div>
                <Label htmlFor="company_name">
                  Company Name <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Input id="company_name" placeholder="e.g., Google" {...register('company_name')} />
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <Label className="mb-3">Tone</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['professional', 'enthusiastic', 'balanced'] as const).map((tone) => (
                  <label
                    key={tone}
                    className={`border-2 rounded p-3 cursor-pointer transition-all ${
                      watch('tone') === tone
                        ? 'border-primary bg-primary/10'
                        : 'border-black hover:border-primary'
                    }`}
                  >
                    <input type="radio" value={tone} {...register('tone')} className="sr-only" />
                    <div className="font-medium capitalize">{tone}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {tone === 'professional' && 'Formal and polished'}
                      {tone === 'enthusiastic' && 'Energetic and passionate'}
                      {tone === 'balanced' && 'Mix of both'}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Length Selection */}
            <div>
              <Label className="mb-3">Length</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['short', 'medium', 'long'] as const).map((length) => (
                  <label
                    key={length}
                    className={`border-2 rounded p-3 cursor-pointer transition-all ${
                      watch('length') === length
                        ? 'border-primary bg-primary/10'
                        : 'border-black hover:border-primary'
                    }`}
                  >
                    <input type="radio" value={length} {...register('length')} className="sr-only" />
                    <div className="font-medium capitalize">{length}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {length === 'short' && '~250 words'}
                      {length === 'medium' && '~350 words'}
                      {length === 'long' && '~500 words'}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags Selection */}
            {availableTags && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className="h-4 w-4" />
                  <Label>
                    Tags <span className="text-xs text-muted-foreground">(Optional)</span>
                  </Label>
                </div>
                <div className="border-2 border-black rounded p-4 max-h-48 overflow-y-auto space-y-3">
                  {Object.entries(availableTags).map(([category, tags]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-muted-foreground mb-2 capitalize">
                        {category.replace('_', ' ')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 6).map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? 'solid' : 'outline'}
                            className={`cursor-pointer transition-all ${
                              selectedTags.includes(tag)
                                ? 'bg-primary text-white border-black'
                                : 'hover:bg-primary/10'
                            }`}
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">{selectedTags.length} tag(s) selected</p>
                )}
              </div>
            )}

            {/* Info Note */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded p-4">
              <p className="text-sm text-blue-900">
                <CheckCircle className="inline h-4 w-4 mr-1" />
                Generation typically takes 15-20 seconds. Your cover letter will be tailored to match the job
                description using your resume.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t-2 border-black">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
