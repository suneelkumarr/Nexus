import React from 'react';
import { Wifi, RefreshCw, Globe, CheckCircle, AlertCircle } from 'lucide-react';

interface NetworkErrorProps {
  onRetry?: () => void;
  onCheckConnection?: () => void;
  className?: string;
  connectionStatus?: 'offline' | 'slow' | 'intermittent';
  showDiagnostics?: boolean;
  compact?: boolean;
}

const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  onCheckConnection,
  className = '',
  connectionStatus = 'offline',
  showDiagnostics = true,
  compact = false
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      console.log('Retrying network connection...');
    }
  };

  const handleCheckConnection = () => {
    if (onCheckConnection) {
      onCheckConnection();
    } else {
      console.log('Checking network connection...');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'offline':
        return {
          icon: Wifi,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          title: 'No Internet Connection',
          message: 'Check your internet connection and try again.',
          color: 'red'
        };
      case 'slow':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          title: 'Slow Connection',
          message: 'Your internet connection is slow. Data may take longer to load.',
          color: 'yellow'
        };
      case 'intermittent':
        return {
          icon: RefreshCw,
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          iconColor: 'text-orange-600 dark:text-orange-400',
          title: 'Unstable Connection',
          message: 'Your connection keeps dropping. Please check your network.',
          color: 'orange'
        };
      default:
        return {
          icon: Globe,
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          iconColor: 'text-gray-600 dark:text-gray-400',
          title: 'Network Error',
          message: 'There seems to be a network issue.',
          color: 'gray'
        };
    }
  };

  const config = getStatusConfig(connectionStatus);
  const Icon = config.icon;

  const troubleshootingSteps = [
    'Check if other websites are loading',
    'Try switching to a different network',
    'Restart your router or modem',
    'Disable VPN if you\'re using one',
    'Check your firewall settings'
  ];

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
              {config.message}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className={`px-3 py-1 bg-${config.color}-600 hover:bg-${config.color}-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1`}
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
              <button
                onClick={handleCheckConnection}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Check
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[400px] flex items-center justify-center p-8 ${className}`}>
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className={`mx-auto w-20 h-20 ${config.bgColor} ${config.borderColor} border rounded-2xl flex items-center justify-center mb-6`}>
          <Icon className={`w-10 h-10 ${config.iconColor}`} />
        </div>

        {/* Title and Message */}
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {config.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          {config.message}
        </p>

        {/* Connection Status Indicator */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 ${config.bgColor} ${config.borderColor} border rounded-lg mb-6`}>
          <div className={`w-2 h-2 ${config.color === 'red' ? 'bg-red-500' : config.color === 'yellow' ? 'bg-yellow-500' : 'bg-orange-500'} rounded-full animate-pulse`}></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {connectionStatus === 'offline' && 'Offline'}
            {connectionStatus === 'slow' && 'Slow Connection'}
            {connectionStatus === 'intermittent' && 'Unstable Connection'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleRetry}
            className={`inline-flex items-center gap-2 px-6 py-3 bg-${config.color}-600 text-white rounded-lg font-medium hover:bg-${config.color}-700 transition-colors`}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <button
            onClick={handleCheckConnection}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Check Connection
          </button>
        </div>

        {/* Troubleshooting */}
        {showDiagnostics && (
          <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Quick Fixes to Try:
            </h4>
            <ul className="space-y-2">
              {troubleshootingSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>
            💡 Tip: Try refreshing the page after checking your connection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkError;