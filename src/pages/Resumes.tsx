import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/retroui/Button';
import { ResumeCard } from '@/components/resume/ResumeCard';
import { EmptyResumeState } from '@/components/resume/EmptyResumeState';
import { ResumeUploadModal } from '@/components/resume/ResumeUploadModal';
import { useResumes, useDeleteResume } from '@/hooks/useResumes';

export const Resumes = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const pageSize = 6;

  const { data: resumeData, isLoading, error } = useResumes(currentPage, pageSize);
  const { mutate: deleteResume, isPending: isDeleting } = useDeleteResume();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Resume Library</h1>
              <p className="mt-2 text-muted-foreground">
                {resumeData?.total
                  ? `${resumeData.total} resume${resumeData.total !== 1 ? 's' : ''} in your library`
                  : 'Manage your resumes'}
              </p>
            </div>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </div>
        </div>

        {/* Resume Library Content */}
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
          {/* Colored Header Section */}
          <div className="bg-gradient-to-br from-primary to-primary-hover p-6">
            <h3 className="text-xl font-bold text-foreground">Your Resumes</h3>
            <p className="text-foreground/80 text-sm mt-1">
              Upload, manage, and reuse your resumes
            </p>
          </div>

          {/* White Content Section */}
          <div className="p-6 bg-white">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading resumes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">Failed to load resumes</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : resumeData && resumeData.resumes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {Math.ceil(resumeData.total / pageSize)}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage >= Math.ceil(resumeData.total / pageSize)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
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
