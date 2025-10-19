import { useEffect } from 'react';

/**
 * Custom hook to set the page title dynamically
 * @param title - The page title to set (will be appended with " | ResumeMatch AI")
 * @param appendSiteName - Whether to append the site name (default: true)
 */
export const usePageTitle = (title: string, appendSiteName: boolean = true) => {
  useEffect(() => {
    const siteName = 'ResumeMatch AI';
    const fullTitle = appendSiteName ? `${title} | ${siteName}` : title;

    document.title = fullTitle;

    // Cleanup: Reset to default title when component unmounts
    return () => {
      document.title = siteName;
    };
  }, [title, appendSiteName]);
};
