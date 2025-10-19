import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "react-router";
import { toast } from "sonner";
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Briefcase,
  Building2,
  Target,
  FileCheck,
  Brain,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import {
  analysisFormSchema,
  type AnalysisFormData,
} from "@/schemas/analysis.schema";
import { useAnalyzeResume } from "@/hooks/useAnalyzeResume";
import { Button } from "@/components/retroui/Button";
import { Label } from "@/components/retroui/Label";
import { Input } from "@/components/retroui/Input";
import { Textarea } from "@/components/retroui/Textarea";
import { Alert } from "@/components/retroui/Alert";
import { Badge } from "@/components/retroui/Badge";
import { ResumeSelector } from "@/components/resume/ResumeSelector";
import { ScoreCard } from "@/components/analysis/ScoreCard";
import { CollapsibleSection } from "@/components/analysis/CollapsibleSection";
import { CopyButton } from "@/components/analysis/CopyButton";
import { KeywordMatchBar } from "@/components/analysis/KeywordMatchBar";
import { ExportButton } from "@/components/analysis/ExportButton";
import { formatAsList } from "@/lib/copyToClipboard";
import type { AnalysisResponse, AISuggestion, RewrittenBullet, ATSIssue } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";

type UploadMode = "upload" | "select";

export default function Home() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("upload");
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisFormSchema),
  });

  const { mutate: analyzeResume, isPending, error } = useAnalyzeResume();

  const resumeFiles = watch("resume");
  const jobDescription = watch("jobDescription");
  const jobDescriptionLength = jobDescription?.length || 0;

  // Handle pre-selected resume from navigation
  useEffect(() => {
    const state = location.state as { resumeId?: string } | null;
    if (state?.resumeId && isAuthenticated) {
      setUploadMode("select");
      setSelectedResumeId(state.resumeId);
      setValue("resumeId", state.resumeId);
    }
  }, [location.state, isAuthenticated, setValue]);

  // Update selected file name when file changes
  if (
    resumeFiles &&
    resumeFiles.length > 0 &&
    resumeFiles[0].name !== selectedFileName
  ) {
    setSelectedFileName(resumeFiles[0].name);
  }

  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onSubmit = (data: AnalysisFormData) => {
    const analysisRequest = {
      file: data.resume && data.resume.length > 0 ? data.resume[0] : undefined,
      resume_id: data.resumeId,
      job_description: data.jobDescription,
      job_title: data.jobTitle,
      company_name: data.companyName,
    };

    analyzeResume(analysisRequest, {
      onSuccess: (response) => {
        setResult(response);
        toast.success("Analysis completed successfully!");
        // Scroll to results
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      onError: (error) => {
        console.error("Analysis error:", error);
        toast.error(error.message || "Failed to analyze resume. Please try again.");
      },
    });
  };

  const handleReset = () => {
    reset();
    setResult(null);
    setSelectedFileName(null);
    setUploadMode("upload");
    setSelectedResumeId(null);
  };

  const handleModeChange = (mode: UploadMode) => {
    setUploadMode(mode);
    if (mode === "upload") {
      setSelectedResumeId(null);
      setValue("resumeId", undefined);
    } else {
      setSelectedFileName(null);
      setValue("resume", undefined);
    }
  };

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setValue("resumeId", resumeId);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-hover text-primary-foreground/80 border-b-5 border-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Optimize Your Resume for Any Job
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground mb-8">
              Get instant AI-powered feedback on your resume's match with job
              descriptions
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {!result ? (
            /* Analysis Form */
            <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
              {/* Colored Header Section */}
              <div className="bg-gradient-to-br from-primary to-primary-hover p-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Quick Resume Analysis
                </h2>
                <p className="text-foreground/80 text-lg">
                  Upload your resume and paste a job description to get instant
                  AI-powered feedback
                </p>
              </div>

              {/* White Content Section */}
              <div className="p-8 bg-white">
                {/* Error Display */}
                {error && (
                  <Alert status="error" className="mb-6">
                    <XCircle className="h-4 w-4" />
                    <Alert.Description>{error.message}</Alert.Description>
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Resume Source Selection - Only show for authenticated users */}
                  {isAuthenticated && (
                    <div>
                      <Label className="mb-3">Resume Source</Label>
                      <div className="flex border-2 border-black rounded overflow-hidden shadow-md">
                        <button
                          type="button"
                          onClick={() => handleModeChange("upload")}
                          className={`
                            flex-1 px-4 py-3 font-medium transition-colors
                            ${
                              uploadMode === "upload"
                                ? "bg-primary text-foreground"
                                : "bg-white text-muted-foreground hover:bg-gray-50"
                            }
                          `}
                        >
                          <Upload className="inline-block h-4 w-4 mr-2" />
                          Upload New
                        </button>
                        <div className="w-0.5 bg-black"></div>
                        <button
                          type="button"
                          onClick={() => handleModeChange("select")}
                          className={`
                            flex-1 px-4 py-3 font-medium transition-colors
                            ${
                              uploadMode === "select"
                                ? "bg-primary text-foreground"
                                : "bg-white text-muted-foreground hover:bg-gray-50"
                            }
                          `}
                        >
                          <FileText className="inline-block h-4 w-4 mr-2" />
                          Select from Library
                        </button>
                      </div>
                    </div>
                  )}

                  {/* File Upload - Shown when in upload mode or for non-authenticated users */}
                  {uploadMode === "upload" && (
                    <div>
                      <Label htmlFor="resume" className="mb-2">
                        Upload Resume
                      </Label>
                      <div className={`border-2 rounded p-8 text-center bg-background transition-all shadow-md cursor-pointer ${
                        errors.resume ? 'border-red-500 hover:border-red-600' : 'border-black hover:border-primary hover:shadow-lg'
                      }`}>
                        <Input
                          id="resume"
                          type="file"
                          accept=".pdf,.docx"
                          className="hidden"
                          {...register("resume")}
                        />
                        <label htmlFor="resume" className="cursor-pointer">
                          {selectedFileName && resumeFiles?.[0] ? (
                            <div className="text-primary">
                              <FileText className="mx-auto h-12 w-12 mb-2" />
                              <p className="font-medium">{selectedFileName}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatFileSize(resumeFiles[0].size)} • Click to change file
                              </p>
                            </div>
                          ) : (
                            <div className="text-muted-foreground">
                              <Upload className="mx-auto h-12 w-12 mb-2" />
                              <p className="font-medium text-foreground">
                                Drop your resume here or click to browse
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                PDF or DOCX • Maximum 5MB
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                      {errors.resume && (
                        <p className="text-sm text-destructive mt-2 flex items-start gap-1">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{errors.resume.message as string}</span>
                        </p>
                      )}
                      {!errors.resume && resumeFiles?.[0] && (
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>File ready for upload</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Resume Selector - Shown when in select mode for authenticated users */}
                  {uploadMode === "select" && isAuthenticated && (
                    <div>
                      <Label className="mb-2">Select from Your Library</Label>
                      <ResumeSelector
                        selectedResumeId={selectedResumeId}
                        onSelectResume={handleResumeSelect}
                      />
                      {errors.resumeId && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.resumeId.message as string}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Job Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="jobDescription">
                        Job Description
                      </Label>
                      <span className={`text-xs ${
                        jobDescriptionLength < 50
                          ? 'text-red-600 font-medium'
                          : jobDescriptionLength > 10000
                          ? 'text-red-600 font-medium'
                          : jobDescriptionLength > 9000
                          ? 'text-yellow-600'
                          : 'text-muted-foreground'
                      }`}>
                        {jobDescriptionLength.toLocaleString()} / 10,000
                        {jobDescriptionLength < 50 && jobDescriptionLength > 0 && (
                          <span className="ml-1">({50 - jobDescriptionLength} more needed)</span>
                        )}
                      </span>
                    </div>
                    <Textarea
                      id="jobDescription"
                      rows={8}
                      placeholder="Paste the job description here... (minimum 50 characters)"
                      {...register("jobDescription")}
                      className={`resize-none ${
                        errors.jobDescription ? 'border-red-500 focus:border-red-600' : ''
                      }`}
                    />
                    {errors.jobDescription && (
                      <p className="text-sm text-destructive mt-2 flex items-start gap-1">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{errors.jobDescription.message}</span>
                      </p>
                    )}
                    {!errors.jobDescription && jobDescriptionLength >= 50 && jobDescriptionLength <= 10000 && (
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Job description looks good</span>
                      </p>
                    )}
                  </div>

                  {/* Optional: Job Title */}
                  <div>
                    <Label htmlFor="jobTitle" className="mb-2">
                      Job Title{" "}
                      <span className="text-sm text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="jobTitle"
                      type="text"
                      placeholder="e.g., Senior Software Engineer"
                      {...register("jobTitle")}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Helps organize your analysis history
                    </p>
                  </div>

                  {/* Optional: Company Name */}
                  <div>
                    <Label htmlFor="companyName" className="mb-2">
                      Company Name{" "}
                      <span className="text-sm text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="e.g., Tech Corp Inc."
                      {...register("companyName")}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Makes it easier to track applications
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Resume"
                    )}
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            /* Results */
            <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
              {/* Colored Header Section */}
              <div className="bg-gradient-to-br from-primary to-primary-hover p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-foreground">
                    Analysis Results
                  </h2>
                  <ExportButton analysis={result} variant="secondary" />
                </div>

                {/* Job Info */}
                {(result.job_title || result.company_name) && (
                  <div className="space-y-2">
                    {result.job_title && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-foreground" />
                        <span className="text-lg text-foreground font-medium">
                          {result.job_title}
                        </span>
                      </div>
                    )}
                    {result.company_name && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-foreground/80" />
                        <span className="text-foreground/80">{result.company_name}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* White Content Section */}
              <div className="p-8 bg-white space-y-8">
                {/* Scores Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ScoreCard
                    title="Match Score"
                    score={Number(result.match_score) || 0}
                    type="match"
                    icon={<Target className="h-6 w-6 text-green-600" />}
                    description="How well your resume matches the job description based on keywords and requirements"
                  />
                  <ScoreCard
                    title="ATS Score"
                    score={Number(result.ats_score) || 0}
                    type="ats"
                    icon={<FileCheck className="h-6 w-6 text-blue-600" />}
                    description="Applicant Tracking System compatibility - higher scores mean better chances of passing automated screening"
                  />
                  <ScoreCard
                    title="Semantic Similarity"
                    score={Number(result.semantic_similarity) || 0}
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
                      matchedCount={result.matching_keywords?.length || 0}
                      totalCount={
                        (result.matching_keywords?.length || 0) +
                        (result.missing_keywords?.length || 0)
                      }
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="border-2 border-black rounded p-4 shadow-md">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <h4 className="font-medium text-green-700">
                              Matched Keywords ({result.matching_keywords?.length || 0})
                            </h4>
                          </div>
                          {result.matching_keywords?.length > 0 && (
                            <CopyButton
                              text={formatAsList(result.matching_keywords)}
                              label="Copy"
                              size="sm"
                            />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.matching_keywords?.length ? (
                            result.matching_keywords.map((keyword, index) => (
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
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <h4 className="font-medium text-red-700">
                              Missing Keywords ({result.missing_keywords?.length || 0})
                            </h4>
                          </div>
                          {result.missing_keywords?.length > 0 && (
                            <CopyButton
                              text={formatAsList(result.missing_keywords)}
                              label="Copy"
                              size="sm"
                            />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.missing_keywords?.length ? (
                            result.missing_keywords.map((keyword, index) => (
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
                {result.ats_issues && result.ats_issues.length > 0 && (
                  <CollapsibleSection
                    title={`ATS Compatibility Issues (${result.ats_issues.length})`}
                    icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
                    defaultOpen={true}
                  >
                    <div className="border-2 border-black rounded p-4 shadow-md bg-yellow-50">
                      <ul className="space-y-3">
                        {result.ats_issues.map((issue: ATSIssue, index: number) => (
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
                {result.ai_suggestions && result.ai_suggestions.length > 0 && (
                  <CollapsibleSection
                    title={`AI-Powered Suggestions (${result.ai_suggestions.length})`}
                    icon={<Lightbulb className="h-5 w-5 text-blue-600" />}
                    defaultOpen={true}
                  >
                    <div className="space-y-4">
                      {result.ai_suggestions.map(
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
                {result.rewritten_bullets && result.rewritten_bullets.length > 0 && (
                  <CollapsibleSection
                    title={`AI-Improved Bullet Points (${result.rewritten_bullets.length})`}
                    icon={<Sparkles className="h-5 w-5 text-green-600" />}
                    defaultOpen={true}
                  >
                    <div className="space-y-4">
                      {result.rewritten_bullets.map(
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

                {/* Processing Time */}
                <div className="text-sm text-muted-foreground border-t pt-4">
                  Analysis completed in{" "}
                  {(result.processing_time_ms / 1000).toFixed(2)} seconds
                  {result.openai_tokens_used && (
                    <span className="ml-4">
                      • {result.openai_tokens_used} AI tokens used
                    </span>
                  )}
                </div>

                {/* Reset Button */}
                <Button
                  onClick={handleReset}
                  variant="secondary"
                  className="w-full"
                >
                  Analyze Another Resume
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
