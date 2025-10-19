import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "react-router";
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Briefcase,
  Building2,
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
import { Progress } from "@/components/retroui/Progress";
import { Badge } from "@/components/retroui/Badge";
import { ResumeSelector } from "@/components/resume/ResumeSelector";
import type { AnalysisResponse } from "@/types/api";
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
                        Upload Resume (PDF or DOCX)
                      </Label>
                      <div className="border-2 border-black rounded p-8 text-center bg-background hover:border-primary transition-all shadow-md hover:shadow-lg cursor-pointer">
                        <Input
                          id="resume"
                          type="file"
                          accept=".pdf,.docx"
                          className="hidden"
                          {...register("resume")}
                        />
                        <label htmlFor="resume" className="cursor-pointer">
                          {selectedFileName ? (
                            <div className="text-primary">
                              <FileText className="mx-auto h-12 w-12 mb-2" />
                              <p className="font-medium">{selectedFileName}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Click to change file
                              </p>
                            </div>
                          ) : (
                            <div className="text-muted-foreground">
                              <Upload className="mx-auto h-12 w-12 mb-2" />
                              <p className="font-medium text-foreground">
                                Drop your resume here or click to browse
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                PDF or DOCX up to 5MB
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                      {errors.resume && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.resume.message as string}
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
                    <Label htmlFor="jobDescription" className="mb-2">
                      Job Description
                    </Label>
                    <Textarea
                      id="jobDescription"
                      rows={8}
                      placeholder="Paste the job description here..."
                      {...register("jobDescription")}
                      className="resize-none"
                    />
                    {errors.jobDescription && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.jobDescription.message}
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
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Analysis Results
                </h2>

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
                  {/* Match Score */}
                  <div className="text-center p-6 border-2 border-black rounded shadow-md bg-gradient-to-br from-green-50 to-green-100">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Match Score
                    </p>
                    <p className="text-4xl font-bold text-green-600">
                      {Number(result.match_score)?.toFixed(0) || 0}%
                    </p>
                    <Progress
                      value={Number(result.match_score) || 0}
                      className="h-3 mt-4"
                    />
                  </div>

                  {/* ATS Score */}
                  <div className="text-center p-6 border-2 border-black rounded shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      ATS Score
                    </p>
                    <p className="text-4xl font-bold text-blue-600">
                      {Number(result.ats_score)?.toFixed(0) || 0}%
                    </p>
                    <Progress
                      value={Number(result.ats_score) || 0}
                      className="h-3 mt-4"
                    />
                  </div>

                  {/* Semantic Similarity */}
                  <div className="text-center p-6 border-2 border-black rounded shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Semantic Similarity
                    </p>
                    <p className="text-4xl font-bold text-purple-600">
                      {Number(result.semantic_similarity)?.toFixed(0) || 0}%
                    </p>
                    <Progress
                      value={Number(result.semantic_similarity) || 0}
                      className="h-3 mt-4"
                    />
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Keywords
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <h4 className="text-sm font-medium text-green-700">
                          Matched Keywords
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.matching_keywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="solid"
                            className="bg-green-600 text-white border-2 border-black"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <h4 className="text-sm font-medium text-red-700">
                          Missing Keywords
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.missing_keywords.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="solid"
                            className="bg-red-600 text-white border-2 border-black"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ATS Issues */}
                {result.ats_issues && result.ats_issues.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                      ATS Compatibility Issues
                    </h3>
                    <div className="border-2 border-black rounded p-4 shadow-md bg-yellow-50">
                      <ul className="space-y-3">
                        {result.ats_issues.map((issue, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-foreground font-medium">{issue.message}</p>
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
                {result.ai_suggestions && result.ai_suggestions.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                      AI-Powered Suggestions
                    </h3>
                    <div className="space-y-4">
                      {result.ai_suggestions.map((suggestion, index) => (
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
                          <p className="text-sm text-foreground">{suggestion.suggestion}</p>
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
                      ))}
                    </div>
                  </div>
                )}

                {/* Rewritten Bullets */}
                {result.rewritten_bullets && result.rewritten_bullets.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">
                      AI-Improved Bullet Points
                    </h3>
                    <div className="space-y-4">
                      {result.rewritten_bullets.map((bullet, index) => (
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
                      ))}
                    </div>
                  </div>
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
