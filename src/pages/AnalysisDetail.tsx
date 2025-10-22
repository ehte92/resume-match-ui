import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Briefcase,
  Building2,
  Target,
  FileCheck,
  Brain,
  Lightbulb,
  Sparkles,
  FileText,
} from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Alert } from "@/components/retroui/Alert";
import { Skeleton, SkeletonCard } from "@/components/retroui/Skeleton";
import { useAnalysisById } from "@/hooks/useAnalysisHistory";
import type { AISuggestion, RewrittenBullet, ATSIssue } from "@/types/api";
import { ScoreCard } from "@/components/analysis/ScoreCard";
import { CollapsibleSection } from "@/components/analysis/CollapsibleSection";
import { CopyButton } from "@/components/analysis/CopyButton";
import { KeywordMatchBar } from "@/components/analysis/KeywordMatchBar";
import { ExportButton } from "@/components/analysis/ExportButton";
import { formatAsList } from "@/lib/copyToClipboard";
import { usePageTitle } from "@/hooks/usePageTitle";

export const AnalysisDetail = () => {
  usePageTitle("Analysis Results");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: analysis, isLoading, error } = useAnalysisById(id || "");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Skeleton className="w-40 h-10 mb-4 sm:mb-6" />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Alert status="error">
            <XCircle className="h-4 w-4" />
            <Alert.Description>
              {error?.message ||
                "Failed to load analysis. The analysis may have been deleted."}
            </Alert.Description>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Analysis Results */}
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
          {/* Colored Header Section */}
          <div className="bg-gradient-to-br from-primary to-primary-hover p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Analysis Results
              </h2>
              <ExportButton analysis={analysis} variant="secondary" />
            </div>

            {/* Job Info */}
            <div className="space-y-1.5 sm:space-y-2">
              {analysis.job_title && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                  <span className="text-base sm:text-lg text-foreground font-medium">
                    {analysis.job_title}
                  </span>
                </div>
              )}
              {analysis.company_name && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-foreground/80" />
                  <span className="text-sm sm:text-base text-foreground/80">
                    {analysis.company_name}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-foreground/80" />
                <span className="text-xs sm:text-sm text-foreground/80">
                  {formatDate(analysis.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* White Content Section */}
          <div className="p-4 sm:p-6 bg-white space-y-6">
            {/* Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <ScoreCard
                title="Match Score"
                score={Number(analysis.match_score) || 0}
                type="match"
                icon={<Target className="h-6 w-6 text-green-600" />}
                description="How well your resume matches the job description based on keywords and requirements"
              />
              <ScoreCard
                title="ATS Score"
                score={Number(analysis.ats_score) || 0}
                type="ats"
                icon={<FileCheck className="h-6 w-6 text-blue-600" />}
                description="Applicant Tracking System compatibility - higher scores mean better chances of passing automated screening"
              />
              <ScoreCard
                title="Semantic Similarity"
                score={Number(analysis.semantic_similarity) || 0}
                type="semantic"
                icon={<Brain className="h-6 w-6 text-purple-600" />}
                description="How semantically similar your experience is to the job requirements, beyond just keyword matching"
              />
            </div>

            {/* Keywords */}
            <CollapsibleSection
              title="Keywords Analysis"
              icon={<Sparkles className="h-5 w-5 text-primary" />}
              defaultOpen={true}
            >
              <div className="space-y-6">
                {/* Keyword Match Bar */}
                <KeywordMatchBar
                  matchedCount={analysis.matching_keywords?.length || 0}
                  totalCount={
                    (analysis.matching_keywords?.length || 0) +
                    (analysis.missing_keywords?.length || 0)
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="border-2 border-black rounded p-3 sm:p-4 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-medium text-green-700">
                          Matched Keywords (
                          {analysis.matching_keywords?.length || 0})
                        </h4>
                      </div>
                      {analysis.matching_keywords?.length > 0 && (
                        <CopyButton
                          text={formatAsList(analysis.matching_keywords)}
                          label="Copy"
                          size="sm"
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matching_keywords?.length ? (
                        analysis.matching_keywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="solid"
                            className="bg-green-600 text-white border-2 border-black"
                          >
                            {keyword}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No matching keywords found
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-2 border-black rounded p-3 sm:p-4 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <h4 className="font-medium text-red-700">
                          Missing Keywords ({analysis.missing_keywords?.length || 0}
                          )
                        </h4>
                      </div>
                      {analysis.missing_keywords?.length > 0 && (
                        <CopyButton
                          text={formatAsList(analysis.missing_keywords)}
                          label="Copy"
                          size="sm"
                        />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missing_keywords?.length ? (
                        analysis.missing_keywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="solid"
                            className="bg-red-600 text-white border-2 border-black"
                          >
                            {keyword}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No missing keywords
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* ATS Issues */}
            {analysis.ats_issues && analysis.ats_issues.length > 0 && (
              <CollapsibleSection
                title={`ATS Compatibility Issues (${analysis.ats_issues.length})`}
                icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
                defaultOpen={true}
              >
                <div className="border-2 border-black rounded p-4 shadow-md bg-yellow-50">
                  <ul className="space-y-3">
                    {analysis.ats_issues.map((issue: ATSIssue, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-foreground font-medium">
                            {issue.message}
                          </p>
                          {issue.recommendation && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {issue.recommendation}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleSection>
            )}

            {/* AI Suggestions */}
            {analysis.ai_suggestions && analysis.ai_suggestions.length > 0 && (
              <CollapsibleSection
                title={`AI-Powered Suggestions (${analysis.ai_suggestions.length})`}
                icon={<Lightbulb className="h-5 w-5 text-blue-600" />}
                defaultOpen={true}
              >
                <div className="space-y-4">
                  {analysis.ai_suggestions.map(
                    (suggestion: AISuggestion, index: number) => (
                      <div
                        key={index}
                        className="border-2 border-black rounded p-4 shadow-md bg-blue-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground">
                            {suggestion.type}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`
                            ${
                              suggestion.priority === "high"
                                ? "border-red-500 text-red-700"
                                : suggestion.priority === "medium"
                                ? "border-yellow-500 text-yellow-700"
                                : "border-blue-500 text-blue-700"
                            }
                          `}
                          >
                            {suggestion.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.issue}
                        </p>
                        <p className="text-sm text-foreground">
                          {suggestion.suggestion}
                        </p>
                        {suggestion.example && (
                          <div className="mt-2 p-2 bg-white rounded border border-gray-300">
                            <p className="text-xs text-muted-foreground mb-1">
                              Example:
                            </p>
                            <p className="text-sm text-foreground italic">
                              {suggestion.example}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Rewritten Bullets */}
            {analysis.rewritten_bullets &&
              analysis.rewritten_bullets.length > 0 && (
                <CollapsibleSection
                  title={`AI-Improved Bullet Points (${analysis.rewritten_bullets.length})`}
                  icon={<Sparkles className="h-5 w-5 text-green-600" />}
                  defaultOpen={true}
                >
                  <div className="space-y-4">
                    {analysis.rewritten_bullets.map(
                      (bullet: RewrittenBullet, index: number) => (
                        <div
                          key={index}
                          className="border-2 border-black rounded p-4 shadow-md"
                        >
                          <div className="flex justify-end mb-2">
                            <CopyButton
                              text={bullet.improved}
                              label="Copy Improved"
                              size="sm"
                              variant="ghost"
                            />
                          </div>
                          <div className="mb-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Original:
                            </p>
                            <p className="text-sm text-gray-600 line-through">
                              {bullet.original}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-700 mb-1">
                              Improved:
                            </p>
                            <p className="text-sm text-foreground font-medium">
                              {bullet.improved}
                            </p>
                          </div>
                          {bullet.reason && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {bullet.reason}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </CollapsibleSection>
              )}

            {/* Job Description */}
            <CollapsibleSection
              title="Job Description"
              icon={<FileText className="h-5 w-5 text-gray-600" />}
              defaultOpen={false}
            >
              <div className="border-2 border-black rounded p-4 shadow-md bg-gray-50">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {analysis.job_description}
                </p>
              </div>
            </CollapsibleSection>

            {/* Processing Time */}
            <div className="text-xs sm:text-sm text-muted-foreground border-t pt-4">
              Analysis completed in{" "}
              {(analysis.processing_time_ms / 1000).toFixed(2)} seconds
              {analysis.openai_tokens_used && (
                <span className="ml-2 sm:ml-4">
                  • {analysis.openai_tokens_used} AI tokens used
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button onClick={() => navigate("/")} className="w-full sm:flex-1">
                Analyze Another Resume
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="secondary"
                className="w-full sm:flex-1"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
