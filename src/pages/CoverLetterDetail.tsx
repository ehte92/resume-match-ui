import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  Copy,
  Download,
  Trash2,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Loader2,
  ChevronDown,
  Tag,
  Sparkles,
  BookTemplate,
} from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { Badge } from '@/components/retroui/Badge';
import { RefineModal } from '@/components/cover-letter/RefineModal';
import { RichTextEditor } from '@/components/cover-letter/RichTextEditor';
import { getCoverLetterById, exportCoverLetter, createTemplate, getTemplateCategories } from '@/lib/api';
import { useUpdateCoverLetter } from '@/hooks/useUpdateCoverLetter';
import { useDeleteCoverLetter } from '@/hooks/useDeleteCoverLetter';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { CoverLetterResponse, APIError } from '@/types/api';

export const CoverLetterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);

  const { data: coverLetter, isLoading, error } = useQuery<CoverLetterResponse, APIError>({
    queryKey: ['coverLetter', id],
    queryFn: () => getCoverLetterById(id!),
    enabled: !!id,
  });

  const { mutate: updateCoverLetter, isPending: isUpdating } = useUpdateCoverLetter();
  const { mutate: deleteCoverLetter, isPending: isDeleting } = useDeleteCoverLetter();

  usePageTitle(coverLetter?.job_title ? `${coverLetter.job_title} - Cover Letter` : 'Cover Letter');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getToneBadgeColor = (tone: string) => {
    switch (tone) {
      case 'professional':
        return 'bg-blue-600 text-white border-black';
      case 'enthusiastic':
        return 'bg-orange-500 text-white border-black';
      case 'balanced':
        return 'bg-purple-600 text-white border-black';
      default:
        return 'bg-gray-600 text-white border-black';
    }
  };

  const calculateDropdownPosition = () => {
    if (!exportButtonRef.current) return;

    const buttonRect = exportButtonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 114; // Approximate height of dropdown with 3 items

    // Check if there's enough space below the button
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // If not enough space below (less than dropdown height + 20px buffer),
    // and there's more space above, position dropdown on top
    if (spaceBelow < dropdownHeight + 20 && spaceAbove > spaceBelow) {
      setDropdownPosition('top');
    } else {
      setDropdownPosition('bottom');
    }
  };

  const handleEdit = () => {
    setEditedText(coverLetter!.cover_letter_text);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!id) return;
    updateCoverLetter(
      { id, data: { cover_letter_text: editedText } },
      {
        onSuccess: () => {
          toast.success('Cover letter updated');
          setIsEditing(false);
        },
        onError: () => toast.error('Failed to update cover letter'),
      }
    );
  };

  const handleCopy = async () => {
    if (!coverLetter) return;
    await navigator.clipboard.writeText(coverLetter.cover_letter_text);
    toast.success('Copied to clipboard');
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    if (!id || !coverLetter) return;

    setIsExporting(true);
    setIsExportDropdownOpen(false);

    try {
      const blob = await exportCoverLetter(id, format);

      // Generate filename based on format
      const extension = format;
      const jobTitle = coverLetter.job_title?.replace(/\s+/g, '-') || 'cover-letter';
      const companyName = coverLetter.company_name?.replace(/\s+/g, '-') || '';
      const filename = companyName
        ? `${companyName}-${jobTitle}.${extension}`
        : `${jobTitle}.${extension}`;

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export cover letter');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = () => {
    if (!id || !window.confirm('Are you sure you want to delete this cover letter?')) return;
    deleteCoverLetter(id, {
      onSuccess: () => {
        toast.success('Cover letter deleted');
        navigate('/cover-letters');
      },
      onError: () => toast.error('Failed to delete'),
    });
  };

  const handleAcceptRefinement = (refinedText: string) => {
    if (!id) return;
    updateCoverLetter(
      { id, data: { cover_letter_text: refinedText } },
      {
        onSuccess: () => {
          toast.success('Cover letter updated with refined version');
        },
        onError: () => toast.error('Failed to update cover letter'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !coverLetter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load cover letter</p>
          <Button variant="outline" onClick={() => navigate('/cover-letters')}>
            Back to Cover Letters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/cover-letters')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cover Letters
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 border-2 border-black bg-white shadow-xl rounded overflow-hidden">
            <div className="bg-gradient-to-br from-primary to-primary-hover p-4 sm:p-6 border-b-2 border-black">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {coverLetter.job_title && (
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                      <h1 className="text-xl sm:text-2xl font-bold">{coverLetter.job_title}</h1>
                    </div>
                  )}
                  {coverLetter.company_name && (
                    <div className="flex items-center gap-2 text-foreground/80 text-sm sm:text-base">
                      <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{coverLetter.company_name}</span>
                    </div>
                  )}
                </div>
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-white">
              {isEditing ? (
                <>
                  <RichTextEditor
                    content={editedText}
                    onChange={setEditedText}
                    placeholder="Edit your cover letter..."
                  />
                  <div className="flex gap-3 mt-4">
                    <Button onClick={handleSave} disabled={isUpdating} className="flex-1">
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="prose max-w-none text-foreground"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(coverLetter.cover_letter_text),
                    }}
                  />
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-black space-y-3">
                    {/* Row 1: Edit and Refine */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button variant="outline" onClick={handleEdit} className="w-full sm:flex-1">
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsRefineModalOpen(true)}
                        className="w-full sm:flex-1 border-purple-500 text-purple-700 hover:bg-purple-50"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Refine with AI
                      </Button>
                    </div>

                    {/* Row 2: Save as Template, Copy, Export */}
                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsSaveTemplateModalOpen(true)}
                        className="flex-1 border-blue-500 text-blue-700 hover:bg-blue-50"
                      >
                        <BookTemplate className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Save as Template</span>
                        <span className="sm:hidden">Template</span>
                      </Button>
                      <Button variant="outline" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                      </Button>

                      {/* Export Dropdown */}
                      <div className="relative" ref={exportDropdownRef}>
                        <Button
                          ref={exportButtonRef}
                          variant="outline"
                          onClick={() => {
                            calculateDropdownPosition();
                            setIsExportDropdownOpen(!isExportDropdownOpen);
                          }}
                          disabled={isExporting}
                          className="gap-1"
                        >
                          {isExporting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </Button>

                        {/* Dropdown Menu */}
                        {isExportDropdownOpen && (
                          <div className={`absolute right-0 w-48 bg-white border-2 border-black shadow-[4px_4px_0_0_#000] rounded overflow-hidden z-10 ${
                            dropdownPosition === 'top' ? 'bottom-full mb-2' : 'mt-2'
                          }`}>
                            <button
                              onClick={() => handleExport('pdf')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <FileText className="h-4 w-4" />
                              Download as PDF
                            </button>
                            <button
                              onClick={() => handleExport('docx')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                            >
                              <FileText className="h-4 w-4" />
                              Download as DOCX
                            </button>
                            <button
                              onClick={() => handleExport('txt')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                            >
                              <FileText className="h-4 w-4" />
                              Download as TXT
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Metadata Card */}
            <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 sm:p-4 border-b-2 border-black">
                <h3 className="font-bold text-white text-sm sm:text-base">Details</h3>
              </div>
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tone & Length</p>
                  <div className="flex gap-2">
                    <Badge variant="solid" className={getToneBadgeColor(coverLetter.tone)}>
                      {coverLetter.tone}
                    </Badge>
                    <Badge variant="outline" className="border-black">
                      {coverLetter.length}
                    </Badge>
                  </div>
                </div>
                {coverLetter.tags && coverLetter.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">Tags</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {coverLetter.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-black text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Word Count</p>
                  <p className="text-sm font-medium">{coverLetter.word_count} words</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Created</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(coverLetter.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Generation Time</p>
                  <p className="text-sm">{(coverLetter.processing_time_ms / 1000).toFixed(1)}s</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tokens Used</p>
                  <p className="text-sm">{coverLetter.openai_tokens_used}</p>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 sm:p-4 border-b-2 border-black">
                <h3 className="font-bold text-white text-sm sm:text-base">Danger Zone</h3>
              </div>
              <div className="p-3 sm:p-4">
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full text-destructive hover:bg-destructive hover:text-white"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Cover Letter
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refine Modal */}
      <RefineModal
        isOpen={isRefineModalOpen}
        onClose={() => setIsRefineModalOpen(false)}
        coverLetter={coverLetter}
        onAcceptRefinement={handleAcceptRefinement}
      />

      {/* Save as Template Modal */}
      <SaveAsTemplateModal
        isOpen={isSaveTemplateModalOpen}
        onClose={() => setIsSaveTemplateModalOpen(false)}
        coverLetter={coverLetter}
      />
    </div>
  );
};

// Save as Template Modal Component
interface SaveAsTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  coverLetter: CoverLetterResponse;
}

function SaveAsTemplateModal({ isOpen, onClose, coverLetter }: SaveAsTemplateModalProps) {
  const queryClient = useQueryClient();
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'balanced'>(coverLetter.tone as 'professional' | 'enthusiastic' | 'balanced');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>(coverLetter.length as 'short' | 'medium' | 'long');

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['template-categories'],
    queryFn: getTemplateCategories,
    enabled: isOpen,
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template saved successfully!');
      onClose();
      resetForm();
    },
    onError: () => {
      toast.error('Failed to save template');
    },
  });

  const resetForm = () => {
    setTemplateName('');
    setTemplateDescription('');
    setCategory('');
    setTone(coverLetter.tone as 'professional' | 'enthusiastic' | 'balanced');
    setLength(coverLetter.length as 'short' | 'medium' | 'long');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (!category.trim()) {
      toast.error('Please select or enter a category');
      return;
    }

    createTemplateMutation.mutate({
      name: templateName,
      description: templateDescription || undefined,
      category: category,
      tone,
      length,
      template_text: coverLetter.cover_letter_text,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b-4 border-black bg-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black mb-1">Save as Template</h2>
                <p className="text-sm text-gray-700">Create a reusable template from this cover letter</p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 bg-white border-4 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-black mb-2">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Software Engineer - Enthusiastic"
                  className="w-full px-4 py-2 border-4 border-black font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-black mb-2">Description (optional)</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe when to use this template..."
                  rows={3}
                  className="w-full px-4 py-2 border-4 border-black font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-black mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border-4 border-black font-bold focus:outline-none"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-600">Or enter a new category:</p>
                <input
                  type="text"
                  value={category && !categories.includes(category) ? category : ''}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="w-full mt-2 px-4 py-2 border-4 border-black font-bold focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-black mb-2">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as 'professional' | 'enthusiastic' | 'balanced')}
                  className="w-full px-4 py-2 border-4 border-black font-bold focus:outline-none"
                >
                  <option value="professional">Professional</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="balanced">Balanced</option>
                </select>
              </div>

              {/* Length */}
              <div>
                <label className="block text-sm font-black mb-2">Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value as 'short' | 'medium' | 'long')}
                  className="w-full px-4 py-2 border-4 border-black font-bold focus:outline-none"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-black mb-2">Template Preview</label>
                <div className="p-4 bg-gray-50 border-4 border-black max-h-48 overflow-y-auto">
                  <p className="text-sm font-mono whitespace-pre-wrap">{coverLetter.cover_letter_text}</p>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  Tip: You can manually edit the template text later by creating the template and then editing it.
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-6 border-t-4 border-black bg-gray-100">
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onClose} disabled={createTemplateMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createTemplateMutation.isPending}>
                {createTemplateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
