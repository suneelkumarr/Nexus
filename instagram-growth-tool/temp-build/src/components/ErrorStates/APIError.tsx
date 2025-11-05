import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, Server, Clock, ExternalLink } from 'lucide-react';

interface APIErrorProps {
  error: string | Error;
  onRetry?: () => void;
  onReport?: () => void;
  className?: string;
  errorCode?: string;
  severity?: 'low' | 'medium' | 'high';
  showSupportLink?: boolean;
  compact?: boolean;
}

const APIError: React.FC<APIErrorProps> = ({
  error,
  onRetry,
  onReport,
  className = '',
  errorCode,
  severity = 'medium',
  showSupportLink = true,
  compact = false
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      console.log('Retrying API call...');
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport();
    } else {
      console.log('Reporting error to support');
    }
  };

  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'low':
        return {
          icon: Clock,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          title: 'Temporary Issue'
        };
      case 'high':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          title: 'Service Unavailable'
        };
      default:
        return {
          icon: Server,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          title: 'Server Error'
        };
    }
  };

  const config = getSeverityConfig(severity);
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {config.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              {errorMessage}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="px-3 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
              {errorCode && (
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                  {errorCode}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[400px] flex items-center justify-center p-8 ${className}`}>
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className={`mx-auto w-16 h-16 ${config.bgColor} ${config.borderColor} border rounded-2xl flex items-center justify-center mb-6`}>
          <Icon className={`w-8 h-8 ${config.iconColor}`} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {config.title}
        </h3>

        {/* Error Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {errorMessage}
        </p>

        {/* Error Code */}
        {errorCode && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span>Error Code:</span>
            <code className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
              {errorCode}
            </code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          {onReport && (
            <button
              onClick={handleReport}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Report Issue
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-2">
            If this problem persists, our team has been automatically notified.
          </p>
          {showSupportLink && (
            <p>
              Need immediate help?{' '}
              <button 
                onClick={() => window.open('mailto:support@yourdomain.com', '_blank')}
                className="text-purple-600 dark:text-purple-400 hover:underline"
              >
                Contact Support
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default APIError;