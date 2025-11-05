import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CreditCard, Check, AlertCircle, TrendingUp, Users, Zap, Shield, Star, FileText, ExternalLink } from 'lucide-react';

interface Plan {
  id: number;
  plan_type: string;
  plan_name: string;
  price: number;
  monthly_limit: number;
  features: string[];
  is_active: boolean;
}

interface Subscription {
  id: number;
  plan_type: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface BillingRecord {
  id: number;
  stripe_invoice_id: string;
  amount: number;
  currency: string;
  status: string;
  invoice_pdf?: string;
  billing_reason?: string;
  paid_at?: string;
  created_at: string;
}

function BillingHistory() {
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingHistory();
  }, []);

  const loadBillingHistory = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'billing-history' }
      });

      if (error) throw error;
      setBillingHistory(data.data || []);
    } catch (error: any) {
      console.error('Error loading billing history:', error);
      // Don't show error toast for billing history as it's not critical
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'open':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing History</h3>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Billing History</h3>
        <FileText className="w-5 h-5 text-gray-400" />
      </div>
      
      {billingHistory.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No billing history yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Your invoices will appear here after your first payment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {billingHistory.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {record.billing_reason === 'subscription_create' ? 'Subscription Created' :
                     record.billing_reason === 'subscription_update' ? 'Plan Change' :
                     record.billing_reason === 'invoice' ? 'Monthly Subscription' : 'Payment'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(record.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatAmount(record.amount, record.currency)}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
                
                {record.invoice_pdf && (
                  <a
                    href={record.invoice_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SubscriptionManagement() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    // Handle Stripe checkout success/cancel
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    if (success === 'true') {
      toast.success('Payment successful! Your subscription has been activated.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
      toast.error('Payment was canceled. You can try again anytime.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    loadPlansAndSubscription();
  }, []);

  const loadPlansAndSubscription = async () => {
    setLoading(true);
    try {
      // Load all available plans
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Load current subscription
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'get' }
      });

      if (error) throw error;

      if (data.data.subscription) {
        setCurrentSubscription(data.data.subscription);
        setCurrentPlan(data.data.plan);
      } else {
        // Default to free plan
        const freePlan = plansData?.find((p: Plan) => p.plan_type === 'free');
        if (freePlan) {
          setCurrentPlan(freePlan);
        }
      }
    } catch (error: any) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType: string) => {
    setActionLoading(planType);
    try {
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { 
          action: 'create-checkout-session',
          planType,
          returnUrl: window.location.origin
        }
      });

      if (error) throw error;

      if (data.data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error(error.message || 'Failed to create checkout session');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }

    setActionLoading('cancel');
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { action: 'cancel' }
      });

      if (error) throw error;

      toast.success(data.data.message);
      await loadPlansAndSubscription();
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'free':
        return Users;
      case 'pro':
        return Zap;
      case 'enterprise':
        return Shield;
      default:
        return Star;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'pro':
        return 'from-purple-500 to-pink-600';
      case 'enterprise':
        return 'from-blue-600 to-indigo-700';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Current Plan Banner */}
      {currentPlan && (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getPlanColor(currentPlan.plan_type)} text-white p-8 shadow-xl`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Current Plan</p>
                <h2 className="text-3xl font-bold mb-2">{currentPlan.plan_name}</h2>
                <p className="text-lg opacity-90">
                  ${(currentPlan.price / 100).toFixed(2)}/month - Up to {currentPlan.monthly_limit} accounts
                </p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CreditCard className="w-10 h-10" />
              </div>
            </div>
            {currentSubscription?.cancel_at_period_end && (
              <div className="mt-4 flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <AlertCircle className="w-5 h-5" />
                <span>Your subscription will be canceled at the end of the current period</span>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Choose Your Plan</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select the perfect plan for your Instagram growth journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.plan_type);
            const isCurrentPlan = currentPlan?.plan_type === plan.plan_type;
            const isUpgrade = currentPlan && plan.price > currentPlan.price;
            const isDowngrade = currentPlan && plan.price < currentPlan.price;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 transition-all duration-300 ${
                  isCurrentPlan
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-xl scale-105'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 hover:shadow-lg'
                }`}
              >
                {plan.plan_type === 'pro' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getPlanColor(plan.plan_type)} mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.plan_name}</h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${(plan.price / 100).toFixed(0)}
                    <span className="text-lg text-gray-500 dark:text-gray-400 font-normal">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Up to {plan.monthly_limit} accounts
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.plan_type)}
                  disabled={isCurrentPlan || actionLoading === plan.plan_type}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    isCurrentPlan
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${getPlanColor(plan.plan_type)} text-white hover:shadow-lg hover:scale-105`
                  }`}
                >
                  {actionLoading === plan.plan_type ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </span>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : isUpgrade ? (
                    'Upgrade Now'
                  ) : isDowngrade ? (
                    'Downgrade'
                  ) : (
                    'Get Started'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancel Subscription */}
      {currentSubscription && !currentSubscription.cancel_at_period_end && currentPlan?.plan_type !== 'free' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-red-200 dark:border-red-900/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cancel Subscription</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
          </p>
          <button
            onClick={handleCancelSubscription}
            disabled={actionLoading === 'cancel'}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {actionLoading === 'cancel' ? 'Processing...' : 'Cancel Subscription'}
          </button>
        </div>
      )}

      {/* Billing History */}
      <BillingHistory />

      {/* Billing Information */}
      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Method</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {currentSubscription ? 'Card (Stripe managed)' : 'No payment method'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Billing Date</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {currentSubscription?.current_period_end 
                ? new Date(currentSubscription.current_period_end).toLocaleDateString() 
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
