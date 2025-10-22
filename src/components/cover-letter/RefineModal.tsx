import { useState } from 'react';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import { X, Loader2, Sparkles, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { Label } from '@/components/retroui/Label';
import { Textarea } from '@/components/retroui/Textarea';
import { refineCoverLetter } from '@/lib/api';
import type { CoverLetterResponse, CoverLetterRefineResponse } from '@/types/api';

interface RefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  coverLetter: CoverLetterResponse;
  onAcceptRefinement: (refinedText: string) => void;
}

export const RefineModal = ({ isOpen, onClose, coverLetter, onAcceptRefinement }: RefineModalProps) => {
  const [refinementInstruction, setRefinementInstruction] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinementResult, setRefinementResult] = useState<CoverLetterRefineResponse | null>(null);

  const instructionLength = refinementInstruction.length;

  const handleRefine = async () => {
    if (instructionLength < 10) {
      toast.error('Please provide more detailed instructions (at least 10 characters)');
      return;
    }

    if (instructionLength > 500) {
      toast.error('Instructions are too long (maximum 500 characters)');
      return;
    }

    setIsRefining(true);

    try {
      const result = await refineCoverLetter(coverLetter.id, {
        refinement_instruction: refinementInstruction,
      });

      setRefinementResult(result);
      toast.success('Cover letter refined successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refine cover letter';
      toast.error(errorMessage);
    } finally {
      setIsRefining(false);
    }
  };

  const handleAccept = () => {
    if (!refinementResult) return;
    onAcceptRefinement(refinementResult.refined_cover_letter_text);
    handleClose();
  };

  const handleClose = () => {
    setRefinementInstruction('');
    setRefinementResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border-2 border-black shadow-2xl rounded max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 sm:p-6 border-b-2 border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Refine with AI</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-black/10 rounded transition-colors"
              disabled={isRefining}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Instruction Input Section */}
          {!refinementResult && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="refinement_instruction">Refinement Instructions</Label>
                  <span
                    className={`text-[10px] sm:text-xs ${
                      instructionLength < 10
                        ? 'text-red-600 font-medium'
                        : instructionLength > 500
                        ? 'text-red-600 font-medium'
                        : instructionLength > 450
                        ? 'text-yellow-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {instructionLength} / 500
                  </span>
                </div>
                <Textarea
                  id="refinement_instruction"
                  rows={4}
                  placeholder="e.g., Make it more concise and emphasize leadership skills..."
                  value={refinementInstruction}
                  onChange={(e) => setRefinementInstruction(e.target.value)}
                  className={instructionLength < 10 || instructionLength > 500 ? 'border-red-500' : ''}
                />
                {instructionLength > 0 && instructionLength < 10 && (
                  <p className="text-xs sm:text-sm text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Instructions must be at least 10 characters
                  </p>
                )}
              </div>

              {/* Info Note */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-purple-900">
                  <Sparkles className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  Describe how you'd like to improve your cover letter. For example: "make it more concise", "emphasize
                  technical skills", or "add more enthusiasm".
                </p>
              </div>

              {/* Original Cover Letter Preview */}
              <div>
                <Label className="mb-2">Original Cover Letter</Label>
                <div className="border-2 border-black rounded p-3 sm:p-4 max-h-48 sm:max-h-64 overflow-y-auto bg-gray-50">
                  <div
                    className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(coverLetter.cover_letter_text),
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t-2 border-black">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isRefining} className="sm:flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
                <Button onClick={handleRefine} disabled={isRefining || instructionLength < 10} className="sm:flex-1 text-xs sm:text-sm">
                  {isRefining ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      Refining...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Refine Cover Letter
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Comparison View Section */}
          {refinementResult && (
            <div className="space-y-4">
              {/* Refinement Instruction Display */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded p-3 sm:p-4">
                <p className="text-[10px] sm:text-xs font-medium text-purple-900 mb-1">REFINEMENT INSTRUCTION:</p>
                <p className="text-xs sm:text-sm text-purple-900">{refinementResult.refinement_instruction}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                <div className="border-2 border-black rounded p-2.5 sm:p-3 bg-gray-50">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Original</p>
                  <p className="text-base sm:text-lg font-bold">{coverLetter.word_count} words</p>
                </div>
                <div className="border-2 border-black rounded p-2.5 sm:p-3 bg-purple-50">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Refined</p>
                  <p className="text-base sm:text-lg font-bold">{refinementResult.word_count} words</p>
                </div>
                <div className="border-2 border-black rounded p-2.5 sm:p-3 bg-gray-50 col-span-2 sm:col-span-1">
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Processing Time</p>
                  <p className="text-base sm:text-lg font-bold">{(refinementResult.processing_time_ms / 1000).toFixed(1)}s</p>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {/* Original */}
                <div>
                  <Label className="mb-2 flex items-center gap-2 text-sm sm:text-base">
                    Original Cover Letter
                    <span className="text-[10px] sm:text-xs text-muted-foreground">({coverLetter.word_count} words)</span>
                  </Label>
                  <div className="border-2 border-black rounded p-3 sm:p-4 h-64 sm:h-80 lg:h-96 overflow-y-auto bg-gray-50">
                    <div
                      className="prose prose-sm max-w-none text-foreground"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(coverLetter.cover_letter_text),
                      }}
                    />
                  </div>
                </div>

                {/* Refined */}
                <div>
                  <Label className="mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                    Refined Cover Letter
                    <span className="text-[10px] sm:text-xs text-muted-foreground">({refinementResult.word_count} words)</span>
                  </Label>
                  <div className="border-2 border-purple-500 rounded p-3 sm:p-4 h-64 sm:h-80 lg:h-96 overflow-y-auto bg-purple-50">
                    <div
                      className="prose prose-sm max-w-none text-foreground"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(refinementResult.refined_cover_letter_text),
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-900">
                  <AlertCircle className="inline h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  Review the refined version carefully. Accepting will update your cover letter with the refined text.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t-2 border-black">
                <Button type="button" variant="outline" onClick={handleClose} className="sm:flex-1 text-xs sm:text-sm">
                  Discard
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRefinementResult(null)}
                  className="sm:flex-1 text-xs sm:text-sm"
                >
                  <Sparkles className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Try Again
                </Button>
                <Button onClick={handleAccept} className="sm:flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm">
                  <Check className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Accept Refined Version
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
