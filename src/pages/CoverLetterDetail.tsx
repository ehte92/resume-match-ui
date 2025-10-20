import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
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
} from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { Textarea } from '@/components/retroui/Textarea';
import { Badge } from '@/components/retroui/Badge';
import { RefineModal } from '@/components/cover-letter/RefineModal';
import { getCoverLetterById, exportCoverLetter } from '@/lib/api';
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/cover-letters')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cover Letters
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 border-2 border-black bg-white shadow-xl rounded overflow-hidden">
            <div className="bg-gradient-to-br from-primary to-primary-hover p-6 border-b-2 border-black">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {coverLetter.job_title && (
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-5 w-5" />
                      <h1 className="text-2xl font-bold">{coverLetter.job_title}</h1>
                    </div>
                  )}
                  {coverLetter.company_name && (
                    <div className="flex items-center gap-2 text-foreground/80">
                      <Building2 className="h-4 w-4" />
                      <span>{coverLetter.company_name}</span>
                    </div>
                  )}
                </div>
                <FileText className="h-6 w-6" />
              </div>
            </div>

            <div className="p-6 bg-white">
              {isEditing ? (
                <>
                  <Textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows={20}
                    className="w-full resize-none font-mono text-sm"
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
                  <div className="prose max-w-none whitespace-pre-wrap text-foreground">
                    {coverLetter.cover_letter_text}
                  </div>
                  <div className="flex gap-3 mt-6 pt-6 border-t-2 border-black">
                    <Button variant="outline" onClick={handleEdit} className="flex-1">
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsRefineModalOpen(true)}
                      className="flex-1 border-purple-500 text-purple-700 hover:bg-purple-50"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Refine with AI
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
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 border-b-2 border-black">
                <h3 className="font-bold text-white">Details</h3>
              </div>
              <div className="p-4 space-y-4">
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
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 border-b-2 border-black">
                <h3 className="font-bold text-white">Danger Zone</h3>
              </div>
              <div className="p-4">
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
    </div>
  );
};
