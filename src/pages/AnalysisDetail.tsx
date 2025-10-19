import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Briefcase,
  Building2,
} from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { Progress } from "@/components/retroui/Progress";
import { Badge } from "@/components/retroui/Badge";
import { Alert } from "@/components/retroui/Alert";
import { useAnalysisById } from "@/hooks/useAnalysisHistory";
import type { AISuggestion, RewrittenBullet, ATSIssue } from "@/types/api";

export const AnalysisDetail = () => {
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="mb-6"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Analysis Results */}
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
          {/* Colored Header Section */}
          <div className="bg-gradient-to-br from-primary to-primary-hover p-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Analysis Results
            </h2>

            {/* Job Info */}
            <div className="space-y-2">
              {analysis.job_title && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-foreground" />
                  <span className="text-lg text-foreground font-medium">
                    {analysis.job_title}
                  </span>
                </div>
              )}
              {analysis.company_name && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-foreground/80" />
                  <span className="text-foreground/80">
                    {analysis.company_name}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-foreground/80" />
                <span className="text-foreground/80">
                  {formatDate(analysis.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* White Content Section */}
          <div className="p-8 bg-white space-y-8">
            {/* Scores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border-2 border-black rounded shadow-md bg-gradient-to-br from-green-50 to-green-100">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Match Score
                </p>
                <p className="text-4xl font-bold text-green-600">
                  {Number(analysis.match_score)?.toFixed(0) || 0}%
                </p>
                <Progress
                  value={Number(analysis.match_score) || 0}
                  className="h-3 mt-4"
                />
              </div>

              <div className="text-center p-6 border-2 border-black rounded shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  ATS Score
                </p>
                <p className="text-4xl font-bold text-blue-600">
                  {Number(analysis.ats_score)?.toFixed(0) || 0}%
                </p>
                <Progress
                  value={Number(analysis.ats_score) || 0}
                  className="h-3 mt-4"
                />
              </div>

              <div className="text-center p-6 border-2 border-black rounded shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Semantic Similarity
                </p>
                <p className="text-4xl font-bold text-purple-600">
                  {Number(analysis.semantic_similarity)?.toFixed(0) || 0}%
                </p>
                <Progress
                  value={Number(analysis.semantic_similarity) || 0}
                  className="h-3 mt-4"
                />
              </div>
            </div>

            {/* Keywords */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Keywords Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-black rounded p-4 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-700">
                      Matched Keywords (
                      {analysis.matching_keywords?.length || 0})
                    </h4>
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

                <div className="border-2 border-black rounded p-4 shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-700">
                      Missing Keywords ({analysis.missing_keywords?.length || 0}
                      )
                    </h4>
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

            {/* ATS Issues */}
            {analysis.ats_issues && analysis.ats_issues.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  ATS Compatibility Issues
                </h3>
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
              </div>
            )}

            {/* AI Suggestions */}
            {analysis.ai_suggestions && analysis.ai_suggestions.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  AI-Powered Suggestions
                </h3>
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
              </div>
            )}

            {/* Rewritten Bullets */}
            {analysis.rewritten_bullets &&
              analysis.rewritten_bullets.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    AI-Improved Bullet Points
                  </h3>
                  <div className="space-y-4">
                    {analysis.rewritten_bullets.map(
                      (bullet: RewrittenBullet, index: number) => (
                        <div
                          key={index}
                          className="border-2 border-black rounded p-4 shadow-md"
                        >
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
                </div>
              )}

            {/* Job Description */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Job Description
              </h3>
              <div className="border-2 border-black rounded p-4 shadow-md bg-gray-50">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {analysis.job_description}
                </p>
              </div>
            </div>

            {/* Processing Time */}
            <div className="text-sm text-muted-foreground border-t pt-4">
              Analysis completed in{" "}
              {(analysis.processing_time_ms / 1000).toFixed(2)} seconds
              {analysis.openai_tokens_used && (
                <span className="ml-4">
                  • {analysis.openai_tokens_used} AI tokens used
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => navigate("/dashboard")}
                variant="secondary"
                className="flex-1"
              >
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate("/")} className="flex-1">
                Analyze Another Resume
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
