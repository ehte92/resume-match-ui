import { useState } from 'react';
import { Button } from '@/components/retroui/Button';

/**
 * Test component to verify ErrorBoundary functionality
 *
 * USAGE:
 * 1. Import this component in any page (e.g., Home.tsx)
 * 2. Add <ErrorTest /> somewhere in the JSX
 * 3. Click "Trigger Error" button to test the error boundary
 * 4. Remove this component after testing
 *
 * This component should ONLY be used for development testing
 * and should be removed before production deployment.
 */
export const ErrorTest = () => {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    // This will trigger the error boundary
    throw new Error('Test error: ErrorBoundary is working correctly!');
  }

  return (
    <div className="border-2 border-yellow-500 bg-yellow-50 rounded p-4 m-4">
      <p className="text-sm font-medium text-yellow-900 mb-2">
        Development Only: Error Boundary Test
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShouldError(true)}
        className="!border-yellow-600 !text-yellow-700"
      >
        Trigger Error
      </Button>
      <p className="text-xs text-yellow-700 mt-2">
        Remove this component before production deployment
      </p>
    </div>
  );
};
