import { useState, useEffect } from 'react';
import { AlertTriangle, X, CreditCard, Calendar, TrendingDown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface BillingAlert {
  id: string;
  type: 'payment_failed' | 'subscription_ending' | 'limit_warning' | 'plan_expiring';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  actionLabel?: string;
  onAction?: () => void;
  dismissible?: boolean;
}

interface BillingAlertsProps {
  className?: string;
  maxAlerts?: number;
}

export default function BillingAlerts({ className = '', maxAlerts = 3 }: BillingAlertsProps) {
  const { currentSubscription, currentPlan, usage, getUsagePercentage } = useSubscription();
  const [alerts, setAlerts] = useState<BillingAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateAlerts();
  }, [currentSubscription, currentPlan, usage]);

  const generateAlerts = () => {
    const newAlerts: BillingAlert[] = [];

    // Payment failed alert
    if (currentSubscription?.status === 'past_due') {
      newAlerts.push({
        id: 'payment_failed',
        type: 'payment_failed',
        title: 'Payment Failed',
        message: 'Your recent payment failed. Please update your payment method to continue service.',
        severity: 'high',
        actionLabel: 'Update Payment',
        onAction: () => {
          // Navigate to subscription management
          window.location.hash = '#profile';
        }
      });
    }

    // Subscription ending soon
    if (currentSubscription?.cancel_at_period_end) {
      const endDate = new Date(currentSubscription.current_period_end);
      const daysUntilEnd = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilEnd <= 7) {
        newAlerts.push({
          id: 'subscription_ending',
          type: 'subscription_ending',
          title: 'Subscription Ending Soon',
          message: `Your ${currentPlan?.plan_name} subscription will end in ${daysUntilEnd} days.`,
          severity: daysUntilEnd <= 3 ? 'high' : 'medium',
          actionLabel: 'Resume Subscription',
          onAction: () => {
            window.location.hash = '#profile';
          }
        });
      }
    }

    // Usage limit warning
    const usagePercentage = getUsagePercentage('accounts');
    if (usagePercentage >= 90) {
      newAlerts.push({
        id: 'limit_warning',
        type: 'limit_warning',
        title: 'Usage Limit Reached',
        message: 'You\'ve reached your account limit. Upgrade to add more accounts.',
        severity: 'high',
        actionLabel: 'Upgrade Now',
        onAction: () => {
          window.location.hash = '#profile';
        }
      });
    } else if (usagePercentage >= 70) {
      newAlerts.push({
        id: 'usage_warning',
        type: 'limit_warning',
        title: 'Approaching Limit',
        message: `You're at ${Math.round(usagePercentage)}% of your account limit.`,
        severity: 'medium',
        actionLabel: 'Upgrade Plan',
        onAction: () => {
          window.location.hash = '#profile';
        }
      });
    }

    // Plan expiring (trial ending soon)
    if (currentPlan?.plan_type === 'free') {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // Assume 7-day trial
      
      newAlerts.push({
        id: 'trial_ending',
        type: 'plan_expiring',
        title: 'Trial Ending Soon',
        message: 'Your free trial is ending soon. Upgrade to continue accessing premium features.',
        severity: 'low',
        actionLabel: 'View Plans',
        onAction: () => {
          window.location.hash = '#profile';
        }
      });
    }

    setAlerts(newAlerts.filter(alert => !dismissedAlerts.has(alert.id)));
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'payment_failed':
      case 'subscription_ending':
        return CreditCard;
      case 'limit_warning':
        return TrendingDown;
      case 'plan_expiring':
        return Calendar;
      default:
        return AlertTriangle;
    }
  };

  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900/50 text-yellow-800 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getIconColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {alerts.slice(0, maxAlerts).map((alert) => {
        const Icon = getAlertIcon(alert.type);
        
        return (
          <div
            key={alert.id}
            className={`rounded-lg border p-4 ${getAlertStyles(alert.severity)}`}
          >
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getIconColor(alert.severity)}`} />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{alert.title}</h4>
                <p className="text-sm mt-1 opacity-90">{alert.message}</p>
                
                {alert.actionLabel && alert.onAction && (
                  <button
                    onClick={alert.onAction}
                    className="mt-2 text-sm font-medium underline hover:no-underline"
                  >
                    {alert.actionLabel}
                  </button>
                )}
              </div>

              {alert.dismissible !== false && (
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}