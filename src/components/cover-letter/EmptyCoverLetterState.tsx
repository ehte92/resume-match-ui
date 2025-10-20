import { FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/retroui/Button';

interface EmptyCoverLetterStateProps {
  onCreateClick: () => void;
}

export const EmptyCoverLetterState = ({ onCreateClick }: EmptyCoverLetterStateProps) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-block p-6 bg-primary/10 border-2 border-black rounded-full mb-6">
        <FileText className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3">No Cover Letters Yet</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Start creating AI-powered cover letters tailored to your job applications. Generate
        professional, enthusiastic, or balanced cover letters in seconds.
      </p>
      <div className="space-y-4">
        <Button onClick={onCreateClick} className="inline-flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Your First Cover Letter
        </Button>
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span>AI-Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            <span>Multiple Tones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
            <span>Instant Results</span>
          </div>
        </div>
      </div>
    </div>
  );
};
