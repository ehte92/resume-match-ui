import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/retroui/Button';
import { ResumeCard } from '@/components/resume/ResumeCard';
import { EmptyResumeState } from '@/components/resume/EmptyResumeState';
import { ResumeUploadModal } from '@/components/resume/ResumeUploadModal';
import { SkeletonList } from '@/components/retroui/Skeleton';
import { useResumes, useDeleteResume } from '@/hooks/useResumes';
import { usePageTitle } from '@/hooks/usePageTitle';

export const Resumes = () => {
  usePageTitle('My Resumes');
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const pageSize = 6;

  const { data: resumeData, isLoading, error } = useResumes(currentPage, pageSize);
  const { mutate: deleteResume, isPending: isDeleting } = useDeleteResume();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Resume Library</h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                {resumeData?.total
                  ? `${resumeData.total} resume${resumeData.total !== 1 ? 's' : ''} stored`
                  : 'Upload and manage resumes'}
              </p>
            </div>
            <Button onClick={() => setIsUploadModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </div>
        </div>

        {/* Resume Library Content */}
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
          {/* White Content Section */}
          <div className="p-4 sm:p-6 bg-white">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <SkeletonList count={pageSize} variant="resume" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4 text-sm sm:text-base">Failed to load resumes</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : resumeData && resumeData.resumes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  {resumeData.resumes.map((resume) => (
                    <ResumeCard
                      key={resume.id}
                      resume={resume}
                      onDelete={(id) => {
                        deleteResume(id, {
                          onSuccess: () => toast.success('Resume deleted successfully'),
                          onError: () => toast.error('Failed to delete resume'),
                        });
                      }}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {resumeData.total > pageSize && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>

                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Page {currentPage} of {Math.ceil(resumeData.total / pageSize)}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage >= Math.ceil(resumeData.total / pageSize)}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-2" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <EmptyResumeState onUploadClick={() => setIsUploadModalOpen(true)} />
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={(resume) => {
          toast.success(`${resume.file_name} uploaded successfully`);
        }}
      />
    </div>
  );
};
