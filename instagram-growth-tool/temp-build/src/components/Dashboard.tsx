import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalization, useUserContext, useUserPreferences } from '@/hooks/usePersonalization';
import { useIsMobile, useTouchDevice } from '@/hooks/use-mobile';
import HoverableCard from '@/components/UI/HoverableCard';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import IconWrapper from '@/components/UI/IconWrapper';
import { cn } from '@/lib/utils';
import { Instagram, TrendingUp, Settings, LogOut, Plus, Users, Clock, BarChart3, Calendar, Search, Sparkles, UserCheck, Activity, User, AlertCircle, Building, Globe, Phone, Heart, MessageCircle, Eye, PieChart, Palette, UserCog, Download, Share2, FileText, Target, HelpCircle, Monitor, Printer } from 'lucide-react';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import BasicAnalytics from '@/components/BasicAnalytics';
import AccountManagement from '@/components/AccountManagement';
import AdvancedAnalyticsDashboard from '@/components/AdvancedAnalyticsDashboard';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import ContentManagement from '@/components/ContentManagement';
import AdvancedResearch from '@/components/AdvancedResearch';
import AIInsights from '@/components/AIInsights';
import CollaborationDashboard from '@/components/CollaborationDashboard';
import SystemDashboard from '@/components/SystemDashboard';
import UserProfile from '@/components/UserProfile';
import HelpMenu from '@/components/HelpMenu';
import ErrorBoundary from '@/components/ErrorBoundary';

// New guided tour components
import NextSteps from '@/components/GuidedTour/NextSteps';
import HelpTooltips from '@/components/GuidedTour/HelpTooltips';
import FeatureDiscovery from '@/components/GuidedTour/FeatureDiscovery';
import TooltipTour from '@/components/GuidedTour/TooltipTour';

// Hooks for onboarding and guided tour
import { useOnboarding } from '@/hooks/useOnboarding';
import { useGuidedTour } from '@/hooks/useGuidedTour';
import WelcomeChoiceModal from '@/components/Onboarding/WelcomeChoiceModal';
import SubscriptionStatus from '@/components/SubscriptionStatus';
import UsageLimits from '@/components/UsageLimits';
import UpgradePrompt from '@/components/UpgradePrompt';
import DataFormattingDemo from '@/components/DataFormattingDemo';
import WelcomeHeader from '@/components/Personalization/EnhancedWelcomeHeader';
import PersonalizedInsights from '@/components/Personalization/EnhancedPersonalizedInsights';
import UserProfileCard from '@/components/Personalization/UserProfileCard';
import BrandingTheme from '@/components/Personalization/BrandingTheme';
import ExportModal from '@/components/Export/ExportModal';
import PDFReportGenerator from '@/components/Export/PDFReportGenerator';
import ChartExporter from '@/components/Export/ChartExporter';
import EmailShare from '@/components/Export/EmailShare';
import SocialShare from '@/components/Export/SocialShare';
import LinkShare from '@/components/Export/LinkShare';
import QRCodeGenerator from '@/components/Export/QRCodeGenerator';
import { useExport } from '@/hooks/useExport';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';

// Conversion optimization components
import ConversionCenter from '@/components/Conversion/ConversionCenter';
import { ConversionWidget } from '@/components/Conversion/ConversionCenter';

interface ProfileData {
  full_name: string;
  company: string;
  phone: string;
  website: string;
  bio: string;
}

