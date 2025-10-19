import { useNavigate } from 'react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/retroui/Button';
import { AnalysisCard } from '@/components/analysis/AnalysisCard';
import { useAnalysisHistory, useDeleteAnalysis } from '@/hooks/useAnalysisHistory';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const { data: analysisData, isLoading, error } = useAnalysisHistory(currentPage, pageSize);
  const { mutate: deleteAnalysis, isPending: isDeleting } = useDeleteAnalysis();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.full_name || user?.email}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ready to optimize your resume for your next opportunity?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
            {/* Colored Header Section */}
            <div className="bg-gradient-to-br from-primary to-primary-hover p-6">
              <h3 className="text-xl font-bold text-foreground">New Analysis</h3>
              <p className="text-foreground/80 text-sm mt-1">
                Upload your resume and compare it with a job description
              </p>
            </div>

            {/* White Content Section */}
            <div className="p-6 bg-white">
              <Button onClick={() => navigate('/')} className="w-full">
                Start New Analysis
              </Button>
            </div>
          </div>

          <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
            {/* Colored Header Section */}
            <div className="bg-gradient-to-br from-primary to-primary-hover p-6">
              <h3 className="text-xl font-bold text-foreground">Account Info</h3>
              <p className="text-foreground/80 text-sm mt-1">Your account details</p>
            </div>

            {/* White Content Section */}
            <div className="p-6 bg-white space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-foreground">{user?.email}</p>
              </div>
              {user?.full_name && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-foreground">{user.full_name}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member since</p>
                <p className="text-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Past Analyses Section */}
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
          {/* Colored Header Section */}
          <div className="bg-gradient-to-br from-primary to-primary-hover p-6">
            <h3 className="text-xl font-bold text-foreground">Recent Analyses</h3>
            <p className="text-foreground/80 text-sm mt-1">
              {analysisData?.total
                ? `${analysisData.total} total analysis${analysisData.total !== 1 ? 'es' : ''}`
                : 'Your previous resume analyses'}
            </p>
          </div>

          {/* White Content Section */}
          <div className="p-6 bg-white">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading analyses...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">Failed to load analyses</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : analysisData && analysisData.analyses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {analysisData.analyses.map((analysis) => (
                    <AnalysisCard
                      key={analysis.id}
                      analysis={analysis}
                      onDelete={(id) => {
                        deleteAnalysis(id, {
                          onSuccess: () => toast.success('Analysis deleted successfully'),
                          onError: () => toast.error('Failed to delete analysis'),
                        });
                      }}
                      isDeleting={isDeleting}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {analysisData.total > pageSize && (
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
                      Page {currentPage} of {Math.ceil(analysisData.total / pageSize)}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage >= Math.ceil(analysisData.total / pageSize)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4 text-lg">No analyses yet</p>
                <p className="mb-6 text-sm">Start analyzing your resume to see results here</p>
                <Button onClick={() => navigate('/')}>
                  Create your first analysis
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
