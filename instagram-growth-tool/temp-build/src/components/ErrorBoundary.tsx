import React from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
}

export interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
  retryCount: number;
  canRetry: boolean;
}

const DEFAULT_ERROR_FALLBACK: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  retryCount, 
  canRetry 
}) => (
  <div className="min-h-[400px] flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Something went wrong
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {error?.message || 'An unexpected error occurred while loading this content.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {canRetry && (
          <button
            onClick={resetError}
            disabled={!canRetry}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again {retryCount > 0 && `(${retryCount})`}
          </button>
        )}
        
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <Home className="w-4 h-4" />
          Go Home
        </button>
      </div>

      <details className="mt-6 text-left">
        <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          Technical Details
        </summary>
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400 font-mono">
          <div className="mb-2">
            <strong>Error:</strong> {error?.name}: {error?.message}
          </div>
          <div>
            <strong>Stack:</strong>
            <pre className="whitespace-pre-wrap mt-1">{error?.stack}</pre>
          </div>
        </div>
      </details>
    </div>
  </div>
);

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report error to external service (console.log for now)
    this.reportError(error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error details for debugging
    console.group('🔴 Error Report');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // In a real app, you would send this to an error reporting service
    // e.g., Sentry, LogRocket, etc.
  };

  private resetError = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      console.warn('Max retry attempts reached');
      return;
    }

    // Clear any pending retry timeouts
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    // Exponential backoff retry logic
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // If it's an immediate retry, just reset. Otherwise, use timeout for exponential backoff
    if (delay > 1000) {
      this.retryTimeoutId = setTimeout(() => {
        this.forceUpdate();
      }, delay);
    }
  };

  private handleResetClick = () => {
    this.resetError();
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { 
      children, 
      fallback: Fallback = DEFAULT_ERROR_FALLBACK,
      maxRetries = 3
    } = this.props;

    if (hasError) {
      const canRetry = retryCount < maxRetries;
      
      return (
        <Fallback
          error={error}
          resetError={this.handleResetClick}
          retryCount={retryCount}
          canRetry={canRetry}
        />
      );
    }

    return children;
  }
}

// Higher-order component for easier wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for manual error handling
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError, error };
}

export default ErrorBoundary;