type TabType = 'overview' | 'advanced' | 'charts' | 'content' | 'research' | 'ai-insights' | 'collaboration' | 'system' | 'profile' | 'accounts' | 'data-formatting';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { currentPlan, showUpgradePrompt, refreshUsage, getUsagePercentage, trackUsage, loading: subscriptionLoading, error: subscriptionError, retry: retrySubscription } = useSubscription();
  const { preferences: personalizationPrefs, userContext, updatePreferences, isLoading: personalizationLoading } = usePersonalization();
  const exportHook = useExport();
  const isMobile = useIsMobile();
  const isTouchDevice = useTouchDevice();
  
  // Onboarding and guided tour hooks
  const onboarding = useOnboarding();
  const guidedTour = useGuidedTour();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile && !personalizationPrefs.compactSidebar);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [showWelcomeChoice, setShowWelcomeChoice] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPersonalizationPanel, setShowPersonalizationPanel] = useState(false);
  const [showConversionCenter, setShowConversionCenter] = useState(false);
  const [showConversionWidget, setShowConversionWidget] = useState(false);
  const [conversionContext, setConversionContext] = useState<any>(null);
  const [usageAlerts, setUsageAlerts] = useState<string[]>([]);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [showFeatureDiscovery, setShowFeatureDiscovery] = useState(false);
  const [showHelpTooltips, setShowHelpTooltips] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    company: '',
    phone: '',
    website: '',
    bio: ''
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isAIInsightsPanelOpen, setIsAIInsightsPanelOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);
  const [showEmailShare, setShowEmailShare] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);
  const [showLinkShare, setShowLinkShare] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [userStats, setUserStats] = useState({
    followers: 0,
    posts: 0,
    accountType: 'personal' as const
  });
  const [showMobileActions, setShowMobileActions] = useState(false);

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [activeTab, isMobile, isSidebarOpen]);

  useEffect(() => {
    checkOnboardingStatus();
    loadProfileData();
    loadUserContext();
    const cleanup = setupUsageTrackingListener();
    
    // Show welcome choice for new users - only if completion < 50% and not dismissed
    if (onboarding.data && onboarding.data.progress.progressPercentage < 50 && !localStorage.getItem('tour_dismissed_permanently')) {
      // Show choice modal after a short delay to let the UI load
      const timer = setTimeout(() => {
        setShowWelcomeChoice(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [onboarding.data]);

  useEffect(() => {
    checkUsageAlerts();
  }, [currentPlan, getUsagePercentage]);

  const loadProfileData = async () => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError(null);

      // Use direct database query instead of edge function
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existingProfile) {
        setProfileData({
          full_name: existingProfile.full_name || '',
          company: existingProfile.company || '',
          phone: existingProfile.phone || '',
          website: existingProfile.website || '',
          bio: existingProfile.bio || ''
        });
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        
        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating profile:', createError);
          // Set default profile data instead of failing
          setProfileData({
            full_name: newProfile.full_name || '',
            company: '',
            phone: '',
            website: '',
            bio: ''
          });
        } else {
          setProfileData({
            full_name: created.full_name || '',
            company: created.company || '',
            phone: created.phone || '',
            website: created.website || '',
            bio: created.bio || ''
          });
        }
      }
    } catch (error: any) {
      console.error('Error loading profile data:', error);
      setProfileError(error.message || 'Failed to load profile data');
    } finally {
      setProfileLoading(false);
    }
  };

  const loadUserContext = async () => {
    if (!user) return;

    try {
      // Load Instagram accounts to get user stats
      const { data: accounts } = await supabase
        .from('instagram_accounts')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setUserStats({
          followers: account.followers_count || 0,
          posts: account.media_count || 0,
          accountType: account.account_type || 'personal'
        });
      }
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  };

  const setupUsageTrackingListener = () => {
    if (!user) return () => {};

    const handleUsageUpdate = () => {
      refreshUsage();
    };

    window.addEventListener('usageUpdated', handleUsageUpdate);

    // Set up real-time subscription for usage changes
    const usageSubscription = supabase
      .channel('usage_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usage_tracking',
          filter: `user_id=eq.${user.id}`
        },
        handleUsageUpdate
      )
      .subscribe();

    // Return cleanup function
    return () => {
      window.removeEventListener('usageUpdated', handleUsageUpdate);
      usageSubscription.unsubscribe();
    };
  };

  const checkUsageAlerts = () => {
    const alerts: string[] = [];
    const usagePercentage = getUsagePercentage('accounts');

    if (usagePercentage >= 90) {
      alerts.push('Account limit reached!');
      // Trigger conversion prompt for limit reached
      if (currentPlan?.plan_type === 'free') {
        handleShowConversionCenter({
          feature: 'accounts',
          currentUsage: Math.round((usagePercentage / 100) * (currentPlan?.monthly_limit || 1)),
          limit: currentPlan?.monthly_limit || 1,
          percentage: usagePercentage,
          premiumFeatures: ['Unlimited accounts', 'Advanced analytics', 'Team collaboration'],
          potentialValue: '300% follower growth'
        });
      }
    } else if (usagePercentage >= 70) {
      alerts.push('Approaching account limit');
      // Trigger subtle upgrade prompt for approaching limit
      if (currentPlan?.plan_type === 'free' && Math.random() > 0.7) { // 30% chance to show
        setShowConversionWidget(true);
      }
    }

    if (currentPlan?.plan_type === 'free' && usagePercentage >= 50) {
      alerts.push('Consider upgrading for more features');
    }

    // Trigger conversion prompts based on engagement patterns
    if (currentPlan?.plan_type === 'free' && userStats.followers > 1000 && userStats.followers < 10000) {
      // High engagement users are good conversion candidates
      if (Math.random() > 0.8) { // 20% chance
        handleShowConversionCenter({
          feature: 'engagement',
          currentUsage: 1,
          limit: 1,
          percentage: 100,
          engagement: 4.2, // Mock engagement rate
          followers: userStats.followers,
          timeSpent: '2 hours',
          milestone: 'high_engagement'
        });
      }
    }

    setUsageAlerts(alerts);
  };

  const checkOnboardingStatus = async () => {
    // onboarding.data is automatically loaded by useOnboarding hook
    // No need to manually trigger - graceful defaults are provided
  };

  const tabs = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: TrendingUp,
      description: 'Quick metrics summary',
      color: 'from-blue-500 to-purple-600'
    },
    { 
      id: 'advanced', 
      name: 'Advanced Analytics', 
      icon: BarChart3,
      description: 'In-depth insights',
      color: 'from-purple-500 to-pink-600'
    },
    { 
      id: 'charts', 
      name: 'Data Visualization', 
      icon: PieChart,
      description: 'Charts & trend analysis',
      color: 'from-indigo-500 to-purple-600'
    },
    { 
      id: 'content', 
      name: 'Content Management', 
      icon: Calendar,
      description: 'Plan & schedule posts',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      id: 'research', 
      name: 'Advanced Research', 
      icon: Search,
      description: 'Competitor & market intel',
      color: 'from-orange-500 to-red-600'
    },
    { 
      id: 'ai-insights', 
      name: 'AI Insights', 
      icon: Sparkles,
      description: 'AI-powered recommendations',
      color: 'from-cyan-500 to-blue-600'
    },
    { 
      id: 'collaboration', 
      name: 'Collaboration', 
      icon: UserCheck,
      description: 'Team & productivity tools',
      color: 'from-teal-500 to-cyan-600'
    },
    { 
      id: 'system', 
      name: 'System', 
      icon: Activity,
      description: 'Platform enhancement & testing',
      color: 'from-purple-500 to-blue-500'
    },
    { 
      id: 'profile', 
      name: 'Profile', 
      icon: User,
      description: 'Manage your profile & subscription',
      color: 'from-pink-500 to-rose-600'
    },
    { 
      id: 'accounts', 
      name: 'Accounts', 
      icon: Users,
      description: 'Manage your accounts',
      color: 'from-indigo-500 to-blue-600'
    },
    { 
      id: 'data-formatting', 
      name: 'Data Formatting', 
      icon: BarChart3,
      description: 'Format validation & demo',
      color: 'from-emerald-500 to-teal-600'
    },
  ] as const;

  const handleAccountSelect = (accountId: string | null) => {
    setSelectedAccount(accountId);
    // If we have an account and we're on overview/advanced tab, switch to accounts tab to show the accounts
    if ((activeTab === 'overview' || activeTab === 'advanced') && accountId === null) {
      setActiveTab('accounts');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Personalized Welcome Header */}
            <WelcomeHeader 
              userProfile={profileData} 
              userStats={userStats}
            />
            
            {/* Personalized Insights */}
            <PersonalizedInsights 
              accountType={userStats.accountType}
              followerCount={userStats.followers}
            />
            
            {/* Next Steps Panel */}
            <NextSteps
              onActionComplete={(actionId) => {
                handleOnboardingStepComplete(actionId);
              }}
              onUpgradePrompt={handleUpgradePrompt}
              className="mb-6"
              maxActions={4}
            />
            
            {/* Regular Analytics */}
            <BasicAnalytics selectedAccount={selectedAccount} />
            
            {/* Contextual CTAs */}
            {onboarding.data && onboarding.data.progress.progressPercentage < 100 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 sm:p-6 border border-purple-200 dark:border-purple-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      🚀 Continue Your Setup
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                      Complete your onboarding to unlock all features and get the most out of GrowthHub
                    </p>
                  </div>
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
                  >
                    Continue Setup
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case 'advanced':
        return <AdvancedAnalyticsDashboard selectedAccount={selectedAccount} />;
      case 'charts':
        return <AnalyticsCharts selectedAccount={selectedAccount} />;
      case 'content':
        return <ContentManagement selectedAccount={selectedAccount} />;
      case 'research':
        return (
          <div className="space-y-6">
            <AdvancedResearch selectedAccount={selectedAccount} />
            
            {/* Feature Discovery */}
            <FeatureDiscovery
              userLevel="active"
              discoveredFeatures={guidedTour.visitedElements ? Array.from(guidedTour.visitedElements) : []}
              onFeatureDiscover={handleFeatureDiscover}
              onFeatureExplore={handleFeatureExplore}
              maxFeatures={6}
            />
          </div>
        );
      case 'ai-insights':
        return <AIInsights selectedAccount={selectedAccount} />;
      case 'collaboration':
        return <CollaborationDashboard selectedAccount={selectedAccount} />;
      case 'system':
        return <SystemDashboard />;
      case 'profile':
        return (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <UserProfileCard 
              profileData={profileData}
              instagramHandle={user?.email?.split('@')[0]}
              onProfileUpdate={handleProfileUpdate}
            />
            <BrandingTheme 
              currentTheme={personalizationPrefs.theme}
              onThemeChange={handleThemeChange}
              userPreferences={personalizationPrefs}
            />
          </div>
        );
      case 'accounts':
        return <AccountManagement 
          selectedAccount={selectedAccount} 
          onSelectAccount={handleAccountSelect} 
        />;
      case 'data-formatting':
        return <DataFormattingDemo />;
      default:
        return (
          <div className="space-y-6">
            <WelcomeHeader 
              userProfile={profileData} 
              userStats={userStats}
            />
            <PersonalizedInsights 
              accountType={userStats.accountType}
              followerCount={userStats.followers}
            />
            <BasicAnalytics selectedAccount={selectedAccount} />
          </div>
        );
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  const handleUpgrade = () => {
    setActiveTab('profile');
    setShowUpgradeModal(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Show guided tour after a short delay
    setTimeout(() => setShowGuidedTour(true), 500);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  const handleGuidedTourComplete = () => {
    setShowGuidedTour(false);
  };

  const handleGuidedTourSkip = () => {
    setShowGuidedTour(false);
  };

  const handleStartGuidedTour = () => {
    setShowGuidedTour(true);
  };

  // Welcome Choice Modal handlers
  const handleWelcomeChoiceTour = () => {
    setShowWelcomeChoice(false);
    setShowGuidedTour(true);
  };

  const handleWelcomeChoiceExplore = () => {
    setShowWelcomeChoice(false);
    // Track that user chose to explore instead of tour
    localStorage.setItem('user_chose_explore', 'true');
  };

  const handleWelcomeChoiceSkip = () => {
    setShowWelcomeChoice(false);
    localStorage.setItem('tour_dismissed_permanently', 'true');
  };

  // New onboarding handlers
  const handleOnboardingStepComplete = async (stepId: string, data?: any) => {
    await onboarding.updateStep(stepId, true, data);
    if (onboardingStep < 6) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      await onboarding.completeOnboarding();
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < 6) {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  const handleOnboardingPrevious = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  // New guided tour handlers
  const handleGuidedTourStepComplete = async (stepId: string) => {
    await guidedTour.completeStep(stepId);
  };

  const handleFeatureDiscover = async (featureId: string) => {
    await guidedTour.trackFeatureAdoption(featureId);
  };

  const handleFeatureExplore = (featureId: string) => {
    // Navigate to appropriate feature
    switch (featureId) {
      case 'ai_insights':
        setActiveTab('ai-insights');
        break;
      case 'competitor_analysis':
        setActiveTab('research');
        break;
      case 'content_calendar':
        setActiveTab('content');
        break;
      case 'team_collaboration':
        setActiveTab('collaboration');
        break;
      default:
        setActiveTab('advanced');
    }
  };

  const handleUpgradePrompt = () => {
    setShowUpgradeModal(true);
  };

  // Conversion optimization handlers
  const handleConversionUpgrade = (planType: 'pro' | 'enterprise' = 'pro') => {
    console.log(`Converting user to ${planType} plan`);
    // Here you would typically call your upgrade/subscription API
    setShowConversionCenter(false);
    setShowConversionWidget(false);
    // Refresh subscription data after upgrade
    refreshUsage();
  };

  const handleShowConversionCenter = (context?: any) => {
    if (context) {
      setConversionContext(context);
    } else {
      // Generate context based on current user state
      setConversionContext({
        plan: currentPlan?.plan_type || 'free',
        usage: getUsagePercentage('accounts'),
        limit: currentPlan?.monthly_limit || 1,
        engagement: userStats.followers > 0 ? 4.2 : 0, // Mock engagement rate
        followers: userStats.followers,
        timeSpent: '2 hours' // Mock time spent
      });
    }
    setShowConversionCenter(true);
  };

  const handleShowConversionWidget = () => {
    setShowConversionWidget(true);
  };

  const handleHideConversionWidget = () => {
    setShowConversionWidget(false);
  };

  const handleProfileUpdate = async (newData: Partial<ProfileData>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('manage-profile', {
        body: { 
          action: 'update',
          profile: newData
        }
      });

      if (error) throw error;

      setProfileData(prev => ({ ...prev, ...newData }));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setProfileError(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const handleThemeChange = (theme: string) => {
    updatePreferences({ theme });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Help Tooltips */}
      {showHelpTooltips && <ErrorBoundary><HelpTooltips enabled={true} /></ErrorBoundary>}
      
      {/* Welcome Choice Modal */}
      <WelcomeChoiceModal
        isVisible={showWelcomeChoice}
        onTakeTour={handleWelcomeChoiceTour}
        onExploreSelf={handleWelcomeChoiceExplore}
        onSkip={handleWelcomeChoiceSkip}
        userProgress={onboarding.data?.progress.progressPercentage || 0}
        estimatedTourTime={3}
      />
      
      {/* Non-Blocking Tooltip Tour */}
      {showGuidedTour && (
        <ErrorBoundary>
          <TooltipTour
            steps={[
              {
                id: 'welcome',
                title: 'Welcome to GrowthHub!',
                description: "Let's take a quick tour of your Instagram analytics dashboard. You can skip or dismiss this tour at any time.",
                targetSelector: '[data-tour="sidebar"]',
                position: 'right',
                estimatedTime: 30
              },
              {
                id: 'overview',
                title: 'Overview Dashboard',
                description: 'Your home base with key metrics, follower growth, and engagement trends at a glance.',
                targetSelector: '[data-tour="overview"]',
                position: 'right',
                estimatedTime: 45
              },
              {
                id: 'accounts',
                title: 'Account Management',
                description: 'Manage all your Instagram accounts here. Add, edit, or remove accounts to track.',
                targetSelector: '[data-tour="accounts"]',
                position: 'right',
                estimatedTime: 40
              },
              {
                id: 'advanced',
                title: 'Advanced Analytics',
                description: 'Deep dive into detailed analytics with custom filters and date ranges.',
                targetSelector: '[data-tour="advanced"]',
                position: 'right',
                estimatedTime: 50
              },
              {
                id: 'ai-insights',
                title: 'AI-Powered Insights',
                description: 'Get intelligent recommendations and performance predictions powered by AI.',
                targetSelector: '[data-tour="ai-insights"]',
                position: 'right',
                estimatedTime: 45
              }
            ]}
            isVisible={showGuidedTour}
            onComplete={() => {
              setShowGuidedTour(false);
              localStorage.setItem('tour_completed', 'true');
            }}
            onSkip={() => {
              setShowGuidedTour(false);
              localStorage.setItem('tour_dismissed', 'true');
            }}
            onDismiss={() => {
              setShowGuidedTour(false);
              localStorage.setItem('tour_dismissed', 'true');
            }}
            enableDismiss={true}
            enableSkip={true}
          />
        </ErrorBoundary>
      )}
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 
          w-80 sm:w-80 md:w-72 lg:w-64 xl:w-64
          bg-white dark:bg-gray-800 shadow-xl 
          transform transition-transform duration-300 ease-in-out 
          lg:relative lg:transform-none lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${personalizationPrefs.compactSidebar ? 'lg:w-48' : 'lg:w-64'}
        `}>
        {/* Logo */}
        <div className="flex items-center justify-center h-16 sm:h-16 lg:h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Instagram className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">GrowthHub</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Instagram Analytics</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 sm:p-5 lg:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <HoverableCard
              className="relative w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
              hoverScale={false}
              padding="none"
            >
              {profileLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {(profileData.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
              )}
              {usageAlerts.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse">
                  <AlertCircle className="w-2.5 h-2.5 text-white m-0.5" />
                </div>
              )}
            </HoverableCard>
            <div className="flex-1 min-w-0">
              {profileLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
              ) : profileError ? (
                <HoverableCard
                  className="p-2 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
                  onClick={() => loadProfileData()}
                >
                  <div className="text-xs text-red-500">
                    <p className="font-medium truncate">{user?.email}</p>
                    <p className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Failed to load profile
                    </p>
                  </div>
                </HoverableCard>
              ) : (
                <>
                  <HoverableCard
                    className="transition-all duration-300"
                    onClick={() => {/* Profile click handler */}}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {profileData.full_name || user?.email}
                    </p>
                    {profileData.company && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <IconWrapper icon={Building} size="xs" color="muted" />
                        {profileData.company}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      {subscriptionLoading ? (
                        <LoadingSpinner size="xs" color="gray" text="Loading plan..." textPosition="right" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {currentPlan ? 
                              (currentPlan.plan_type === 'free' ? 'Free Plan' : currentPlan.plan_name) 
                              : 'No Plan'
                            }
                          </p>
                          {currentPlan && currentPlan.plan_type !== 'free' && !subscriptionLoading && (
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      )}
                    </div>
                  </HoverableCard>
                </>
              )}
              {usageAlerts.length > 0 && !profileLoading && (
                <HoverableCard
                  className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700"
                  onClick={() => setShowUpgradeModal(true)}
                >
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {usageAlerts[0]}
                  </p>
                </HoverableCard>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Main Navigation - Scrollable */}
          <div className="flex-1 p-3 sm:p-4 lg:p-4 space-y-1.5 sm:space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <div
                  key={tab.id}
                  data-tour={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Close sidebar on mobile after selection
                    if (window.innerWidth < 1024) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 sm:px-4 py-3 sm:py-3 min-h-[48px] rounded-xl text-left touch-manipulation',
                    'transition-all duration-300 ease-out transform-gpu will-change-transform',
                    'hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]',
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg ring-2 ring-white/20`
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
                    isActive && 'animate-pulse-glow'
                  )}
                >
                  <IconWrapper
                    icon={Icon}
                    color={isActive ? 'white' : 'neutral'}
                    size="md"
                    animated
                    className={cn(
                      'transition-all duration-300 flex-shrink-0',
                      isActive ? 'text-white' : 'group-hover:text-primary-500'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'font-medium transition-colors duration-300 text-sm sm:text-base',
                        isActive ? 'text-white' : 'text-gray-900 dark:text-white'
                      )}>
                        {tab.name}
                      </div>
                      
                      {/* Progress Indicator for Onboarding */}
                      {onboarding.data && onboarding.data.progress.progressPercentage < 100 && tab.id === 'accounts' && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse flex-shrink-0"></div>
                      )}
                      
                      {/* Achievement Badge */}
                      {guidedTour.data && guidedTour.data.progress.completedSteps.includes(tab.id) && (
                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    
                    <div className={cn(
                      'text-xs mt-0.5 transition-all duration-300 hidden sm:block',
                      isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {tab.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse animation-delay-75"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Expanded Functionality Section - Fixed at bottom */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            {/* Export & Share Section */}
            <div className="p-3 sm:p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <Download className="h-3 w-3" />
                Export & Share
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors touch-manipulation"
                >
                  <Download className="h-3 w-3" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={() => setShowLinkShare(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors touch-manipulation"
                >
                  <Share2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
            
            {/* Settings Section */}
            <div className="p-3 sm:p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                <Settings className="h-3 w-3" />
                Settings
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setShowPersonalizationPanel(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-medium transition-colors touch-manipulation"
                >
                  <Palette className="h-3 w-3" />
                  Theme & Appearance
                </button>
                <button
                  onClick={() => setShowFeatureDiscovery(!showFeatureDiscovery)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors touch-manipulation',
                    showFeatureDiscovery
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Sparkles className="h-3 w-3" />
                  {showFeatureDiscovery ? 'Hide' : 'Show'} Features
                </button>
                <button
                  onClick={() => setShowHelpTooltips(!showHelpTooltips)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors touch-manipulation',
                    showHelpTooltips
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <HelpCircle className="h-3 w-3" />
                  {showHelpTooltips ? 'Hide' : 'Show'} Help
                </button>
              </div>
            </div>
            
            {/* Status Section */}
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <SubscriptionStatus onUpgradeClick={() => handleShowConversionCenter()} />
              </div>
            </div>
          </div>
        </nav>

        {/* Compact Usage Limits */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
          <UsageLimits showFullDetails={false} />
          {usageAlerts.length > 0 && (
            <div className="mt-3 flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium truncate">
                {usageAlerts[0]}
              </span>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-xs bg-yellow-600 text-white px-2 py-1 rounded font-semibold hover:bg-yellow-700 transition-colors flex-shrink-0"
              >
                Upgrade
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
          <HoverableCard
            className="w-full border-0 shadow-none bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl min-h-[48px] touch-manipulation"
            onClick={signOut}
          >
            <div className="flex items-center gap-3">
              <IconWrapper 
                icon={LogOut} 
                size="md" 
                color="error" 
                animated
                className="transition-transform duration-300 hover:scale-110"
              />
              <span className="font-medium text-gray-600 dark:text-gray-400 text-sm sm:text-base">Sign Out</span>
            </div>
          </HoverableCard>
        </div>
      </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header - Cleaned Up */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center h-16 sm:h-16 lg:h-16 px-3 sm:px-6 lg:px-8">
            {/* Left Section - Sidebar Toggle & Title */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 sm:p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation flex-shrink-0"
                aria-label="Toggle sidebar"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    {currentTab?.name}
                  </h2>
                  {!profileLoading && !profileError && profileData.full_name && (
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:inline whitespace-nowrap">
                      • {profileData.full_name.split(' ')[0]}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block truncate">
                  {currentTab?.description}
                </p>
              </div>
            </div>

            {/* Right Section - Essential Actions Only */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-4">
              {/* Core Action Buttons - Essential Only */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Onboarding Progress Indicator */}
                {onboarding.data && onboarding.data.progress.progressPercentage < 100 && (
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg transition-all min-h-[44px] touch-manipulation flex-shrink-0"
                    title="Complete your onboarding"
                  >
                    <Target className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">
                      {onboarding.data.progress.progressPercentage}%
                    </span>
                    <span className="sm:hidden whitespace-nowrap">Setup</span>
                  </button>
                )}
                
                {/* AI Insights Panel Toggle - Enhanced */}
                <button
                  onClick={() => setIsAIInsightsPanelOpen(!isAIInsightsPanelOpen)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[44px] touch-manipulation flex-shrink-0 ${
                    isAIInsightsPanelOpen
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={isAIInsightsPanelOpen ? 'Hide AI Insights' : 'Show AI Insights'}
                >
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">Insights</span>
                </button>
                
                {/* Help Menu - Simplified */}
                <button
                  onClick={() => setShowGuidedTour(true)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                  title="Help & Tutorial"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>


            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 w-full overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className={`p-3 sm:p-4 lg:p-6 xl:p-8 transition-all duration-300 ${isAIInsightsPanelOpen ? 'pr-0 lg:pr-6' : ''}`}>
            <div className="w-full max-w-7xl mx-auto">
              <div 
                key={activeTab}
                className="animate-slide-up"
                style={{
                  animation: 'slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <HoverableCard
                  className="transition-all duration-300"
                  subtleShadow
                  hoverShadow
                  padding="lg"
                >
                  <div className="w-full">
                    {renderTabContent()}
                  </div>
                </HoverableCard>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Personalization Panel */}
      {showPersonalizationPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Personalization Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customize your experience
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPersonalizationPanel(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                aria-label="Close personalization panel"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <BrandingTheme 
                currentTheme={personalizationPrefs.theme}
                onThemeChange={handleThemeChange}
                userPreferences={personalizationPrefs}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isVisible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        reason={showUpgradePrompt ? 'limit_reached' : 'feature_locked'}
        currentPlan={currentPlan?.plan_type}
      />

      {/* Conversion Center Modal */}
      {showConversionCenter && conversionContext && (
        <ConversionCenter
          userContext={conversionContext}
          onUpgrade={handleConversionUpgrade}
          onClose={() => setShowConversionCenter(false)}
        />
      )}

      {/* Export & Share Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={{
          accounts: accounts,
          selectedAccount: selectedAccount,
          activeTab: activeTab
        }}
      />

      {/* PDF Report Generator */}
      <PDFReportGenerator
        isOpen={showPDFGenerator}
        onClose={() => setShowPDFGenerator(false)}
        data={{
          accounts: accounts,
          analyticsData: {
            followers: userStats.followers,
            engagementRate: 4.2,
            reach: 250000,
            likes: 12500,
            comments: 890,
            growth: {
              followers: 15.3,
              engagement: 8.7,
              reach: 22.1,
              likes: 18.4,
              comments: 12.9
            },
            period: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              end: new Date()
            }
          },
          charts: [
            { id: 'follower-growth', elementId: 'follower-growth', title: 'Follower Growth' },
            { id: 'engagement-trend', elementId: 'engagement-trend', title: 'Engagement Trend' },
            { id: 'content-type', elementId: 'content-type', title: 'Content Performance' }
          ],
          userProfile: {
            full_name: profileData.full_name,
            company: profileData.company
          }
        }}
      />

      {/* Email Share Modal */}
      <EmailShare
        isOpen={showEmailShare}
        onClose={() => setShowEmailShare(false)}
        reportData={{
          title: 'Instagram Analytics Report',
          analyticsData: {
            followers: userStats.followers,
            engagementRate: 4.2,
            reach: 250000,
            growth: { followers: 15.3 }
          },
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
          },
          shareableLink: exportHook.generateShareLink('report-123', '30d')
        }}
      />

      {/* Social Share Modal */}
      <SocialShare
        isOpen={showSocialShare}
        onClose={() => setShowSocialShare(false)}
        reportData={{
          title: 'Instagram Analytics Report',
          analyticsData: {
            followers: userStats.followers,
            engagementRate: 4.2,
            reach: 250000,
            growth: { followers: 15.3 }
          },
          shareableLink: exportHook.generateShareLink('report-123', '30d'),
          hashtags: ['#InstagramAnalytics', '#SocialMedia', '#Growth']
        }}
      />

      {/* Link Share Modal */}
      <LinkShare
        isOpen={showLinkShare}
        onClose={() => setShowLinkShare(false)}
        reportData={{
          title: 'Instagram Analytics Report',
          reportId: 'report-123',
          analyticsData: {
            followers: userStats.followers,
            engagementRate: 4.2
          }
        }}
      />

      {/* QR Code Generator */}
      <QRCodeGenerator
        isOpen={showQRGenerator}
        onClose={() => setShowQRGenerator(false)}
        url={exportHook.generateShareLink('report-123', '30d')}
        title="Instagram Analytics Report"
        onGenerate={(qrDataUrl) => {
          console.log('QR Code generated:', qrDataUrl);
        }}
      />

      {/* AI Insights Panel */}
      <AIInsightsPanel
        isOpen={isAIInsightsPanelOpen}
        onToggle={() => setIsAIInsightsPanelOpen(!isAIInsightsPanelOpen)}
      />

      {/* Conversion Widget - Show for free users */}
      {currentPlan?.plan_type === 'free' && showConversionWidget && conversionContext && (
        <ConversionWidget 
          context={conversionContext}
          position="bottom-right"
        />
      )}
    </div>

      <style jsx global>{`
        /* Mobile-first responsive design improvements */
        @media (max-width: 768px) {
          .dashboard-sidebar {
            width: 100vw;
            max-width: 320px;
          }
          
          .touch-manipulation {
            touch-action: manipulation;
          }
          
          /* Ensure minimum 44px touch targets on mobile */
          .mobile-touch-target {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Improve button spacing on mobile */
          .mobile-button-group {
            gap: 0.5rem;
          }
          
          /* Better modal positioning on mobile */
          .mobile-modal {
            margin: 0.5rem;
            max-height: calc(100vh - 2rem);
          }
        }
        
        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .hover\\:scale-\\[1\\.02\\]:hover {
            transform: none;
          }
          
          .hover\\:scale-\\[1\\.02\\]:active {
            transform: scale(0.98);
          }
        }
        
        /* Smooth animations */
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        /* Responsive text scaling */
        .responsive-text {
          font-size: clamp(0.875rem, 2.5vw, 1rem);
        }
        
        /* Mobile-specific spacing */
        .mobile-spacing {
          padding: clamp(0.75rem, 4vw, 1.5rem);
        }
        
        /* Safe area handling for devices with notches */
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }
        
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}