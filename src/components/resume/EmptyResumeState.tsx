import { FileText } from 'lucide-react';
import { Button } from '@/components/retroui/Button';

interface EmptyResumeStateProps {
  onUploadClick: () => void;
}

export const EmptyResumeState = ({ onUploadClick }: EmptyResumeStateProps) => {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-hover mb-6">
        <FileText className="h-12 w-12 text-white" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2">No resumes yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Upload your first resume to start building your library and make analyzing easier
      </p>
      <Button onClick={onUploadClick} size="lg">
        Upload Your First Resume
      </Button>
    </div>
  );
};
