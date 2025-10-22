import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, Loader2, Sparkles, AlertCircle, CheckCircle, Tag as TagIcon, BookTemplate, Link as LinkIcon, FileText } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { Label } from '@/components/retroui/Label';
import { Input } from '@/components/retroui/Input';
import { Textarea } from '@/components/retroui/Textarea';
import { Badge } from '@/components/retroui/Badge';
import { ResumeSelector } from '@/components/resume/ResumeSelector';
import TemplateBrowser from '@/components/templates/TemplateBrowser';
import TemplatePreviewModal from '@/components/templates/TemplatePreviewModal';
import { useGenerateCoverLetter } from '@/hooks/useGenerateCoverLetter';
import { coverLetterGenerateSchema, type CoverLetterGenerateFormData } from '@/schemas/cover-letter.schema';
import { getAvailableTags, parseJobDescription } from '@/lib/api';
import type { TagCategories, CoverLetterTemplateResponse } from '@/types/api';

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
  const [viewMode, setViewMode] = useState<'form' | 'templates'>('form');
  const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplateResponse | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CoverLetterTemplateResponse | null>(null);
  const [parseMode, setParseMode] = useState<'text' | 'url'>('url');
  const [jobInput, setJobInput] = useState('');
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const { mutate: generateCoverLetter, isPending } = useGenerateCoverLetter();

  // Job parser mutation
  const parseMutation = useMutation({
    mutationFn: (input: { type: 'text' | 'url'; content: string }) =>
      parseJobDescription(input.type, input.content),
    onSuccess: (data) => {
      // Auto-populate form fields
      if (data.job_title) setValue('job_title', data.job_title);
      if (data.company_name) setValue('company_name', data.company_name);
      setValue('job_description', data.raw_text);
      setExtractedSkills(data.key_skills);
      setJobInput(''); // Clear input after successful parse
      toast.success('Job description parsed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to parse job description');
    },
  });

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
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white border-2 border-black shadow-2xl rounded max-w-3xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary to-primary-hover p-4 sm:p-6 border-b-2 border-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Generate Cover Letter</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-black/10 rounded transition-colors"
                disabled={isPending}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setViewMode('form')}
                className={`px-3 sm:px-4 py-2 border-2 border-black font-bold text-sm sm:text-base transition-all ${
                  viewMode === 'form'
                    ? 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-transparent text-foreground hover:bg-white/20'
                }`}
              >
                <Sparkles className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Custom Generation
              </button>
              <button
                onClick={() => setViewMode('templates')}
                className={`px-3 sm:px-4 py-2 border-2 border-black font-bold text-sm sm:text-base transition-all ${
                  viewMode === 'templates'
                    ? 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-transparent text-foreground hover:bg-white/20'
                }`}
              >
                <BookTemplate className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Use Template
              </button>
            </div>
          </div>

        {/* Template View */}
        {viewMode === 'templates' ? (
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
            <TemplateBrowser
              onSelectTemplate={(template) => {
                setSelectedTemplate(template);
                setPreviewTemplate(template);
              }}
              selectedTemplateId={selectedTemplate?.id}
            />
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
            <div className="space-y-4 sm:space-y-6">
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

            {/* Smart Parse Section */}
            <div className="border-4 border-purple-500 bg-purple-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-purple-700" />
                <h3 className="font-bold text-sm sm:text-base text-purple-900">Auto-Fill Assistant</h3>
              </div>
              <p className="text-xs sm:text-sm text-purple-800 mb-3 sm:mb-4">
                Paste a job posting URL or text, and we'll automatically extract and fill in the details for you!
              </p>

              {/* Toggle: Text vs URL */}
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setParseMode('url')}
                  className={`px-3 sm:px-4 py-2 border-2 border-black font-bold text-xs sm:text-sm transition-all ${
                    parseMode === 'url'
                      ? 'bg-purple-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-purple-100'
                  }`}
                >
                  <LinkIcon className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  From URL
                </button>
                <button
                  type="button"
                  onClick={() => setParseMode('text')}
                  className={`px-3 sm:px-4 py-2 border-2 border-black font-bold text-xs sm:text-sm transition-all ${
                    parseMode === 'text'
                      ? 'bg-purple-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:bg-purple-100'
                  }`}
                >
                  <FileText className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  Paste Text
                </button>
              </div>

              {/* Input Field */}
              {parseMode === 'url' ? (
                <Input
                  type="url"
                  placeholder="https://www.linkedin.com/jobs/view/..."
                  value={jobInput}
                  onChange={(e) => setJobInput(e.target.value)}
                  className="mb-3 text-sm"
                />
              ) : (
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jobInput}
                  onChange={(e) => setJobInput(e.target.value)}
                  rows={4}
                  className="mb-3 text-sm"
                />
              )}

              {/* Parse Button */}
              <Button
                type="button"
                onClick={() => parseMutation.mutate({ type: parseMode, content: jobInput })}
                disabled={!jobInput || parseMutation.isPending}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 border-purple-800 text-sm"
              >
                {parseMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    Reading Job Details...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Auto-Fill from Job Posting
                  </>
                )}
              </Button>

              {/* Extracted Skills Display */}
              {extractedSkills.length > 0 && (
                <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-green-50 border-2 border-green-500 rounded">
                  <p className="font-semibold text-xs sm:text-sm text-green-900 mb-2 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Extracted Key Skills:
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {extractedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-green-100 border-2 border-green-600 text-xs sm:text-sm font-medium text-green-900 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="job_description" className="text-xs sm:text-sm">Job Description</Label>
                <span
                  className={`text-[10px] sm:text-xs ${
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
                className={`text-sm ${errors.job_description ? 'border-red-500' : ''}`}
              />
              {errors.job_description && (
                <p className="text-xs sm:text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {errors.job_description.message}
                </p>
              )}
            </div>

            {/* Job Title & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="job_title" className="text-xs sm:text-sm">
                  Job Title <span className="text-[10px] sm:text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Input id="job_title" placeholder="e.g., Senior Software Engineer" {...register('job_title')} className="text-sm" />
              </div>
              <div>
                <Label htmlFor="company_name" className="text-xs sm:text-sm">
                  Company Name <span className="text-[10px] sm:text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Input id="company_name" placeholder="e.g., Google" {...register('company_name')} className="text-sm" />
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <Label className="mb-2 sm:mb-3 text-xs sm:text-sm">Tone</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {(['professional', 'enthusiastic', 'balanced'] as const).map((tone) => (
                  <label
                    key={tone}
                    className={`border-2 rounded p-2.5 sm:p-3 cursor-pointer transition-all ${
                      watch('tone') === tone
                        ? 'border-primary bg-primary/10'
                        : 'border-black hover:border-primary'
                    }`}
                  >
                    <input type="radio" value={tone} {...register('tone')} className="sr-only" />
                    <div className="font-medium capitalize text-sm sm:text-base">{tone}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
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
              <Label className="mb-2 sm:mb-3 text-xs sm:text-sm">Length</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {(['short', 'medium', 'long'] as const).map((length) => (
                  <label
                    key={length}
                    className={`border-2 rounded p-2.5 sm:p-3 cursor-pointer transition-all ${
                      watch('length') === length
                        ? 'border-primary bg-primary/10'
                        : 'border-black hover:border-primary'
                    }`}
                  >
                    <input type="radio" value={length} {...register('length')} className="sr-only" />
                    <div className="font-medium capitalize text-sm sm:text-base">{length}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
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
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <TagIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <Label className="text-xs sm:text-sm">
                    Tags <span className="text-[10px] sm:text-xs text-muted-foreground">(Optional)</span>
                  </Label>
                </div>
                <div className="border-2 border-black rounded p-3 sm:p-4 max-h-40 sm:max-h-48 overflow-y-auto space-y-2 sm:space-y-3">
                  {Object.entries(availableTags).map(([category, tags]) => (
                    <div key={category}>
                      <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1.5 sm:mb-2 capitalize">
                        {category.replace('_', ' ')}
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {tags.slice(0, 6).map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? 'solid' : 'outline'}
                            className={`cursor-pointer transition-all text-xs ${
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
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">{selectedTags.length} tag(s) selected</p>
                )}
              </div>
            )}

            {/* Info Note */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-900">
                <CheckCircle className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                Generation typically takes 15-20 seconds. Your cover letter will be tailored to match the job
                description using your resume.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-black">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1 text-sm">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1 text-sm">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </div>
            </div>
          </form>
        )}

        {/* Template Mode Footer */}
        {viewMode === 'templates' && (
          <div className="p-4 sm:p-6 border-t-2 border-black bg-gray-100">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <Button variant="outline" onClick={onClose} className="text-sm">
                Cancel
              </Button>
              {selectedTemplate && (
                <Button
                  onClick={() => setPreviewTemplate(selectedTemplate)}
                  variant="outline"
                  className="text-sm"
                >
                  Preview Template
                </Button>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          template={previewTemplate}
          onUseTemplate={() => {
            toast.info('Template-based generation coming soon!');
            setPreviewTemplate(null);
          }}
        />
      )}
    </>
  );
};
