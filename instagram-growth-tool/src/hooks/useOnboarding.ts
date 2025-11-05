import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isOptional?: boolean;
  order: number;
  data?: any;
}

interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  startedAt: string;
  completedAt?: string;
  isCompleted: boolean;
  progressPercentage: number;
}

interface OnboardingData {
  progress: OnboardingProgress;
  steps: OnboardingStep[];
  achievements: string[];
  nextActions: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const defaultSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to GrowthHub',
      description: 'Learn about the platform and its capabilities',
      isCompleted: false,
      order: 1,
      isOptional: false
    },
    {
      id: 'profile-setup',
      title: 'Complete Profile',
      description: 'Set up your profile information',
      isCompleted: false,
      order: 2,
      isOptional: false
    },
    {
      id: 'instagram-connect',
      title: 'Connect Instagram Account',
      description: 'Link your first Instagram account',
      isCompleted: false,
      order: 3,
      isOptional: false
    },
    {
      id: 'subscription',
      title: 'Choose Plan',
      description: 'Select your subscription plan',
      isCompleted: false,
      order: 4,
      isOptional: false
    },
    {
      id: 'dashboard-tour',
      title: 'Dashboard Overview',
      description: 'Explore the main dashboard features',
      isCompleted: false,
      order: 5,
      isOptional: true
    },
    {
      id: 'first-insights',
      title: 'View Analytics',
      description: 'Check your first Instagram insights',
      isCompleted: false,
      order: 6,
      isOptional: true
    }
  ];

  const calculateProgress = (steps: OnboardingStep[]): OnboardingProgress => {
    const completedSteps = steps.filter(step => step.isCompleted).map(step => step.id);
    const totalSteps = steps.length;
    const completedStepCount = completedSteps.length;
    const currentStep = steps.find(step => !step.isCompleted)?.order || totalSteps + 1;
    
    return {
      currentStep,
      totalSteps,
      completedSteps,
      startedAt: new Date().toISOString(),
      isCompleted: completedStepCount === totalSteps,
      progressPercentage: Math.round((completedStepCount / totalSteps) * 100)
    };
  };

  const loadOnboardingData = async () => {
    if (!user || isInitialized) return;

    try {
      setLoading(true);
      setError(null);

      // Try to load from localStorage first for immediate response
      const cachedData = localStorage.getItem(`onboarding_${user.id}`);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          setData(parsed);
          setShowOnboarding(!parsed.progress.isCompleted);
        } catch (e) {
          console.warn('Failed to parse cached onboarding data');
        }
      }

      // Load from API in background
      try {
        const { data: onboardingData, error } = await supabase.functions.invoke('manage-onboarding', {
          body: { action: 'get' }
        });

        if (error) {
          console.warn('Onboarding API error (using defaults):', error);
          throw error;
        }

        if (onboardingData?.data) {
          const steps = onboardingData.data.steps || defaultSteps;
          const progress = calculateProgress(steps);
          const newData = {
            progress,
            steps,
            achievements: onboardingData.data.achievements || [],
            nextActions: onboardingData.data.nextActions || []
          };
          setData(newData);
          setShowOnboarding(!progress.isCompleted);
          
          // Cache the data
          localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(newData));
        } else {
          throw new Error('No onboarding data returned');
        }
      } catch (apiError) {
        // Gracefully fall back to defaults if API fails
        console.warn('Using default onboarding (API unavailable)');
        const progress = calculateProgress(defaultSteps);
        const defaultData = {
          progress,
          steps: defaultSteps,
          achievements: [],
          nextActions: ['Complete your profile', 'Connect Instagram account', 'Choose a plan']
        };
        setData(defaultData);
        setShowOnboarding(true);
        
        // Cache defaults
        localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(defaultData));
      }
    } catch (err: any) {
      console.error('Error in onboarding initialization:', err);
      setError(err.message);
      // Fallback to default data even on error
      const progress = calculateProgress(defaultSteps);
      setData({
        progress,
        steps: defaultSteps,
        achievements: [],
        nextActions: ['Complete your profile', 'Connect Instagram account', 'Choose a plan']
      });
      setShowOnboarding(true);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const updateStep = async (stepId: string, isCompleted: boolean, stepData?: any) => {
    if (!user || !data) return;

    try {
      setLoading(true);
      setError(null);

      const updatedSteps = data.steps.map((step: OnboardingStep) =>
        step.id === stepId
          ? { ...step, isCompleted, data: stepData ? { ...step.data, ...stepData } : step.data }
          : step
      );

      const progress = calculateProgress(updatedSteps);
      const achievements = [...(data.achievements || [])];

      // Award achievement for completing specific steps
      if (stepId === 'instagram-connect' && isCompleted && !achievements.includes('first_account')) {
        achievements.push('first_account');
      }
      if (stepId === 'subscription' && isCompleted && !achievements.includes('plan_selected')) {
        achievements.push('plan_selected');
      }
      if (stepId === 'first-insights' && isCompleted && !achievements.includes('first_insights')) {
        achievements.push('first_insights');
      }

      // Calculate next actions
      const nextActions = [];
      if (!updatedSteps.find(s => s.id === 'profile-setup')?.isCompleted) {
        nextActions.push('Complete your profile information');
      }
      if (!updatedSteps.find(s => s.id === 'instagram-connect')?.isCompleted) {
        nextActions.push('Connect your Instagram account');
      }
      if (!updatedSteps.find(s => s.id === 'subscription')?.isCompleted) {
        nextActions.push('Choose a subscription plan');
      }
      if (progress.isCompleted) {
        nextActions.push('Explore advanced features');
      }

      const updatedData = {
        progress,
        steps: updatedSteps,
        achievements,
        nextActions
      };

      setData(updatedData);
      
      // Update localStorage immediately
      localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(updatedData));

      // Update API in background (non-blocking)
      supabase.functions.invoke('manage-onboarding', {
        body: {
          action: 'update',
          data: updatedData
        }
      }).catch(err => {
        console.warn('Failed to sync onboarding to server:', err);
      });

    } catch (err: any) {
      console.error('Error updating step:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user || !data) return;

    try {
      setLoading(true);

      const completedData = {
        ...data,
        progress: {
          ...data.progress,
          isCompleted: true,
          completedAt: new Date().toISOString()
        }
      };

      setData(completedData);

      await supabase.functions.invoke('manage-onboarding', {
        body: {
          action: 'complete',
          data: completedData
        }
      });

      setShowOnboarding(false);
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetOnboarding = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const progress = calculateProgress(defaultSteps);
      setData({
        progress,
        steps: defaultSteps,
        achievements: [],
        nextActions: ['Complete your profile', 'Connect Instagram account', 'Choose a plan']
      });

      await supabase.functions.invoke('manage-onboarding', {
        body: { action: 'reset' }
      });

      setShowOnboarding(true);
    } catch (err: any) {
      console.error('Error resetting onboarding:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStep = (): OnboardingStep | null => {
    if (!data) return null;
    return data.steps.find(step => !step.isCompleted) || null;
  };

  const isStepCompleted = (stepId: string): boolean => {
    if (!data) return false;
    return data.completedSteps?.includes(stepId) || false;
  };

  const getStepById = (stepId: string): OnboardingStep | null => {
    if (!data) return null;
    return data.steps.find(step => step.id === stepId) || null;
  };

  const getAchievements = (): Achievement[] => {
    if (!data) return [];

    const achievementMap = {
      first_account: {
        id: 'first_account',
        title: 'First Connection',
        description: 'Connected your first Instagram account',
        icon: '📱',
        unlockedAt: new Date().toISOString()
      },
      plan_selected: {
        id: 'plan_selected',
        title: 'Plan Selected',
        description: 'Chose a subscription plan',
        icon: '💎',
        unlockedAt: new Date().toISOString()
      },
      first_insights: {
        id: 'first_insights',
        title: 'Data Explorer',
        description: 'Viewed your first analytics insights',
        icon: '📊',
        unlockedAt: new Date().toISOString()
      },
      onboarding_complete: {
        id: 'onboarding_complete',
        title: 'Getting Started',
        description: 'Completed the onboarding process',
        icon: '🎉',
        unlockedAt: new Date().toISOString()
      }
    };

    return data.achievements.map(achievementId => achievementMap[achievementId as keyof typeof achievementMap]).filter(Boolean);
  };

  useEffect(() => {
    if (user) {
      loadOnboardingData();
    }
  }, [user]);

  return {
    data,
    loading,
    error,
    showOnboarding,
    setShowOnboarding,
    updateStep,
    completeOnboarding,
    resetOnboarding,
    getCurrentStep,
    isStepCompleted,
    getStepById,
    getAchievements,
    refresh: loadOnboardingData
  };
}