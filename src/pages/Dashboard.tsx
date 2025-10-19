import { useNavigate } from 'react-router';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { Label } from '@/components/retroui/Label';
import { AnalysisCard } from '@/components/analysis/AnalysisCard';
import { useAnalysisHistory, useDeleteAnalysis } from '@/hooks/useAnalysisHistory';
import { useResumes } from '@/hooks/useResumes';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import type { AnalysisResponse } from '@/types/api';

type SortOption = 'date-desc' | 'date-asc' | 'score-desc' | 'score-asc';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [minScore, setMinScore] = useState<number>(0);

  const { data: analysisData, isLoading, error } = useAnalysisHistory(currentPage, pageSize);
  const { mutate: deleteAnalysis, isPending: isDeleting } = useDeleteAnalysis();
  const { data: resumeData } = useResumes(1, 1); // Fetch first page to get total count

  // Filter and sort analyses client-side
  const filteredAndSortedAnalyses = useMemo(() => {
    if (!analysisData?.analyses) return [];

    let filtered = [...analysisData.analyses];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((analysis) =>
        analysis.job_title?.toLowerCase().includes(query) ||
        analysis.company_name?.toLowerCase().includes(query) ||
        analysis.job_description?.toLowerCase().includes(query)
      );
    }

    // Apply minimum score filter
    if (minScore > 0) {
      filtered = filtered.filter((analysis) =>
        analysis.match_score >= minScore
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date-asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'score-desc':
          return b.match_score - a.match_score;
        case 'score-asc':
          return a.match_score - b.match_score;
        default:
          return 0;
      }
    });

    return filtered;
  }, [analysisData?.analyses, searchQuery, minScore, sortBy]);

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleMinScoreChange = (value: string) => {
    const score = parseInt(value) || 0;
    setMinScore(Math.min(Math.max(score, 0), 100));
    setCurrentPage(1);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setMinScore(0);
    setSortBy('date-desc');
    setCurrentPage(1);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6">
              <h3 className="text-xl font-bold text-foreground">Resume Library</h3>
              <p className="text-foreground/80 text-sm mt-1">
                {resumeData?.total
                  ? `${resumeData.total} resume${resumeData.total !== 1 ? 's' : ''} uploaded`
                  : 'Manage your resumes'}
              </p>
            </div>

            {/* White Content Section */}
            <div className="p-6 bg-white">
              <Button onClick={() => navigate('/resumes')} variant="secondary" className="w-full">
                Manage Resumes
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

        {/* Search and Filter Section */}
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden mb-8">
          <div className="p-6 bg-white">
            {/* Search Bar */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by job title, company, or description..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="flex-shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filter Options (Collapsible) */}
            {showFilters && (
              <div className="border-2 border-black rounded p-4 bg-background space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sort By */}
                  <div>
                    <Label htmlFor="sortBy" className="mb-2">
                      Sort By
                    </Label>
                    <select
                      id="sortBy"
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value as SortOption)}
                      className="w-full px-3 py-2 border-2 border-black rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="score-desc">Highest Score First</option>
                      <option value="score-asc">Lowest Score First</option>
                    </select>
                  </div>

                  {/* Minimum Score Filter */}
                  <div>
                    <Label htmlFor="minScore" className="mb-2">
                      Minimum Match Score ({minScore}%)
                    </Label>
                    <Input
                      id="minScore"
                      type="number"
                      min="0"
                      max="100"
                      value={minScore}
                      onChange={(e) => handleMinScoreChange(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-between items-center border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredAndSortedAnalyses.length} of {analysisData?.analyses.length || 0} analyses
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    disabled={!searchQuery && minScore === 0 && sortBy === 'date-desc'}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Past Analyses Section */}
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
          {/* Colored Header Section */}
          <div className="bg-gradient-to-br from-primary to-primary-hover p-6">
            <h3 className="text-xl font-bold text-foreground">Recent Analyses</h3>
            <p className="text-foreground/80 text-sm mt-1">
              {filteredAndSortedAnalyses.length > 0
                ? `${filteredAndSortedAnalyses.length} analysis${filteredAndSortedAnalyses.length !== 1 ? 'es' : ''} found`
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
            ) : filteredAndSortedAnalyses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {filteredAndSortedAnalyses.map((analysis) => (
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
                {searchQuery || minScore > 0 ? (
                  <>
                    <p className="mb-4 text-lg">No analyses match your filters</p>
                    <p className="mb-6 text-sm">Try adjusting your search or filter criteria</p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="mb-4 text-lg">No analyses yet</p>
                    <p className="mb-6 text-sm">Start analyzing your resume to see results here</p>
                    <Button onClick={() => navigate('/')}>
                      Create your first analysis
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
