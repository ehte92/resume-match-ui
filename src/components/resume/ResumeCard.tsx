import { useState } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Trash2, FileText, Download, Play } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { Badge } from '@/components/retroui/Badge';
import type { ResumeResponse } from '@/types/api';
import { toast } from 'sonner';
import { getResumeDownloadUrl } from '@/lib/api';

interface ResumeCardProps {
  resume: ResumeResponse;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const ResumeCard = ({ resume, onDelete, isDeleting = false }: ResumeCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete(resume.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);

    try {
      // Fetch signed download URL from API
      const { download_url } = await getResumeDownloadUrl(resume.id);

      // Open download URL in new tab
      window.open(download_url, '_blank');
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download resume. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUseForAnalysis = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to home page with resume ID in state
    navigate('/', { state: { resumeId: resume.id } });
    toast.info(`Selected ${resume.file_name} for analysis`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileTypeBadgeColor = (fileType: string) => {
    if (fileType.toLowerCase() === 'pdf') {
      return 'bg-red-600 text-white border-2 border-black';
    }
    return 'bg-blue-600 text-white border-2 border-black';
  };

  return (
    <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden hover:shadow-2xl transition-shadow">
      {/* Colored Header */}
      <div className={`${
        resume.file_type.toLowerCase() === 'pdf'
          ? 'bg-gradient-to-br from-red-500 to-red-600'
          : 'bg-gradient-to-br from-blue-500 to-blue-600'
      } p-4`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-white flex-shrink-0" />
              <h3 className="text-lg font-bold text-white truncate">{resume.file_name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="solid" className={getFileTypeBadgeColor(resume.file_type)}>
                {resume.file_type.toUpperCase()}
              </Badge>
              <span className="text-sm text-white/80">{formatFileSize(resume.file_size)}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="!bg-white hover:!bg-red-50 !border-red-500 !text-red-600 hover:!text-red-700 flex-shrink-0 ml-2"
          >
            {showDeleteConfirm ? (
              'Confirm?'
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* White Content Section */}
      <div className="p-4 bg-white space-y-4">
        {/* Parsed Text Preview */}
        {resume.parsed_text && (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {resume.parsed_text.substring(0, 100)}...
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-3">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(resume.created_at)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {resume.storage_backend === 'r2' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleUseForAnalysis}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            Use for Analysis
          </Button>
        </div>
      </div>
    </div>
  );
};
