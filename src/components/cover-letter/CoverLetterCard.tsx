import React from 'react';
import { useNavigate } from 'react-router';
import { FileText, Briefcase, Building2, Eye, Trash2, Copy, Calendar, Tag } from 'lucide-react';
import { Badge } from '@/components/retroui/Badge';
import { Button } from '@/components/retroui/Button';
import type { CoverLetterResponse } from '@/types/api';
import { toast } from 'sonner';

interface CoverLetterCardProps {
  coverLetter: CoverLetterResponse;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const CoverLetterCard = ({ coverLetter, onDelete, isDeleting }: CoverLetterCardProps) => {
  const navigate = useNavigate();

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

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(coverLetter.cover_letter_text);
    toast.success('Cover letter copied to clipboard');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this cover letter?')) {
      onDelete(coverLetter.id);
    }
  };

  return (
    <div className="border-2 border-black bg-white shadow-md rounded overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
      <div onClick={() => navigate(`/cover-letters/${coverLetter.id}`)} className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {coverLetter.job_title && (
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-foreground">{coverLetter.job_title}</h3>
              </div>
            )}
            {coverLetter.company_name && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>{coverLetter.company_name}</span>
              </div>
            )}
          </div>
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {coverLetter.cover_letter_text.substring(0, 150)}...
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="solid" className={getToneBadgeColor(coverLetter.tone)}>
            {coverLetter.tone}
          </Badge>
          <Badge variant="outline" className="border-black">
            {coverLetter.length}
          </Badge>
          <Badge variant="outline" className="border-black">
            {coverLetter.word_count} words
          </Badge>
        </div>

        {/* Tags Section */}
        {coverLetter.tags && coverLetter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="h-3 w-3" />
            </div>
            {coverLetter.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="border-black text-xs">
                {tag}
              </Badge>
            ))}
            {coverLetter.tags.length > 3 && (
              <Badge variant="outline" className="border-black text-xs text-muted-foreground">
                +{coverLetter.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(coverLetter.created_at).toLocaleDateString()}
        </div>
      </div>

      <div className="border-t-2 border-black bg-background px-5 py-3 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/cover-letters/${coverLetter.id}`)}
          className="flex-1"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          View
        </Button>
        <Button size="sm" variant="outline" onClick={handleCopy}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-destructive hover:bg-destructive hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
