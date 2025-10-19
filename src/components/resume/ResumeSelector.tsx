import { FileText, Check, AlertCircle, Calendar } from 'lucide-react';
import { Badge } from '@/components/retroui/Badge';
import type { ResumeResponse } from '@/types/api';
import { useResumes } from '@/hooks/useResumes';

interface ResumeSelectorProps {
  selectedResumeId: string | null;
  onSelectResume: (resumeId: string) => void;
}

export const ResumeSelector = ({ selectedResumeId, onSelectResume }: ResumeSelectorProps) => {
  const { data: resumeData, isLoading, error } = useResumes(1, 20); // Get first 20 resumes

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading resumes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-red-500 rounded p-4 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 font-medium">Failed to load resumes</p>
            <p className="text-xs text-red-600 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resumeData || resumeData.resumes.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-foreground font-medium mb-2">No resumes in your library</p>
        <p className="text-sm text-muted-foreground">Upload a resume to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Select a resume from your library ({resumeData.total} total)
      </p>
      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
        {resumeData.resumes.map((resume: ResumeResponse) => {
          const isSelected = selectedResumeId === resume.id;
          return (
            <button
              key={resume.id}
              type="button"
              onClick={() => onSelectResume(resume.id)}
              className={`
                w-full text-left border-2 border-black rounded p-4 transition-all hover:shadow-lg
                ${isSelected ? 'bg-gradient-to-br from-primary/20 to-primary-hover/20 shadow-md' : 'bg-white hover:bg-gray-50'}
              `}
            >
              <div className="flex items-start gap-3">
                {/* Selection Indicator */}
                <div
                  className={`
                    flex-shrink-0 w-6 h-6 rounded-full border-2 border-black flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-primary' : 'bg-white'}
                  `}
                >
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </div>

                {/* Resume Icon */}
                <FileText
                  className={`h-6 w-6 flex-shrink-0 ${
                    resume.file_type.toLowerCase() === 'pdf' ? 'text-red-600' : 'text-blue-600'
                  }`}
                />

                {/* Resume Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{resume.file_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="solid" className={getFileTypeBadgeColor(resume.file_type)} size="sm">
                      {resume.file_type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatFileSize(resume.file_size)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{formatDate(resume.created_at)}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
