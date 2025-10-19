import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileCode, FileDown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { toast } from 'sonner';
import type { AnalysisResponse } from '@/types/api';
import {
  formatAsMarkdown,
  formatAsText,
  formatImprovedBulletsAsText,
  downloadTextFile,
  generateExportFilename,
} from '@/lib/exportUtils';
import { exportAnalysisToPDF } from '@/lib/pdfExport';

interface ExportButtonProps {
  analysis: AnalysisResponse;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ExportButton = ({
  analysis,
  variant = 'default',
  size = 'md',
  className,
}: ExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExportPDF = () => {
    try {
      const filename = generateExportFilename(analysis, 'pdf');
      exportAnalysisToPDF(analysis, filename);
      toast.success('PDF exported successfully');
      setIsOpen(false);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleExportMarkdown = () => {
    try {
      const content = formatAsMarkdown(analysis);
      const filename = generateExportFilename(analysis, 'md');
      downloadTextFile(content, filename, 'text/markdown');
      toast.success('Markdown file downloaded');
      setIsOpen(false);
    } catch (error) {
      console.error('Error exporting markdown:', error);
      toast.error('Failed to export markdown');
    }
  };

  const handleExportText = () => {
    try {
      const content = formatAsText(analysis);
      const filename = generateExportFilename(analysis, 'txt');
      downloadTextFile(content, filename, 'text/plain');
      toast.success('Text file downloaded');
      setIsOpen(false);
    } catch (error) {
      console.error('Error exporting text:', error);
      toast.error('Failed to export text file');
    }
  };

  const handleExportBullets = () => {
    if (!analysis.rewritten_bullets || analysis.rewritten_bullets.length === 0) {
      toast.error('No improved bullet points available');
      return;
    }

    try {
      const content = formatImprovedBulletsAsText(analysis);
      const date = new Date(analysis.created_at).toISOString().split('T')[0];
      const jobTitle = analysis.job_title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'bullets';
      const filename = `improved_bullets_${jobTitle}_${date}.txt`;
      downloadTextFile(content, filename, 'text/plain');
      toast.success('Improved bullets downloaded');
      setIsOpen(false);
    } catch (error) {
      console.error('Error exporting bullets:', error);
      toast.error('Failed to export bullets');
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        className={className}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
        <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-black rounded shadow-xl z-50">
          <div className="py-1">
            <button
              onClick={handleExportPDF}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-3"
            >
              <FileDown className="h-4 w-4 text-red-600" />
              <div>
                <div className="font-medium">Export as PDF</div>
                <div className="text-xs text-muted-foreground">Full report with formatting</div>
              </div>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-3"
            >
              <FileCode className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium">Export as Markdown</div>
                <div className="text-xs text-muted-foreground">Formatted text for GitHub, etc.</div>
              </div>
            </button>

            <button
              onClick={handleExportText}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-3"
            >
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium">Export as Text</div>
                <div className="text-xs text-muted-foreground">Plain text format</div>
              </div>
            </button>

            <div className="border-t border-gray-200 my-1" />

            <button
              onClick={handleExportBullets}
              disabled={!analysis.rewritten_bullets || analysis.rewritten_bullets.length === 0}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4 text-purple-600" />
              <div>
                <div className="font-medium">Export Improved Bullets</div>
                <div className="text-xs text-muted-foreground">Bullet points only</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
