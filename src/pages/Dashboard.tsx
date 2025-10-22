import { useNavigate } from 'react-router';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { Label } from '@/components/retroui/Label';
import { AnalysisCard } from '@/components/analysis/AnalysisCard';
import { SkeletonList } from '@/components/retroui/Skeleton';
import { useAnalysisHistory, useDeleteAnalysis } from '@/hooks/useAnalysisHistory';
import { useResumes } from '@/hooks/useResumes';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X, Plus, FolderOpen } from 'lucide-react';
import type { AnalysisResponse } from '@/types/api';
import { usePageTitle } from '@/hooks/usePageTitle';

type SortOption = 'date-desc' | 'date-asc' | 'score-desc' | 'score-asc';

export const Dashboard = () => {
  usePageTitle('Dashboard');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">
            Track your analyses and optimize your resume
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden hover:shadow-2xl transition-shadow">
            {/* Header Section */}
            <div className="bg-primary p-4 sm:p-5 border-b-2 border-black">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">New Analysis</h3>
              <p className="text-foreground/80 text-xs sm:text-sm mt-1">
                Compare resume with job description
              </p>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-5 bg-white">
              <Button onClick={() => navigate('/new-analysis')} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          </div>

          <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden hover:shadow-2xl transition-shadow">
            {/* Header Section */}
            <div className="bg-blue-500 p-4 sm:p-5 border-b-2 border-black">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Resume Library</h3>
              <p className="text-foreground/80 text-xs sm:text-sm mt-1">
                {resumeData?.total
                  ? `${resumeData.total} resume${resumeData.total !== 1 ? 's' : ''} stored`
                  : 'Upload and manage resumes'}
              </p>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-5 bg-white">
              <Button onClick={() => navigate('/resumes')} variant="secondary" className="w-full">
                <FolderOpen className="h-4 w-4 mr-2" />
                View Resumes
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 bg-white">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search analyses..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 sm:pl-10 text-sm"
                />
              </div>
              <Button
                variant={showFilters ? 'default' : 'outline'}
                onClick={() => setShowFilters(!showFilters)}
                className="flex-shrink-0 w-full sm:w-auto"
                size="sm"
              >
                <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
                <span className="sm:inline hidden">Filters</span>
              </Button>
            </div>

            {/* Filter Options (Collapsible) */}
            {showFilters && (
              <div className="border-2 border-black rounded p-3 sm:p-4 bg-background space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Sort By */}
                  <div>
                    <Label htmlFor="sortBy" className="mb-2 text-xs sm:text-sm">
                      Sort By
                    </Label>
                    <select
                      id="sortBy"
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value as SortOption)}
                      className="w-full px-3 py-2 text-sm border-2 border-black rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="score-desc">Highest Score</option>
                      <option value="score-asc">Lowest Score</option>
                    </select>
                  </div>

                  {/* Minimum Score Filter */}
                  <div>
                    <Label htmlFor="minScore" className="mb-2 text-xs sm:text-sm">
                      Min Score ({minScore}%)
                    </Label>
                    <Input
                      id="minScore"
                      type="number"
                      min="0"
                      max="100"
                      value={minScore}
                      onChange={(e) => handleMinScoreChange(e.target.value)}
                      placeholder="0"
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 border-t pt-3 sm:pt-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {filteredAndSortedAnalyses.length} of {analysisData?.analyses.length || 0} analyses
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    disabled={!searchQuery && minScore === 0 && sortBy === 'date-desc'}
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Past Analyses Section */}
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
          {/* Header Section */}
          <div className="bg-primary p-4 sm:p-5 border-b-2 border-black">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">Recent Analyses</h3>
            <p className="text-foreground/80 text-xs sm:text-sm mt-1">
              {filteredAndSortedAnalyses.length > 0
                ? `${filteredAndSortedAnalyses.length} ${filteredAndSortedAnalyses.length === 1 ? 'result' : 'results'}`
                : 'No analyses yet'}
            </p>
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-6 bg-white">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <SkeletonList count={pageSize} variant="analysis" />
              </div>
            ) : error ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-destructive mb-4 text-sm sm:text-base">Failed to load analyses</p>
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : filteredAndSortedAnalyses.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  {filteredAndSortedAnalyses.map((analysis) => (
                    <AnalysisCard
                      key={analysis.id}
                      analysis={analysis}
                      onDelete={(id) => {
                        deleteAnalysis(id, {
                          onSuccess: () => toast.success('Analysis deleted'),
                          onError: () => toast.error('Failed to delete'),
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
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>

                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Page {currentPage} of {Math.ceil(analysisData.total / pageSize)}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage >= Math.ceil(analysisData.total / pageSize)}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-2" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                {searchQuery || minScore > 0 ? (
                  <>
                    <p className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">No analyses match your filters</p>
                    <p className="mb-4 sm:mb-6 text-xs sm:text-sm">Try adjusting your search criteria</p>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="mb-3 sm:mb-4 text-base sm:text-lg font-medium">No analyses yet</p>
                    <p className="mb-4 sm:mb-6 text-xs sm:text-sm">Start analyzing your resume</p>
                    <Button size="sm" onClick={() => navigate('/new-analysis')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Analysis
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
