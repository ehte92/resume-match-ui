import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/retroui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app.
 *
 * Note: Error boundaries do NOT catch errors for:
 * - Event handlers (use try-catch instead)
 * - Asynchronous code (e.g., setTimeout or requestAnimationFrame callbacks)
 * - Server-side rendering
 * - Errors thrown in the error boundary itself
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    // Reset the error boundary state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    // Reset error and navigate to home
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI from props
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="border-2 border-black bg-white shadow-xl rounded overflow-hidden">
              {/* Colored Header Section */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-8">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-8 w-8 text-white" />
                  <h1 className="text-3xl font-bold text-white">
                    Oops! Something went wrong
                  </h1>
                </div>
                <p className="text-white/90 text-lg">
                  We encountered an unexpected error. Don't worry, your data is safe.
                </p>
              </div>

              {/* White Content Section */}
              <div className="p-8 bg-white space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    What happened?
                  </h2>
                  <p className="text-muted-foreground">
                    The application encountered an error while processing your request.
                    This has been logged and we'll work to fix it.
                  </p>
                </div>

                {/* Error details (only in development) */}
                {import.meta.env.DEV && this.state.error && (
                  <div className="border-2 border-red-300 rounded p-4 bg-red-50">
                    <p className="text-sm font-medium text-red-900 mb-2">
                      Error Details (Development Only):
                    </p>
                    <p className="text-xs text-red-800 font-mono break-all mb-2">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <details className="text-xs text-red-700">
                        <summary className="cursor-pointer font-medium mb-1">
                          Component Stack
                        </summary>
                        <pre className="overflow-auto max-h-40 text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={this.handleReset}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    variant="secondary"
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Home
                  </Button>
                </div>

                {/* Help Text */}
                <div className="text-sm text-muted-foreground border-t pt-4">
                  <p>
                    If this problem persists, try clearing your browser cache or
                    contact support for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
