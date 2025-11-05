import React from 'react';
import { AlertTriangle, AlertCircle, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AlertBadgeProps {
  severity: 'low' | 'medium' | 'high' | 'urgent';
  type?: 'alert' | 'recommendation' | 'opportunity' | 'performance' | 'timing';
  change?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function AlertBadge({ 
  severity, 
  type = 'alert', 
  change,
  showIcon = true,
  size = 'md',
  className = ''
}: AlertBadgeProps) {
  const getSeverityConfig = () => {
    switch (severity) {
      case 'urgent':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          badgeColor: 'bg-red-100 dark:bg-red-800/50',
          pulseColor: 'animate-pulse',
          label: 'Urgent'
        };
      case 'high':
        return {
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          textColor: 'text-orange-800 dark:text-orange-200',
          badgeColor: 'bg-orange-100 dark:bg-orange-800/50',
          pulseColor: '',
          label: 'High'
        };
      case 'medium':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          badgeColor: 'bg-yellow-100 dark:bg-yellow-800/50',
          pulseColor: '',
          label: 'Medium'
        };
      case 'low':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          badgeColor: 'bg-blue-100 dark:bg-blue-800/50',
          pulseColor: '',
          label: 'Low'
        };
    }
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'alert':
        return {
          icon: AlertTriangle,
          label: 'Alert',
          iconColor: severity === 'urgent' ? 'text-red-600' : 
                   severity === 'high' ? 'text-orange-600' : 
                   severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
        };
      case 'recommendation':
        return {
          icon: Info,
          label: 'Recommendation',
          iconColor: 'text-cyan-600'
        };
      case 'opportunity':
        return {
          icon: TrendingUp,
          label: 'Opportunity',
          iconColor: 'text-green-600'
        };
      case 'performance':
        return {
          icon: TrendingUp,
          label: 'Performance',
          iconColor: 'text-purple-600'
        };
      case 'timing':
        return {
          icon: Info,
          label: 'Timing',
          iconColor: 'text-indigo-600'
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Info',
          iconColor: 'text-gray-600'
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          padding: 'px-2 py-1',
          textSize: 'text-xs',
          iconSize: 'h-3 w-3',
          spacing: 'gap-1'
        };
      case 'lg':
        return {
          padding: 'px-4 py-2',
          textSize: 'text-sm',
          iconSize: 'h-5 w-5',
          spacing: 'gap-2'
        };
      default: // md
        return {
          padding: 'px-3 py-1.5',
          textSize: 'text-xs',
          iconSize: 'h-4 w-4',
          spacing: 'gap-1.5'
        };
    }
  };

  const getChangeIcon = () => {
    if (change === undefined) return null;
    
    if (change > 0) {
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    } else if (change < 0) {
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    } else {
      return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const severityConfig = getSeverityConfig();
  const typeConfig = getTypeConfig();
  const sizeConfig = getSizeConfig();
  const Icon = typeConfig.icon;

  return (
    <div className={`inline-flex items-center ${sizeConfig.spacing} ${className}`}>
      <span className={`
        inline-flex items-center ${sizeConfig.padding} rounded-full border
        ${severityConfig.bgColor} ${severityConfig.borderColor} ${severityConfig.badgeColor}
        ${sizeConfig.textSize} font-medium ${severityConfig.textColor}
        ${severityConfig.pulseColor}
      `}>
        {showIcon && (
          <Icon className={`${sizeConfig.iconSize} ${typeConfig.iconColor} ${sizeConfig.spacing === 'gap-1' ? 'mr-1' : sizeConfig.spacing === 'gap-1.5' ? 'mr-1.5' : 'mr-2'}`} />
        )}
        {type !== 'alert' && (
          <span className="font-medium">
            {typeConfig.label}
          </span>
        )}
        {type === 'alert' && (
          <span className="font-medium">
            {severityConfig.label}
          </span>
        )}
      </span>
      
      {change !== undefined && (
        <div className="flex items-center gap-1">
          {getChangeIcon()}
          <span className={`text-xs font-medium ${
            change > 0 ? 'text-green-600' : 
            change < 0 ? 'text-red-600' : 
            'text-gray-500'
          }`}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}