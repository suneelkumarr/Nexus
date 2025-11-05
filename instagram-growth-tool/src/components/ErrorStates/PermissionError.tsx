import React from 'react';
import { Lock, Shield, User, Settings, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface PermissionErrorProps {
  onRequestPermission?: () => void;
  onCheckSettings?: () => void;
  onOpenInstagram?: () => void;
  className?: string;
  permissionType?: 'instagram' | 'analytics' | 'data';
  requiredPermissions?: string[];
  showInstructions?: boolean;
  compact?: boolean;
}

const PermissionError: React.FC<PermissionErrorProps> = ({
  onRequestPermission,
  onCheckSettings,
  onOpenInstagram,
  className = '',
  permissionType = 'instagram',
  requiredPermissions = [],
  showInstructions = true,
  compact = false
}) => {
  const handleRequestPermission = () => {
    if (onRequestPermission) {
      onRequestPermission();
    } else {
      console.log('Requesting permission...');
    }
  };

  const handleCheckSettings = () => {
    if (onCheckSettings) {
      onCheckSettings();
    } else {
      console.log('Checking settings...');
    }
  };

  const handleOpenInstagram = () => {
    if (onOpenInstagram) {
      onOpenInstagram();
    } else {
      window.open('https://instagram.com', '_blank');
    }
  };

  const getPermissionConfig = (type: string) => {
    switch (type) {
      case 'instagram':
        return {
          icon: Shield,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          title: 'Instagram Permission Required',
          message: 'We need access to your Instagram account to provide analytics. Please grant the necessary permissions.',
          color: 'blue'
        };
      case 'analytics':
        return {
          icon: Lock,
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          iconColor: 'text-purple-600 dark:text-purple-400',
          title: 'Analytics Permission Denied',
          message: 'Access to analytics data has been restricted. Please check your account permissions.',
          color: 'purple'
        };
      case 'data':
        return {
          icon: User,
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          iconColor: 'text-orange-600 dark:text-orange-400',
          title: 'Data Access Restricted',
          message: 'Your account permissions don\'t include access to this data. Please contact your administrator.',
          color: 'orange'
        };
      default:
        return {
          icon: Lock,
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          iconColor: 'text-gray-600 dark:text-gray-400',
          title: 'Permission Required',
          message: 'Additional permissions are needed to access this feature.',
          color: 'gray'
        };
    }
  };

  const config = getPermissionConfig(permissionType);
  const Icon = config.icon;

  const setupSteps = {
    instagram: [
      'Click "Connect Account" to authorize access',
      'Log in to your Instagram account',
      'Review and accept the permissions',
      'Return to this page to continue'
    ],
    analytics: [
      'Check your account settings',
      'Ensure analytics is enabled',
      'Verify your subscription status',
      'Contact support if issues persist'
    ],
    data: [
      'Contact your account administrator',
      'Request appropriate permissions',
      'Wait for approval if required',
      'Refresh this page after permissions are granted'
    ]
  };

  const steps = setupSteps[permissionType as keyof typeof setupSteps] || setupSteps.instagram;

  const permissionsList = requiredPermissions.length > 0 
    ? requiredPermissions 
    : [
        'Read your Instagram account information',
        'Access your posts and media',
        'View engagement metrics',
        'Analyze your audience insights'
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
                onClick={handleRequestPermission}
                className={`px-3 py-1 bg-${config.color}-600 hover:bg-${config.color}-700 text-white rounded text-xs font-medium transition-colors`}
              >
                Grant Access
              </button>
              <button
                onClick={handleCheckSettings}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[500px] flex items-center justify-center p-8 ${className}`}>
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

        {/* Permissions List */}
        <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Required Permissions:
          </h4>
          <ul className="space-y-3">
            {permissionsList.map((permission, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{permission}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleRequestPermission}
            className={`inline-flex items-center gap-2 px-6 py-3 bg-${config.color}-600 text-white rounded-lg font-medium hover:bg-${config.color}-700 transition-colors`}
          >
            <Shield className="w-4 h-4" />
            Grant Access
          </button>
          
          <button
            onClick={handleCheckSettings}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Check Settings
          </button>

          {permissionType === 'instagram' && (
            <button
              onClick={handleOpenInstagram}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Open Instagram
            </button>
          )}
        </div>

        {/* Setup Instructions */}
        {showInstructions && (
          <div className="text-left bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              How to Grant Permission:
            </h4>
            <ol className="space-y-3">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-sm text-blue-800 dark:text-blue-200">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>
            🔒 Your privacy is important. We only access the information you explicitly authorize.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PermissionError;