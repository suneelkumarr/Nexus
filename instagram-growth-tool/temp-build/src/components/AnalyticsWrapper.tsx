import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import LoadingState, { ProgressiveLoading } from './LoadingStates/LoadingState';
import NoAccountConnected from './EmptyStates/NoAccountConnected';
import NoDataAvailable from './EmptyStates/NoDataAvailable';
import NoPostsYet from './EmptyStates/NoPostsYet';
import AccountDisconnected from './EmptyStates/AccountDisconnected';
import APIError from './ErrorStates/APIError';
import NetworkError from './ErrorStates/NetworkError';
import PermissionError from './ErrorStates/PermissionError';
import RateLimitError from './ErrorStates/RateLimitError';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: Error | string | null;
  empty?: {
    type: 'no_account' | 'no_data' | 'no_posts' | 'account_disconnected';
    data?: any;
  };
  onRetry?: () => void;
  onConnectAccount?: () => void;
  onReconnectAccount?: () => void;
  onRefreshData?: () => void;
  onUpgrade?: () => void;
  className?: string;
  compact?: boolean;
}

const AnalyticsWrapper: React.FC<AnalyticsWrapperProps> = ({
  children,
  loading = false,
  error = null,
  empty = null,
  onRetry,
  onConnectAccount,
  onReconnectAccount,
  onRefreshData,
  onUpgrade,
  className = '',
  compact = false
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      console.log('Retrying...');
    }
  };

  const handleConnectAccount = () => {
    if (onConnectAccount) {
      onConnectAccount();
    } else {
      console.log('Navigate to connect account');
    }
  };

  const handleReconnectAccount = () => {
    if (onReconnectAccount) {
      onReconnectAccount();
    } else {
      console.log('Reconnect account');
    }
  };

  const handleRefreshData = () => {
    if (onRefreshData) {
      onRefreshData();
    } else {
      console.log('Refresh data');
    }
  };

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      console.log('Navigate to upgrade');
    }
  };

  // Error handling
  if (error) {
    const errorString = typeof error === 'string' ? error : error.message;
    
    // Network errors
    if (errorString.includes('network') || errorString.includes('fetch') || errorString.includes('connection')) {
      return (
        <NetworkError
          onRetry={handleRetry}
          onCheckConnection={handleRefreshData}
          compact={compact}
          className={className}
        />
      );
    }
    
    // Permission errors
    if (errorString.includes('permission') || errorString.includes('unauthorized') || errorString.includes('forbidden')) {
      return (
        <PermissionError
          onRequestPermission={handleConnectAccount}
          onCheckSettings={handleRetry}
          compact={compact}
          className={className}
        />
      );
    }
    
    // Rate limit errors
    if (errorString.includes('rate limit') || errorString.includes('too many requests') || errorString.includes('quota')) {
      return (
        <RateLimitError
          onUpgrade={handleUpgrade}
          onWait={handleRetry}
          compact={compact}
          className={className}
        />
      );
    }
    
    // API errors
    return (
      <APIError
        error={error}
        onRetry={handleRetry}
        onReport={handleRetry}
        compact={compact}
        className={className}
      />
    );
  }

  // Empty states
  if (empty) {
    switch (empty.type) {
      case 'no_account':
        return (
          <NoAccountConnected
            onConnectAccount={handleConnectAccount}
            compact={compact}
            className={className}
          />
        );
      case 'no_data':
        return (
          <NoDataAvailable
            onRefresh={handleRefreshData}
            onChangeTimeRange={handleRetry}
            compact={compact}
            className={className}
          />
        );
      case 'no_posts':
        return (
          <NoPostsYet
            onCreatePost={handleConnectAccount}
            compact={compact}
            className={className}
          />
        );
      case 'account_disconnected':
        return (
          <AccountDisconnected
            onReconnect={handleReconnectAccount}
            onCheckPermissions={handleRetry}
            compact={compact}
            className={className}
          />
        );
      default:
        return null;
    }
  }

  // Loading state
  if (loading) {
    return (
      <LoadingState
        message="Loading analytics data..."
        subMessage="Please wait while we fetch your information"
        variant={compact ? 'compact' : 'inline'}
        showProgress={!compact}
        progress={undefined}
        className={className}
      />
    );
  }

  // Main content with error boundary
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Analytics component error:', error, errorInfo);
      }}
      maxRetries={2}
    >
      <div className={className}>
        {children}
      </div>
    </ErrorBoundary>
  );
};

// Hook for managing component state
export function useAnalyticsState() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | string | null>(null);
  const [empty, setEmpty] = React.useState<any>(null);

  const setLoadingState = (isLoading: boolean) => {
    setLoading(isLoading);
    if (isLoading) {
      setError(null);
    }
  };

  const setErrorState = (error: Error | string | null) => {
    setError(error);
    setLoading(false);
    setEmpty(null);
  };

  const setEmptyState = (emptyState: any) => {
    setEmpty(emptyState);
    setLoading(false);
    setError(null);
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setEmpty(null);
  };

  return {
    loading,
    error,
    empty,
    setLoading: setLoadingState,
    setError: setErrorState,
    setEmpty: setEmptyState,
    reset: resetState
  };
}

export default AnalyticsWrapper;