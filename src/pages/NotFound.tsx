import { useNavigate } from 'react-router';
import { Home, LogIn, FileSearch, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/retroui/Button';
import { useAuth } from '@/contexts/AuthContext';

export const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
          {/* Colored Header Section */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8">
            <div className="flex items-center gap-3 mb-2">
              <FileSearch className="h-12 w-12 text-white" />
              <h1 className="text-5xl font-bold text-white">404</h1>
            </div>
            <h2 className="text-2xl font-bold text-white mt-2">
              Page Not Found
            </h2>
            <p className="text-white/90 text-lg mt-2">
              Oops! The page you're looking for doesn't exist.
            </p>
          </div>

          {/* White Content Section */}
          <div className="p-8 bg-white space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                What happened?
              </h3>
              <p className="text-muted-foreground">
                The page you tried to access might have been moved, deleted, or never existed.
                Don't worry, you can navigate back to safety using the options below.
              </p>
            </div>

            {/* Helpful Suggestions */}
            <div className="border-2 border-black rounded p-4 bg-background">
              <p className="text-sm font-medium text-foreground mb-2">
                Here's what you can do:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Check the URL for typos</li>
                <li>Go back to the previous page</li>
                <li>Start a new resume analysis</li>
                <li>Visit your dashboard to see past analyses</li>
              </ul>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
              {user ? (
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="secondary"
                  className="flex-1"
                >
                  <FileSearch className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/signin')}
                  variant="secondary"
                  className="flex-1"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>

            {/* Help Text */}
            <div className="text-sm text-muted-foreground border-t pt-4">
              <p>
                If you believe this is an error or need assistance, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
