/**
 * Get color class based on score threshold
 */
export function getScoreColor(score: number): {
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  if (score >= 75) {
    return {
      bgClass: 'bg-green-500',
      textClass: 'text-green-600',
      borderClass: 'border-green-600',
    };
  } else if (score >= 50) {
    return {
      bgClass: 'bg-yellow-500',
      textClass: 'text-yellow-600',
      borderClass: 'border-yellow-600',
    };
  } else {
    return {
      bgClass: 'bg-red-500',
      textClass: 'text-red-600',
      borderClass: 'border-red-600',
    };
  }
}

/**
 * Get score interpretation message
 */
export function getScoreInterpretation(score: number, type: 'match' | 'ats' | 'semantic'): string {
  const scoreMessages = {
    match: {
      high: 'Excellent match! Your resume aligns well with this job.',
      medium: 'Good match. Consider adding more relevant keywords.',
      low: 'Low match. Significant improvements needed to align with job requirements.',
    },
    ats: {
      high: 'Your resume is highly ATS-compatible!',
      medium: 'Good ATS compatibility. Review the issues below for improvements.',
      low: 'Your resume may face challenges with ATS systems. Address the issues below.',
    },
    semantic: {
      high: 'Strong semantic alignment with the job description!',
      medium: 'Moderate semantic similarity. Consider using more job-specific terminology.',
      low: 'Limited semantic alignment. Your experience may need better framing.',
    },
  };

  if (score >= 75) return scoreMessages[type].high;
  if (score >= 50) return scoreMessages[type].medium;
  return scoreMessages[type].low;
}
