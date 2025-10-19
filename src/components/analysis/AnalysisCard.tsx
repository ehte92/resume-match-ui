import { useNavigate } from 'react-router';
import { Calendar, Trash2, Briefcase, Building2 } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import type { AnalysisResponse } from '@/types/api';
import { useState } from 'react';
import type React from 'react';

interface AnalysisCardProps {
  analysis: AnalysisResponse;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const AnalysisCard = ({ analysis, onDelete, isDeleting = false }: AnalysisCardProps) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleCardClick = () => {
    navigate(`/analysis/${analysis.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete(analysis.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      onClick={handleCardClick}
      className="border-2 border-black bg-white shadow-xl rounded overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
    >
      {/* Colored Header */}
      <div className="bg-gradient-to-br from-primary to-primary-hover p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {analysis.job_title && (
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-4 w-4 text-foreground" />
                <h3 className="text-lg font-bold text-foreground">{analysis.job_title}</h3>
              </div>
            )}
            {analysis.company_name && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-foreground/80" />
                <p className="text-sm text-foreground/80">{analysis.company_name}</p>
              </div>
            )}
            {!analysis.job_title && !analysis.company_name && (
              <h3 className="text-lg font-bold text-foreground">Resume Analysis</h3>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="!bg-white hover:!bg-red-50 !border-red-500 !text-red-600 hover:!text-red-700"
          >
            {showDeleteConfirm ? (
              'Confirm?'
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* White Content Section */}
      <div className="p-4 bg-white">
        {/* Scores */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">Match Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(Number(analysis.match_score) || 0)}`}>
              {Number(analysis.match_score)?.toFixed(0) || 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">ATS Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(Number(analysis.ats_score) || 0)}`}>
              {Number(analysis.ats_score)?.toFixed(0) || 0}%
            </p>
          </div>
        </div>

        {/* Keywords Summary */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {analysis.matching_keywords?.length || 0} keywords matched
            </span>
            <span className="text-muted-foreground">
              {analysis.missing_keywords?.length || 0} missing
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-3">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(analysis.created_at)}</span>
        </div>
      </div>
    </div>
  );
};
