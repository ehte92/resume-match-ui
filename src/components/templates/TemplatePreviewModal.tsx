import { X, Sparkles, User, FileText } from 'lucide-react';
import type { CoverLetterTemplateResponse } from '@/types/api';

interface TemplatePreviewModalProps {
  template: CoverLetterTemplateResponse;
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate?: () => void;
}

export default function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  if (!isOpen) return null;

  const getToneBadgeColor = (tone: string) => {
    switch (tone) {
      case 'professional':
        return 'bg-blue-200';
      case 'enthusiastic':
        return 'bg-pink-200';
      case 'balanced':
        return 'bg-green-200';
      default:
        return 'bg-gray-200';
    }
  };

  const getLengthBadgeColor = (length: string) => {
    switch (length) {
      case 'short':
        return 'bg-yellow-200';
      case 'medium':
        return 'bg-orange-200';
      case 'long':
        return 'bg-red-200';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b-4 border-black bg-yellow-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-black">{template.name}</h2>
                  {template.is_system ? (
                    <Sparkles className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <User className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <p className="text-sm font-bold text-gray-600">{template.category}</p>
                {template.description && (
                  <p className="mt-2 text-sm text-gray-700">{template.description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-2 bg-white border-4 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span
                className={`px-3 py-1 text-xs font-black border-2 border-black ${getToneBadgeColor(
                  template.tone
                )}`}
              >
                Tone: {template.tone}
              </span>
              <span
                className={`px-3 py-1 text-xs font-black border-2 border-black ${getLengthBadgeColor(
                  template.length
                )}`}
              >
                Length: {template.length}
              </span>
              <span className="px-3 py-1 text-xs font-black border-2 border-black bg-gray-200">
                {template.is_system ? 'System Template' : 'User Template'}
              </span>
              <span className="px-3 py-1 text-xs font-black border-2 border-black bg-purple-200">
                Used {template.usage_count} times
              </span>
            </div>
          </div>

          {/* Template Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5" />
                <h3 className="text-lg font-black">Template Preview</h3>
              </div>
              <p className="text-sm text-gray-600 font-bold mb-4">
                Placeholders like {'{{company_name}}'} will be replaced with actual values
              </p>
            </div>

            <div className="p-6 bg-gray-50 border-4 border-black font-mono text-sm whitespace-pre-wrap">
              {template.template_text}
            </div>

            {/* Placeholder Legend */}
            <div className="mt-6 p-4 bg-blue-50 border-4 border-black">
              <h4 className="font-black mb-2">Available Placeholders:</h4>
              <ul className="space-y-1 text-sm font-bold text-gray-700">
                <li>• {'{{company_name}}'} - Company name from job posting</li>
                <li>• {'{{job_title}}'} - Position title</li>
                <li>• {'{{candidate_name}}'} - Your name from resume</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t-4 border-black bg-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 font-bold">
                Created: {new Date(template.created_at).toLocaleDateString()}
                {template.updated_at && (
                  <> • Updated: {new Date(template.updated_at).toLocaleDateString()}</>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-white border-4 border-black font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Close
                </button>
                {onUseTemplate && (
                  <button
                    onClick={() => {
                      onUseTemplate();
                      onClose();
                    }}
                    className="px-6 py-2 bg-green-400 border-4 border-black font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Use This Template
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
