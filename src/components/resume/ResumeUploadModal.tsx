import { useState, useRef } from 'react';
import type React from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { useUploadResume } from '@/hooks/useResumes';
import type { ResumeResponse } from '@/types/api';
import { toast } from 'sonner';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (resume: ResumeResponse) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const ResumeUploadModal = ({ isOpen, onClose, onSuccess }: ResumeUploadModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadResume, isPending, isError } = useUploadResume();

  if (!isOpen) return null;

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return 'Only PDF and DOCX files are accepted';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      setSelectedFile(null);
      return;
    }
    setValidationError(null);
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadResume(selectedFile, {
      onSuccess: (data) => {
        toast.success('Resume uploaded successfully');
        onSuccess?.(data);
        handleClose();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to upload resume');
      },
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setValidationError(null);
    setIsDragOver(false);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="border-2 border-black bg-white shadow-2xl rounded max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary-hover p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Upload Resume</h2>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="text-foreground hover:text-foreground/80 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded p-8 text-center cursor-pointer transition-all
              ${isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
              ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileInputChange}
              disabled={isPending}
              className="hidden"
            />

            <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-foreground font-medium mb-2">
              {isDragOver ? 'Drop file here' : 'Drag & drop your resume'}
            </p>
            <p className="text-sm text-muted-foreground mb-2">or click to browse</p>
            <p className="text-xs text-muted-foreground">
              PDF or DOCX • Max 5MB
            </p>
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <div className="border-2 border-black rounded p-4 bg-green-50">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <div className="border-2 border-red-500 rounded p-4 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{validationError}</p>
              </div>
            </div>
          )}

          {/* Upload Error */}
          {isError && (
            <div className="border-2 border-red-500 rounded p-4 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">Failed to upload resume. Please try again.</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isPending}
              className="flex-1"
            >
              {isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
