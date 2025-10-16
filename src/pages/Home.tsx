import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, FileText, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { analysisFormSchema, type AnalysisFormData } from '@/schemas/analysis.schema';
import { useAnalyzeResume } from '@/hooks/useAnalyzeResume';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { AnalysisResponse } from '@/types/api';

export default function Home() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisFormSchema),
  });

  const { mutate: analyzeResume, isPending, error } = useAnalyzeResume();

  const resumeFiles = watch('resume');

  // Update selected file name when file changes
  if (resumeFiles && resumeFiles.length > 0 && resumeFiles[0].name !== selectedFileName) {
    setSelectedFileName(resumeFiles[0].name);
  }

  const onSubmit = (data: AnalysisFormData) => {
    const file = data.resume[0];
    const analysisRequest = {
      file,
      job_description: data.jobDescription,
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Optimize Your Resume for Any Job
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Get instant AI-powered feedback on your resume's match with job descriptions
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!result ? (
          /* Analysis Form */
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Quick Resume Analysis</CardTitle>
              <CardDescription>
                Upload your resume and paste a job description to get instant AI-powered feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Error Display */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* File Upload */}
                <div>
                  <Label htmlFor="resume" className="mb-2">
                    Upload Resume (PDF or DOCX)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      {...register('resume')}
                    />
                    <label htmlFor="resume" className="cursor-pointer">
                      {selectedFileName ? (
                        <div className="text-blue-600">
                          <FileText className="mx-auto h-12 w-12 mb-2" />
                          <p className="font-medium">{selectedFileName}</p>
                          <p className="text-sm text-gray-500 mt-1">Click to change file</p>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <Upload className="mx-auto h-12 w-12 mb-2" />
                          <p className="font-medium text-gray-700">
                            Drop your resume here or click to browse
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            PDF or DOCX up to 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.resume && (
                    <p className="text-sm text-red-600 mt-1">{errors.resume.message as string}</p>
                  )}
                </div>

                {/* Job Description */}
                <div>
                  <Label htmlFor="jobDescription" className="mb-2">
                    Job Description
                  </Label>
                  <Textarea
                    id="jobDescription"
                    rows={8}
                    placeholder="Paste the job description here..."
                    {...register('jobDescription')}
                    className="resize-none"
                  />
                  {errors.jobDescription && (
                    <p className="text-sm text-red-600 mt-1">{errors.jobDescription.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Resume'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Results */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Match Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-medium text-gray-700">Match Score</span>
                    <span className="text-3xl font-bold text-blue-600">
                      {result.match_score}%
                    </span>
                  </div>
                  <Progress value={result.match_score} className="h-4" />
                </div>

                {/* Keywords */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Keywords</h3>
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
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
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
                          <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ATS Issues */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ATS Compatibility Issues
                  </h3>
                  <ul className="space-y-2">
                    {result.ats_issues.map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{issue.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Processing Time */}
                <div className="text-sm text-gray-500">
                  Analysis completed in {(result.processing_time_ms / 1000).toFixed(2)} seconds
                </div>

                {/* Reset Button */}
                <Button onClick={handleReset} variant="secondary" className="w-full">
                  Analyze Another Resume
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  );
}
