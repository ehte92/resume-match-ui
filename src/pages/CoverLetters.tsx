import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { CoverLetterCard } from '@/components/cover-letter/CoverLetterCard';
import { EmptyCoverLetterState } from '@/components/cover-letter/EmptyCoverLetterState';
import { GenerateCoverLetterModal } from '@/components/cover-letter/GenerateCoverLetterModal';
import { FilterBar, type FilterState } from '@/components/cover-letter/FilterBar';
import { SkeletonList } from '@/components/retroui/Skeleton';
import { useCoverLetters } from '@/hooks/useCoverLetters';
import { useDeleteCoverLetter } from '@/hooks/useDeleteCoverLetter';
import { usePageTitle } from '@/hooks/usePageTitle';

export const CoverLetters = () => {
  usePageTitle('Cover Letters');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 9;

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tags: [],
    tone: null,
    length: null,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Convert FilterState to API filters format
  const apiFilters = {
    search: filters.search || undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    tone: filters.tone || undefined,
    length: filters.length || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };

  const { data: coverLetterData, isLoading, error } = useCoverLetters(currentPage, pageSize, apiFilters);
  const { mutate: deleteCoverLetter, isPending: isDeleting } = useDeleteCoverLetter();

  const handleDelete = (id: string) => {
    deleteCoverLetter(id, {
      onSuccess: () => toast.success('Cover letter deleted'),
      onError: () => toast.error('Failed to delete cover letter'),
    });
  };

  const handleGenerateSuccess = (id: string) => {
    navigate(`/cover-letters/${id}`);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const hasActiveFilters = filters.search || filters.tags.length > 0 || filters.tone || filters.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cover Letters</h1>
              <p className="mt-2 text-muted-foreground">
                Manage your AI-generated cover letters
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Generate New
            </Button>
          </div>

          {/* Filter Bar */}
          {coverLetterData && coverLetterData.total > 0 && (
            <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />
          )}
        </div>

        {/* Content */}
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary-hover p-6 border-b-2 border-black">
            <h3 className="text-xl font-bold text-foreground">
              {coverLetterData?.cover_letters && coverLetterData.cover_letters.length > 0
                ? `${coverLetterData.total} Cover Letter${
                    coverLetterData.total !== 1 ? 's' : ''
                  } ${hasActiveFilters ? '(Filtered)' : ''}`
                : 'Your Cover Letters'}
            </h3>
          </div>

          <div className="p-6 bg-white">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonList count={pageSize} variant="analysis" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">Failed to load cover letters</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : coverLetterData?.cover_letters && coverLetterData.cover_letters.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {coverLetterData.cover_letters.map((coverLetter) => (
                    <CoverLetterCard
                      key={coverLetter.id}
                      coverLetter={coverLetter}
                      onDelete={handleDelete}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {coverLetterData.total > pageSize && (
                  <div className="flex items-center justify-between border-t-2 border-black pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {Math.ceil(coverLetterData.total / pageSize)}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage >= Math.ceil(coverLetterData.total / pageSize)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            ) : hasActiveFilters ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4 text-lg">No cover letters match your filters</p>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      search: '',
                      tags: [],
                      tone: null,
                      length: null,
                      sortBy: 'created_at',
                      sortOrder: 'desc',
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <EmptyCoverLetterState onCreateClick={() => setIsModalOpen(true)} />
            )}
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      <GenerateCoverLetterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleGenerateSuccess}
      />
    </div>
  );
};
