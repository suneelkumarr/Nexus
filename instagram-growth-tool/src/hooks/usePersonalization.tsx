import React, { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserPreferences {
  theme: string;
  layout: 'compact' | 'comfortable' | 'spacious';
  animations: boolean;
  compactSidebar: boolean;
  favoriteMetrics: string[];
  dashboardLayout: any[];
  notificationPreferences: {
    email: boolean;
    push: boolean;
    growthAlerts: boolean;
    weeklyReports: boolean;
  };
  language: string;
  timezone: string;
}

interface UserContext {
  accountType: 'business' | 'personal' | 'creator';
  followerCount: number;
  engagementRate: number;
  accountAge: number;
  industry?: string;
  goals: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface PersonalizationData {
  preferences: UserPreferences;
  userContext: UserContext;
  isLoading: boolean;
  error: string | null;
}

interface PersonalizationContextType extends PersonalizationData {
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  updateUserContext: (updates: Partial<UserContext>) => Promise<void>;
  getTimeBasedGreeting: () => { greeting: string; message: string; icon: string };
  getPersonalizedContent: (type: string) => any;
  getCustomizedMetrics: () => string[];
  getRelevantBenchmarks: () => any;
  getTailoredRecommendations: () => any[];
  resetToDefaults: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  theme: 'classic',
  layout: 'comfortable',
  animations: true,
  compactSidebar: false,
  favoriteMetrics: ['followers', 'engagement', 'reach'],
  dashboardLayout: [],
  notificationPreferences: {
    email: true,
    push: true,
    growthAlerts: true,
    weeklyReports: true
  },
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

const defaultUserContext: UserContext = {
  accountType: 'personal',
  followerCount: 0,
  engagementRate: 0,
  accountAge: 0,
  industry: '',
  goals: [],
  experienceLevel: 'beginner'
};

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [userContext, setUserContext] = useState<UserContext>(defaultUserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load personalization data
  const loadPersonalizationData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Load preferences
      const { data: prefData, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefError && prefError.code !== 'PGRST116') {
        throw prefError;
      }

      if (prefData) {
        setPreferences({ ...defaultPreferences, ...prefData.preferences });
      }

      // Load user context
      const { data: contextData, error: contextError } = await supabase
        .from('user_context')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (contextError && contextError.code !== 'PGRST116') {
        throw contextError;
      }

      if (contextData) {
        setUserContext({ ...defaultUserContext, ...contextData.context });
      }

      // Load Instagram account data if available
      await loadInstagramContext();

    } catch (error: any) {
      console.error('Error loading personalization data:', error);
      setError(error.message || 'Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load Instagram-specific context
  const loadInstagramContext = async () => {
    if (!user) return;

    try {
      const { data: accounts } = await supabase
        .from('instagram_accounts')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setUserContext(prev => ({
          ...prev,
          followerCount: account.followers_count || 0,
          accountType: account.account_type || 'personal',
          accountAge: Math.floor((Date.now() - new Date(account.created_at).getTime()) / (1000 * 60 * 60 * 24)),
          industry: account.category || ''
        }));
      }
    } catch (error) {
      console.error('Error loading Instagram context:', error);
    }
  };

  // Update preferences
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const updatedPreferences = { ...preferences, ...updates };
      setPreferences(updatedPreferences);

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Apply theme changes immediately if theme is updated
      if (updates.theme) {
        applyTheme(updatedPreferences.theme);
      }

    } catch (error: any) {
      console.error('Error updating preferences:', error);
      setError(error.message || 'Failed to update preferences');
    }
  };

  // Update user context
  const updateUserContext = async (updates: Partial<UserContext>) => {
    if (!user) return;

    try {
      const updatedContext = { ...userContext, ...updates };
      setUserContext(updatedContext);

      const { error } = await supabase
        .from('user_context')
        .upsert({
          user_id: user.id,
          context: updatedContext,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

    } catch (error: any) {
      console.error('Error updating user context:', error);
      setError(error.message || 'Failed to update user context');
    }
  };

  // Apply theme
  const applyTheme = (themeName: string) => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove(
      'theme-classic',
      'theme-ocean',
      'theme-sunset',
      'theme-forest',
      'theme-midnight',
      'theme-cosmic'
    );

    // Add new theme class
    root.classList.add(`theme-${themeName}`);
    
    // Apply CSS custom properties for theme colors
    const theme = getThemeColors(themeName);
    Object.entries(theme).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  };

  // Get theme colors
  const getThemeColors = (themeName: string): Record<string, string> => {
    const themes: Record<string, Record<string, string>> = {
      classic: {
        '--color-primary': '#8b5cf6',
        '--color-secondary': '#3b82f6',
        '--color-accent': '#ec4899',
        '--gradient-primary': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
      },
      ocean: {
        '--color-primary': '#3b82f6',
        '--color-secondary': '#06b6d4',
        '--color-accent': '#0891b2',
        '--gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
      },
      sunset: {
        '--color-primary': '#f97316',
        '--color-secondary': '#ef4444',
        '--color-accent': '#eab308',
        '--gradient-primary': 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #ef4444 0%, #eab308 100%)'
      },
      forest: {
        '--color-primary': '#10b981',
        '--color-secondary': '#059669',
        '--color-accent': '#84cc16',
        '--gradient-primary': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #059669 0%, #84cc16 100%)'
      },
      midnight: {
        '--color-primary': '#8b5cf6',
        '--color-secondary': '#6366f1',
        '--color-accent': '#a855f7',
        '--gradient-primary': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
      },
      cosmic: {
        '--color-primary': '#8b5cf6',
        '--color-secondary': '#a855f7',
        '--color-accent': '#c084fc',
        '--gradient-primary': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
        '--gradient-secondary': 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)'
      }
    };

    return themes[themeName] || themes.classic;
  };

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
                     user?.email?.split('@')[0] || 'there';

    if (hour >= 5 && hour < 12) {
      return {
        greeting: `Good morning, ${firstName}!`,
        message: "Ready to grow your Instagram today?",
        icon: "sunrise"
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        greeting: `Good afternoon, ${firstName}!`,
        message: "Let's make your afternoon productive!",
        icon: "sun"
      };
    } else {
      return {
        greeting: `Good evening, ${firstName}!`,
        message: "Time to review your day's performance!",
        icon: "sunset"
      };
    }
  };

  // Get personalized content based on user type
  const getPersonalizedContent = (type: string) => {
    switch (type) {
      case 'insights':
        return getPersonalizedInsights();
      case 'metrics':
        return getCustomizedMetrics();
      case 'benchmarks':
        return getRelevantBenchmarks();
      case 'recommendations':
        return getTailoredRecommendations();
      default:
        return [];
    }
  };

  // Get personalized insights
  const getPersonalizedInsights = () => {
    const insights = [];
    
    if (userContext.accountType === 'business') {
      insights.push({
        category: 'Business Growth',
        content: 'Focus on content that drives conversions and builds brand awareness',
        priority: 'high'
      });
    } else if (userContext.accountType === 'creator') {
      insights.push({
        category: 'Content Strategy',
        content: 'Develop a consistent content style that reflects your unique voice',
        priority: 'high'
      });
    } else {
      insights.push({
        category: 'Personal Brand',
        content: 'Share authentic moments that resonate with your personal story',
        priority: 'medium'
      });
    }

    if (userContext.followerCount < 1000) {
      insights.push({
        category: 'Foundation',
        content: 'Focus on building genuine connections with your community',
        priority: 'high'
      });
    } else if (userContext.followerCount > 10000) {
      insights.push({
        category: 'Scaling',
        content: 'Leverage your established audience for partnerships and collaborations',
        priority: 'medium'
      });
    }

    return insights;
  };

  // Get customized metrics based on account type
  const getCustomizedMetrics = () => {
    const baseMetrics = preferences.favoriteMetrics;
    
    if (userContext.accountType === 'business') {
      return [...baseMetrics, 'reach', 'impressions', 'website_clicks', 'profile_visits'];
    } else if (userContext.accountType === 'creator') {
      return [...baseMetrics, 'story_views', 'shares', 'saves', 'profile_visits'];
    } else {
      return [...baseMetrics, 'story_views', 'comments', 'likes'];
    }
  };

  // Get relevant benchmarks
  const getRelevantBenchmarks = () => {
    const benchmarks = {
      engagement: userContext.accountType === 'business' ? 1.5 : 3.0,
      reach_rate: userContext.accountType === 'business' ? 15 : 25,
      growth_rate: userContext.followerCount < 1000 ? 5 : 2
    };

    if (userContext.followerCount < 1000) {
      benchmarks.engagement = benchmarks.engagement * 1.5;
    } else if (userContext.followerCount > 10000) {
      benchmarks.engagement = benchmarks.engagement * 0.8;
    }

    return benchmarks;
  };

  // Get tailored recommendations
  const getTailoredRecommendations = () => {
    const recommendations = [];

    if (userContext.accountType === 'business') {
      recommendations.push({
        type: 'posting_time',
        title: 'Business Peak Hours',
        description: 'Your audience is most active during weekday mornings',
        action: 'Schedule posts between 9-11 AM on weekdays'
      });
    } else if (userContext.accountType === 'creator') {
      recommendations.push({
        type: 'content_diversity',
        title: 'Content Variety',
        description: 'Mix educational, entertaining, and behind-the-scenes content',
        action: 'Create a content calendar with varied post types'
      });
    }

    if (userContext.experienceLevel === 'beginner') {
      recommendations.push({
        type: 'foundation',
        title: 'Build Your Foundation',
        description: 'Focus on consistent posting and authentic engagement',
        action: 'Post daily and engage with 10 accounts in your niche'
      });
    }

    return recommendations;
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    if (!user) return;

    try {
      setPreferences(defaultPreferences);
      setUserContext(defaultUserContext);

      // Update database
      await Promise.all([
        supabase.from('user_preferences').upsert({
          user_id: user.id,
          preferences: defaultPreferences,
          updated_at: new Date().toISOString()
        }),
        supabase.from('user_context').upsert({
          user_id: user.id,
          context: defaultUserContext,
          updated_at: new Date().toISOString()
        })
      ]);

      // Apply default theme
      applyTheme('classic');

    } catch (error: any) {
      console.error('Error resetting to defaults:', error);
      setError(error.message || 'Failed to reset preferences');
    }
  };

  // Load data on mount and when user changes
  useEffect(() => {
    loadPersonalizationData();
  }, [user, loadPersonalizationData]);

  // Apply current theme on mount
  useEffect(() => {
    if (preferences.theme) {
      applyTheme(preferences.theme);
    }
  }, [preferences.theme]);

  const contextValue: PersonalizationContextType = {
    preferences,
    userContext,
    isLoading,
    error,
    updatePreferences,
    updateUserContext,
    getTimeBasedGreeting,
    getPersonalizedContent,
    getCustomizedMetrics,
    getRelevantBenchmarks,
    getTailoredRecommendations,
    resetToDefaults
  };

  return (
    <PersonalizationContext.Provider value={contextValue}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}

// Utility hooks
export function useTheme() {
  const { preferences } = usePersonalization();
  return {
    theme: preferences.theme,
    isDark: preferences.theme === 'midnight' || preferences.theme === 'cosmic',
    colors: preferences.theme !== 'classic' ? getThemeColors(preferences.theme) : {}
  };
}

export function useUserContext() {
  const { userContext } = usePersonalization();
  return userContext;
}

export function useUserPreferences() {
  const { preferences } = usePersonalization();
  return preferences;
}