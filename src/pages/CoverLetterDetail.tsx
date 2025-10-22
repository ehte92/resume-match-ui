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
  AlertTriangle,
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!id) return;
    deleteCoverLetter(id, {
      onSuccess: () => {
        toast.success('Cover letter deleted');
        navigate('/cover-letters');
      },
      onError: () => toast.error('Failed to delete'),
    });
    setIsDeleteModalOpen(false);
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
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                    <Button onClick={handleSave} disabled={isUpdating} className="flex-1 text-sm">
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                          <span className="text-xs sm:text-sm">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Save Changes</span>
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating} className="text-sm">
                      <X className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Cancel</span>
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
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-black">
                    {/* Action Buttons - Two Rows for Better Organization */}
                    <div className="space-y-2">
                      {/* Primary Actions Row */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={handleEdit} className="text-sm">
                          <Edit3 className="mr-2 h-4 w-4" />
                          <span className="text-xs sm:text-sm">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsRefineModalOpen(true)}
                          className="border-purple-500 text-purple-700 hover:bg-purple-50 text-sm"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          <span className="text-xs sm:text-sm">Refine</span>
                        </Button>
                      </div>

                      {/* Secondary Actions Row */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsSaveTemplateModalOpen(true)}
                          className="text-sm"
                        >
                          <BookTemplate className="mr-1 sm:mr-2 h-4 w-4" />
                          <span className="text-xs sm:text-sm hidden sm:inline">Template</span>
                          <span className="text-xs sm:hidden">Save</span>
                        </Button>
                        <Button variant="outline" onClick={handleCopy} className="text-sm">
                          <Copy className="mr-1 sm:mr-2 h-4 w-4" />
                          <span className="text-xs sm:text-sm hidden sm:inline">Copy</span>
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
                            className="w-full gap-1 text-sm"
                          >
                            {isExporting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Download className="h-4 w-4" />
                                <span className="text-xs sm:text-sm hidden sm:inline">Export</span>
                                <ChevronDown className="h-3 w-3" />
                              </>
                            )}
                          </Button>

                          {/* Dropdown Menu */}
                          {isExportDropdownOpen && (
                            <div className={`absolute right-0 w-44 sm:w-48 bg-white border-2 border-black shadow-lg rounded overflow-hidden z-10 ${
                              dropdownPosition === 'top' ? 'bottom-full mb-2' : 'mt-2'
                            }`}>
                              <button
                                onClick={() => handleExport('pdf')}
                                className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                Download as PDF
                              </button>
                              <button
                                onClick={() => handleExport('docx')}
                                className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                              >
                                <FileText className="h-4 w-4" />
                                Download as DOCX
                              </button>
                              <button
                                onClick={() => handleExport('txt')}
                                className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 border-t border-gray-200"
                              >
                                <FileText className="h-4 w-4" />
                                Download as TXT
                              </button>
                            </div>
                          )}
                        </div>
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
            <div className="border-2 border-black bg-white shadow-md rounded overflow-hidden">
              <div className="p-3 sm:p-4 border-b-2 border-black bg-background">
                <h3 className="font-bold text-sm sm:text-base">Details</h3>
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
            <div className="border-2 border-black bg-white shadow-md rounded overflow-hidden">
              <div className="p-3 sm:p-4 border-b-2 border-black bg-background">
                <h3 className="font-bold text-sm sm:text-base text-destructive">Danger Zone</h3>
              </div>
              <div className="p-3 sm:p-4">
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full text-destructive hover:bg-destructive hover:text-white border-destructive text-sm"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span className="text-xs sm:text-sm">Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span className="text-xs sm:text-sm">Delete Cover Letter</span>
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        coverLetter={coverLetter}
        isDeleting={isDeleting}
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
      <div className="fixed inset-0 bg-black bg-opacity-75 z-40" onClick={onClose}></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white border-2 border-black shadow-2xl rounded max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 sm:p-6 border-b-2 border-black">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Save as Template</h2>
                <p className="text-xs sm:text-sm text-white/90">Create a reusable template from this cover letter</p>
              </div>
              <button
                onClick={onClose}
                className="ml-3 sm:ml-4 p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Software Engineer - Enthusiastic"
                  className="w-full px-3 sm:px-4 py-2 border-2 border-black rounded font-medium focus:outline-none focus:border-primary transition-colors text-sm"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2">Description (optional)</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe when to use this template..."
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-black rounded font-medium focus:outline-none focus:border-primary transition-colors resize-none text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 border-2 border-black rounded font-medium focus:outline-none focus:border-primary text-sm"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[10px] sm:text-xs text-gray-600">Or enter a new category:</p>
                <input
                  type="text"
                  value={category && !categories.includes(category) ? category : ''}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter custom category"
                  className="w-full mt-2 px-3 sm:px-4 py-2 border-2 border-black rounded font-medium focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              {/* Tone and Length */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Tone */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as 'professional' | 'enthusiastic' | 'balanced')}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-black rounded font-medium focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="professional">Professional</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="balanced">Balanced</option>
                  </select>
                </div>

                {/* Length */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2">Length</label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value as 'short' | 'medium' | 'long')}
                    className="w-full px-3 sm:px-4 py-2 border-2 border-black rounded font-medium focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-xs sm:text-sm font-bold mb-2">Template Preview</label>
                <div className="p-3 sm:p-4 bg-gray-50 border-2 border-black rounded max-h-40 sm:max-h-48 overflow-y-auto">
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">{coverLetter.cover_letter_text}</p>
                </div>
                <p className="mt-2 text-[10px] sm:text-xs text-gray-600">
                  Tip: You can manually edit the template text later by creating the template and then editing it.
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t-2 border-black bg-gray-100">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <Button variant="outline" onClick={onClose} disabled={createTemplateMutation.isPending} className="text-sm">
                <span className="text-xs sm:text-sm">Cancel</span>
              </Button>
              <Button onClick={handleSubmit} disabled={createTemplateMutation.isPending} className="text-sm">
                {createTemplateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Save Template</span>
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

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  coverLetter: CoverLetterResponse;
  isDeleting: boolean;
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, coverLetter, isDeleting }: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-75 z-40" onClick={onClose}></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white border-2 border-black shadow-2xl rounded max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 sm:p-6 border-b-2 border-black">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Delete Cover Letter</h2>
                <p className="text-xs sm:text-sm text-white/90">This action cannot be undone</p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
                disabled={isDeleting}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-700 mb-4">
              Are you sure you want to permanently delete this cover letter? This will remove all associated data.
            </p>

            {/* Cover Letter Details for Context */}
            <div className="p-3 sm:p-4 bg-gray-50 border-2 border-gray-200 rounded">
              {coverLetter.job_title && (
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-4 w-4 text-gray-600" />
                  <p className="font-bold text-sm sm:text-base">{coverLetter.job_title}</p>
                </div>
              )}
              {coverLetter.company_name && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <p className="text-sm sm:text-base text-gray-600">{coverLetter.company_name}</p>
                </div>
              )}
              {!coverLetter.job_title && !coverLetter.company_name && (
                <p className="text-sm text-gray-600">Untitled Cover Letter</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t-2 border-black bg-gray-100">
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isDeleting}
                className="flex-1 text-sm"
              >
                <span className="text-xs sm:text-sm">Cancel</span>
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-700 text-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span className="text-xs sm:text-sm">Delete Permanently</span>
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
