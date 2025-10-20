import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { CoverLetterCard } from '@/components/cover-letter/CoverLetterCard';
import { EmptyCoverLetterState } from '@/components/cover-letter/EmptyCoverLetterState';
import { GenerateCoverLetterModal } from '@/components/cover-letter/GenerateCoverLetterModal';
import { SkeletonList } from '@/components/retroui/Skeleton';
import { useCoverLetters } from '@/hooks/useCoverLetters';
import { useDeleteCoverLetter } from '@/hooks/useDeleteCoverLetter';
import { usePageTitle } from '@/hooks/usePageTitle';

export const CoverLetters = () => {
  usePageTitle('Cover Letters');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 9;

  const { data: coverLetterData, isLoading, error } = useCoverLetters(currentPage, pageSize);
  const { mutate: deleteCoverLetter, isPending: isDeleting } = useDeleteCoverLetter();

  // Filter cover letters by search query
  const filteredCoverLetters = coverLetterData?.cover_letters.filter((cl) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      cl.job_title?.toLowerCase().includes(query) ||
      cl.company_name?.toLowerCase().includes(query) ||
      cl.job_description?.toLowerCase().includes(query)
    );
  });

  const handleDelete = (id: string) => {
    deleteCoverLetter(id, {
      onSuccess: () => toast.success('Cover letter deleted'),
      onError: () => toast.error('Failed to delete cover letter'),
    });
  };

  const handleGenerateSuccess = (id: string) => {
    navigate(`/cover-letters/${id}`);
  };

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

          {/* Search Bar */}
          {coverLetterData && coverLetterData.total > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by job title, company, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary-hover p-6 border-b-2 border-black">
            <h3 className="text-xl font-bold text-foreground">
              {filteredCoverLetters && filteredCoverLetters.length > 0
                ? `${filteredCoverLetters.length} Cover Letter${
                    filteredCoverLetters.length !== 1 ? 's' : ''
                  }`
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
            ) : filteredCoverLetters && filteredCoverLetters.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {filteredCoverLetters.map((coverLetter) => (
                    <CoverLetterCard
                      key={coverLetter.id}
                      coverLetter={coverLetter}
                      onDelete={handleDelete}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {coverLetterData.total > pageSize && !searchQuery && (
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
            ) : searchQuery ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4 text-lg">No cover letters match your search</p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
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
