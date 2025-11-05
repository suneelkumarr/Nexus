import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'highlight' | 'click' | 'scroll';
  category: 'basic' | 'advanced' | 'ai' | 'content' | 'collaboration';
  isCompleted: boolean;
  isOptional?: boolean;
  prerequisites?: string[];
  data?: any;
}

interface TourProgress {
  completedSteps: string[];
  currentStep: number;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
  isActive: boolean;
  currentCategory: string;
  progressPercentage: number;
}

interface UserFlowAnalytics {
  dropOffPoints: string[];
  completionRates: Record<string, number>;
  averageTimePerStep: Record<string, number>;
  featureAdoption: Record<string, number>;
  userJourneyPath: string[];
}

interface GuidedTourData {
  progress: TourProgress;
  steps: TourStep[];
  analytics: UserFlowAnalytics;
  personalizedPath: string[];
  recommendations: string[];
}

export function useGuidedTour() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GuidedTourData | null>(null);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [currentStep, setCurrentStep] = useState<TourStep | null>(null);
  const [visitedElements, setVisitedElements] = useState<Set<string>>(new Set());

  const baseSteps: TourStep[] = [
    // Basic Features
    {
      id: 'welcome',
      title: 'Welcome to GrowthHub',
      description: 'Let\'s explore your new Instagram analytics platform. This guided tour will help you get the most out of GrowthHub.',
      category: 'basic',
      isCompleted: false,
      position: 'center'
    },
    {
      id: 'sidebar-navigation',
      title: 'Navigation Sidebar',
      description: 'Your main navigation hub. Click any tab to explore different features. The Overview tab is your starting point.',
      targetSelector: '[data-tour="overview"]',
      position: 'right',
      action: 'highlight',
      category: 'basic',
      isCompleted: false
    },
    {
      id: 'overview-dashboard',
      title: 'Overview Dashboard',
      description: 'Get a quick snapshot of your Instagram performance with key metrics, follower growth, and recent insights.',
      targetSelector: '[data-tour="overview"]',
      position: 'bottom',
      category: 'basic',
      isCompleted: false
    },
    {
      id: 'account-management',
      title: 'Account Management',
      description: 'Manage all your Instagram accounts here. Add new accounts, view connection status, and configure settings.',
      targetSelector: '[data-tour="accounts"]',
      position: 'right',
      category: 'basic',
      isCompleted: false,
      prerequisites: ['sidebar-navigation']
    },
    {
      id: 'profile-settings',
      title: 'Profile & Settings',
      description: 'Update your profile, manage subscription, and customize your GrowthHub experience.',
      targetSelector: '[data-tour="profile"]',
      position: 'right',
      category: 'basic',
      isCompleted: false,
      prerequisites: ['sidebar-navigation']
    },
    
    // Advanced Analytics
    {
      id: 'advanced-analytics',
      title: 'Advanced Analytics',
      description: 'Deep dive into detailed analytics with custom filters, date ranges, and powerful visualization tools.',
      targetSelector: '[data-tour="advanced"]',
      position: 'right',
      category: 'advanced',
      isCompleted: false,
      prerequisites: ['overview-dashboard']
    },
    {
      id: 'data-visualization',
      title: 'Data Visualization',
      description: 'Interactive charts and graphs to understand your Instagram performance trends and patterns.',
      targetSelector: '[data-tour="charts"]',
      position: 'right',
      category: 'advanced',
      isCompleted: false,
      prerequisites: ['advanced-analytics']
    },
    
    // AI Insights
    {
      id: 'ai-insights-intro',
      title: 'AI-Powered Insights',
      description: 'Leverage artificial intelligence to get personalized recommendations, content suggestions, and performance predictions.',
      targetSelector: '[data-tour="ai-insights"]',
      position: 'right',
      category: 'ai',
      isCompleted: false,
      prerequisites: ['overview-dashboard']
    },
    
    // Content Management
    {
      id: 'content-management',
      title: 'Content Management',
      description: 'Plan, schedule, and optimize your Instagram content. Use our tools to maintain consistency and maximize engagement.',
      targetSelector: '[data-tour="content"]',
      position: 'right',
      category: 'content',
      isCompleted: false,
      prerequisites: ['overview-dashboard']
    },
    
    // Market Research
    {
      id: 'market-research',
      title: 'Market Research',
      description: 'Analyze competitors, discover trending content, and find growth opportunities in your niche.',
      targetSelector: '[data-tour="research"]',
      position: 'right',
      category: 'content',
      isCompleted: false,
      prerequisites: ['advanced-analytics']
    },
    
    // Collaboration
    {
      id: 'team-collaboration',
      title: 'Team Collaboration',
      description: 'Work with your team, share insights, and manage permissions across your organization.',
      targetSelector: '[data-tour="collaboration"]',
      position: 'right',
      category: 'collaboration',
      isCompleted: false,
      prerequisites: ['advanced-analytics']
    },
    
    // Completion
    {
      id: 'tour-complete',
      title: 'Tour Complete!',
      description: 'Congratulations! You now know the basics of GrowthHub. Explore more features and start growing your Instagram presence.',
      category: 'basic',
      isCompleted: false,
      position: 'center'
    }
  ];

  const calculateProgress = (steps: TourStep[]): TourProgress => {
    const completedSteps = steps.filter(step => step.isCompleted).map(step => step.id);
    const totalSteps = steps.length;
    const currentStepIndex = steps.findIndex(step => !step.isCompleted);
    const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : totalSteps + 1;
    
    return {
      completedSteps,
      currentStep,
      totalSteps,
      startedAt: new Date().toISOString(),
      isActive: !steps.every(step => step.isCompleted),
      currentCategory: steps[currentStepIndex]?.category || 'basic',
      progressPercentage: Math.round((completedSteps.length / totalSteps) * 100)
    };
  };

  const getPersonalizedPath = (userType: string, goals: string[]): string[] => {
    // Simple personalization logic based on user goals
    const path: string[] = [];
    
    // Always include basic steps
    path.push('welcome', 'sidebar-navigation', 'overview-dashboard');
    
    if (goals.includes('growth')) {
      path.push('advanced-analytics', 'ai-insights-intro', 'content-management');
    }
    
    if (goals.includes('analytics')) {
      path.push('advanced-analytics', 'data-visualization', 'market-research');
    }
    
    if (goals.includes('team')) {
      path.push('team-collaboration');
    }
    
    path.push('tour-complete');
    return [...new Set(path)]; // Remove duplicates
  };

  const loadGuidedTourData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: tourData, error } = await supabase.functions.invoke('manage-guided-tour', {
        body: { action: 'get' }
      });

      if (error) {
        console.error('Error loading guided tour data:', error);
        // Initialize with default data
        const progress = calculateProgress(baseSteps);
        const personalizedPath = getPersonalizedPath('new_user', ['growth']);
        setData({
          progress,
          steps: baseSteps,
          analytics: {
            dropOffPoints: [],
            completionRates: {},
            averageTimePerStep: {},
            featureAdoption: {},
            userJourneyPath: []
          },
          personalizedPath,
          recommendations: [
            'Start by connecting your Instagram account',
            'Explore your dashboard overview',
            'Check out AI-powered insights'
          ]
        });
        return;
      }

      if (tourData?.data) {
        const steps = tourData.data.steps || baseSteps;
        const progress = calculateProgress(steps);
        setData({
          progress,
          steps,
          analytics: tourData.data.analytics || {
            dropOffPoints: [],
            completionRates: {},
            averageTimePerStep: {},
            featureAdoption: {},
            userJourneyPath: []
          },
          personalizedPath: tourData.data.personalizedPath || getPersonalizedPath('new_user', ['growth']),
          recommendations: tourData.data.recommendations || []
        });
      } else {
        // Initialize with default data
        const progress = calculateProgress(baseSteps);
        const personalizedPath = getPersonalizedPath('new_user', ['growth']);
        setData({
          progress,
          steps: baseSteps,
          analytics: {
            dropOffPoints: [],
            completionRates: {},
            averageTimePerStep: {},
            featureAdoption: {},
            userJourneyPath: []
          },
          personalizedPath,
          recommendations: [
            'Start by connecting your Instagram account',
            'Explore your dashboard overview',
            'Check out AI-powered insights'
          ]
        });
      }
    } catch (err: any) {
      console.error('Error loading guided tour:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (stepId: string, timeSpent?: number) => {
    if (!user || !data) return;

    try {
      setLoading(true);

      const updatedSteps = data.steps.map(step =>
        step.id === stepId ? { ...step, isCompleted: true } : step
      );

      const progress = calculateProgress(updatedSteps);
      const updatedAnalytics = {
        ...data.analytics,
        userJourneyPath: [...data.analytics.userJourneyPath, stepId],
        averageTimePerStep: {
          ...data.analytics.averageTimePerStep,
          [stepId]: timeSpent || data.analytics.averageTimePerStep[stepId] || 0
        }
      };

      setData(prev => prev ? {
        ...prev,
        steps: updatedSteps,
        progress,
        analytics: updatedAnalytics
      } : null);

      // Update visited elements
      setVisitedElements(prev => new Set([...prev, stepId]));

      await supabase.functions.invoke('manage-guided-tour', {
        body: {
          action: 'completeStep',
          stepId,
          timeSpent,
          data: {
            progress,
            steps: updatedSteps,
            analytics: updatedAnalytics
          }
        }
      });

    } catch (err: any) {
      console.error('Error completing step:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStepData = async (stepId: string, stepData: any) => {
    if (!user || !data) return;

    try {
      const updatedSteps = data.steps.map(step =>
        step.id === stepId ? { ...step, data: { ...step.data, ...stepData } } : step
      );

      setData(prev => prev ? { ...prev, steps: updatedSteps } : null);

      await supabase.functions.invoke('manage-guided-tour', {
        body: {
          action: 'updateStep',
          stepId,
          stepData,
          steps: updatedSteps
        }
      });
    } catch (err: any) {
      console.error('Error updating step data:', err);
      setError(err.message);
    }
  };

  const resetTour = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const resetSteps = baseSteps.map(step => ({ ...step, isCompleted: false }));
      const progress = calculateProgress(resetSteps);

      setData(prev => prev ? {
        ...prev,
        steps: resetSteps,
        progress,
        analytics: {
          dropOffPoints: [],
          completionRates: {},
          averageTimePerStep: {},
          featureAdoption: {},
          userJourneyPath: []
        }
      } : null);

      setVisitedElements(new Set());

      await supabase.functions.invoke('manage-guided-tour', {
        body: { action: 'reset' }
      });

      setShowGuidedTour(false);
    } catch (err: any) {
      console.error('Error resetting tour:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const trackFeatureAdoption = async (feature: string) => {
    if (!user || !data) return;

    try {
      const updatedAnalytics = {
        ...data.analytics,
        featureAdoption: {
          ...data.analytics.featureAdoption,
          [feature]: (data.analytics.featureAdoption[feature] || 0) + 1
        }
      };

      setData(prev => prev ? { ...prev, analytics: updatedAnalytics } : null);

      await supabase.functions.invoke('manage-guided-tour', {
        body: {
          action: 'trackFeatureAdoption',
          feature,
          analytics: updatedAnalytics
        }
      });
    } catch (err: any) {
      console.error('Error tracking feature adoption:', err);
    }
  };

  const getNextRecommendedStep = useCallback((): TourStep | null => {
    if (!data) return null;

    const availableSteps = data.steps.filter(step => 
      !step.isCompleted && 
      (!step.prerequisites || step.prerequisites.every(prereq => 
        data.steps.find(s => s.id === prereq)?.isCompleted
      ))
    );

    // Sort by category priority and prerequisites
    const categoryPriority = ['basic', 'advanced', 'ai', 'content', 'collaboration'];
    const sortedSteps = availableSteps.sort((a, b) => {
      const aPriority = categoryPriority.indexOf(a.category);
      const bPriority = categoryPriority.indexOf(b.category);
      if (aPriority !== bPriority) return aPriority - bPriority;
      return (a.prerequisites?.length || 0) - (b.prerequisites?.length || 0);
    });

    return sortedSteps[0] || null;
  }, [data]);

  const isStepAccessible = (stepId: string): boolean => {
    if (!data) return false;
    
    const step = data.steps.find(s => s.id === stepId);
    if (!step) return false;
    
    return !step.prerequisites || step.prerequisites.every(prereq => 
      data.steps.find(s => s.id === prereq)?.isCompleted
    );
  };

  const getStepsByCategory = (category: string): TourStep[] => {
    if (!data) return [];
    return data.steps.filter(step => step.category === category && !step.isCompleted);
  };

  useEffect(() => {
    if (user) {
      loadGuidedTourData();
    }
  }, [user]);

  useEffect(() => {
    if (data && showGuidedTour) {
      const nextStep = getNextRecommendedStep();
      setCurrentStep(nextStep);
    }
  }, [data, showGuidedTour, getNextRecommendedStep]);

  return {
    data,
    loading,
    error,
    showGuidedTour,
    setShowGuidedTour,
    currentStep,
    visitedElements,
    completeStep,
    updateStepData,
    resetTour,
    trackFeatureAdoption,
    getNextRecommendedStep,
    isStepAccessible,
    getStepsByCategory,
    refresh: loadGuidedTourData
  };
}