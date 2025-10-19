import jsPDF from 'jspdf';
import type { AnalysisResponse } from '@/types/api';
import { getScoreInterpretation } from './scoreUtils';

/**
 * Export analysis as PDF
 */
export function exportAnalysisToPDF(analysis: AnalysisResponse, filename: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  const matchScore = Number(analysis.match_score) || 0;
  const atsScore = Number(analysis.ats_score) || 0;
  const semanticScore = Number(analysis.semantic_similarity) || 0;

  const date = new Date(analysis.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize / 2.5); // Approximate line height
  };

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Resume Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Header info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (analysis.job_title) {
    doc.text(`Position: ${analysis.job_title}`, margin, yPosition);
    yPosition += 6;
  }
  if (analysis.company_name) {
    doc.text(`Company: ${analysis.company_name}`, margin, yPosition);
    yPosition += 6;
  }
  doc.text(`Date: ${date}`, margin, yPosition);
  yPosition += 12;

  // Divider line
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Scores Section
  checkPageBreak(60);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Analysis Scores', margin, yPosition);
  yPosition += 10;

  // Match Score
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Match Score:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`${matchScore.toFixed(0)}%`, margin + 30, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  const matchHeight = addWrappedText(
    getScoreInterpretation(matchScore, 'match'),
    margin + 5,
    yPosition,
    contentWidth - 5
  );
  yPosition += matchHeight + 8;

  // ATS Score
  checkPageBreak(20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ATS Score:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`${atsScore.toFixed(0)}%`, margin + 30, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  const atsHeight = addWrappedText(
    getScoreInterpretation(atsScore, 'ats'),
    margin + 5,
    yPosition,
    contentWidth - 5
  );
  yPosition += atsHeight + 8;

  // Semantic Similarity
  checkPageBreak(20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Semantic Similarity:', margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`${semanticScore.toFixed(0)}%`, margin + 50, yPosition);
  yPosition += 6;

  doc.setFontSize(10);
  const semanticHeight = addWrappedText(
    getScoreInterpretation(semanticScore, 'semantic'),
    margin + 5,
    yPosition,
    contentWidth - 5
  );
  yPosition += semanticHeight + 10;

  // Divider
  checkPageBreak(5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Keywords Analysis
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Keywords Analysis', margin, yPosition);
  yPosition += 10;

  const totalKeywords = (analysis.matching_keywords?.length || 0) + (analysis.missing_keywords?.length || 0);
  const matchPercentage = totalKeywords > 0
    ? ((analysis.matching_keywords?.length || 0) / totalKeywords * 100).toFixed(0)
    : 0;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Match Rate: ${matchPercentage}% (${analysis.matching_keywords?.length || 0} of ${totalKeywords} keywords)`, margin, yPosition);
  yPosition += 10;

  // Matched Keywords
  if (analysis.matching_keywords && analysis.matching_keywords.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Matched Keywords:', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    analysis.matching_keywords.forEach((keyword) => {
      checkPageBreak(6);
      doc.text(`• ${keyword}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  // Missing Keywords
  if (analysis.missing_keywords && analysis.missing_keywords.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Missing Keywords:', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    analysis.missing_keywords.forEach((keyword) => {
      checkPageBreak(6);
      doc.text(`• ${keyword}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;
  }

  // Divider
  checkPageBreak(5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // ATS Issues
  if (analysis.ats_issues && analysis.ats_issues.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ATS Issues', margin, yPosition);
    yPosition += 10;

    analysis.ats_issues.forEach((issue, index) => {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${issue.type}`, margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Severity: ${issue.severity}`, margin + 5, yPosition);
      yPosition += 5;

      if (issue.section) {
        doc.text(`Section: ${issue.section}`, margin + 5, yPosition);
        yPosition += 5;
      }

      const issueHeight = addWrappedText(
        `Issue: ${issue.message}`,
        margin + 5,
        yPosition,
        contentWidth - 5
      );
      yPosition += issueHeight + 2;

      const recHeight = addWrappedText(
        `Recommendation: ${issue.recommendation}`,
        margin + 5,
        yPosition,
        contentWidth - 5
      );
      yPosition += recHeight + 8;
    });

    // Divider
    checkPageBreak(5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  }

  // AI Suggestions
  if (analysis.ai_suggestions && analysis.ai_suggestions.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Suggestions', margin, yPosition);
    yPosition += 10;

    analysis.ai_suggestions.forEach((suggestion, index) => {
      checkPageBreak(40);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${suggestion.type}`, margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Priority: ${suggestion.priority}`, margin + 5, yPosition);
      yPosition += 5;

      if (suggestion.category) {
        doc.text(`Category: ${suggestion.category}`, margin + 5, yPosition);
        yPosition += 5;
      }

      const issueHeight = addWrappedText(
        `Issue: ${suggestion.issue}`,
        margin + 5,
        yPosition,
        contentWidth - 5
      );
      yPosition += issueHeight + 2;

      const suggestionHeight = addWrappedText(
        `Suggestion: ${suggestion.suggestion}`,
        margin + 5,
        yPosition,
        contentWidth - 5
      );
      yPosition += suggestionHeight + 2;

      if (suggestion.example) {
        const exampleHeight = addWrappedText(
          `Example: ${suggestion.example}`,
          margin + 5,
          yPosition,
          contentWidth - 5
        );
        yPosition += exampleHeight + 2;
      }

      if (suggestion.impact) {
        const impactHeight = addWrappedText(
          `Impact: ${suggestion.impact}`,
          margin + 5,
          yPosition,
          contentWidth - 5
        );
        yPosition += impactHeight + 2;
      }

      yPosition += 6;
    });

    // Divider
    checkPageBreak(5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
  }

  // Rewritten Bullets
  if (analysis.rewritten_bullets && analysis.rewritten_bullets.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AI-Improved Bullet Points', margin, yPosition);
    yPosition += 10;

    analysis.rewritten_bullets.forEach((bullet, index) => {
      checkPageBreak(40);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}.`, margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Original:', margin + 5, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      const origHeight = addWrappedText(
        bullet.original,
        margin + 10,
        yPosition,
        contentWidth - 10
      );
      yPosition += origHeight + 5;

      doc.setFont('helvetica', 'bold');
      doc.text('Improved:', margin + 5, yPosition);
      yPosition += 5;

      doc.setFont('helvetica', 'normal');
      const impHeight = addWrappedText(
        bullet.improved,
        margin + 10,
        yPosition,
        contentWidth - 10
      );
      yPosition += impHeight + 2;

      if (bullet.reason) {
        doc.setFont('helvetica', 'italic');
        const reasonHeight = addWrappedText(
          `Why: ${bullet.reason}`,
          margin + 10,
          yPosition,
          contentWidth - 10,
          9
        );
        yPosition += reasonHeight + 2;
      }

      yPosition += 6;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.text(
      'Generated by Resume Match AI',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  doc.save(filename);
}
