/**
 * A/B Testing React Hooks
 * Custom hooks for A/B testing functionality
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Experiment,
  ExperimentVariant,
  User,
  UserAssignment,
  ExperimentEvent,
  ExperimentResults,
  ExperimentOverride,
  ExperimentProgress,
  ExperimentFilter,
  ExperimentSorting
} from './types';
import {
  assignVariant,
  isExperimentActive,
  analyzeExperimentResults,
  validateExperiment,
  generateExperimentId,
  generateEventId
} from './utils';

// ============================================================================
// CORE A/B TESTING HOOKS
// ============================================================================

/**
 * Main hook for A/B testing functionality
 */
export function useABTesting() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [userAssignments, setUserAssignments] = useState<UserAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeExperiments = useMemo(() => 
    experiments.filter(isExperimentActive), 
    [experiments]
  );

  // Create new experiment
  const createExperiment = useCallback(async (experimentData: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const newExperiment: Experiment = {
        ...experimentData,
        id: generateExperimentId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validationErrors = validateExperiment(newExperiment);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      setExperiments(prev => [...prev, newExperiment]);
      return newExperiment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create experiment';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update experiment
  const updateExperiment = useCallback(async (id: string, updates: Partial<Experiment>) => {
    setIsLoading(true);
    try {
      setExperiments(prev => prev.map(exp => 
        exp.id === id 
          ? { ...exp, ...updates, updatedAt: new Date() }
          : exp
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update experiment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete experiment
  const deleteExperiment = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      setExperiments(prev => prev.filter(exp => exp.id !== id));
      setUserAssignments(prev => prev.filter(assignment => assignment.experimentId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete experiment');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get experiment by ID
  const getExperiment = useCallback((id: string) => {
    return experiments.find(exp => exp.id === id) || null;
  }, [experiments]);

  // Assign user to experiment
  const assignUserToExperiment = useCallback(async (
    user: User, 
    experimentId: string, 
    override?: ExperimentOverride
  ): Promise<UserAssignment | null> => {
    const experiment = getExperiment(experimentId);
    if (!experiment || !isExperimentActive(experiment)) {
      return null;
    }

    // Check for override
    if (override?.variantId && override?.experimentId === experimentId) {
      const assignment: UserAssignment = {
        userId: user.id,
        experimentId,
        variantId: override.variantId,
        assignedAt: new Date(),
        trafficBucket: 0,
        shouldReassign: false
      };
      setUserAssignments(prev => {
        const existing = prev.find(a => a.userId === user.id && a.experimentId === experimentId);
        if (existing) {
          return prev.map(a => a.userId === user.id && a.experimentId === experimentId ? assignment : a);
        }
        return [...prev, assignment];
      });
      return assignment;
    }

    const variant = assignVariant(user.id, experimentId, experiment.variants);
    if (!variant) return null;

    const assignment: UserAssignment = {
      userId: user.id,
      experimentId,
      variantId: variant.id,
      assignedAt: new Date(),
      trafficBucket: 0, // Would be calculated in real implementation
      shouldReassign: false
    };

    setUserAssignments(prev => {
      const existing = prev.find(a => a.userId === user.id && a.experimentId === experimentId);
      if (existing) {
        return prev.map(a => a.userId === user.id && a.experimentId === experimentId ? assignment : a);
      }
      return [...prev, assignment];
    });

    return assignment;
  }, [experiments, getExperiment]);

  // Track experiment event
  const trackEvent = useCallback(async (
    experimentId: string,
    variantId: string,
    userId: string,
    eventName: string,
    eventValue?: number,
    eventData?: Record<string, any>
  ): Promise<ExperimentEvent> => {
    const event: ExperimentEvent = {
      id: generateEventId(),
      experimentId,
      variantId,
      userId,
      eventName,
      eventValue,
      eventData,
      timestamp: new Date()
    };

    // In a real implementation, this would send to analytics service
    console.log('A/B Test Event:', event);
    
    return event;
  }, []);

  // Get user assignment for experiment
  const getUserAssignment = useCallback((userId: string, experimentId: string) => {
    return userAssignments.find(a => a.userId === userId && a.experimentId === experimentId) || null;
  }, [userAssignments]);

  // Get user's current variants for all active experiments
  const getUserVariants = useCallback((userId: string) => {
    return activeExperiments.map(experiment => {
      const assignment = getUserAssignment(userId, experiment.id);
      return {
        experiment,
        variant: experiment.variants.find(v => v.id === assignment?.variantId) || null,
        assignment
      };
    }).filter(result => result.variant !== null);
  }, [activeExperiments, getUserAssignment]);

  return {
    experiments,
    activeExperiments,
    userAssignments,
    isLoading,
    error,
    createExperiment,
    updateExperiment,
    deleteExperiment,
    getExperiment,
    assignUserToExperiment,
    getUserAssignment,
    getUserVariants,
    trackEvent,
    clearError: () => setError(null)
  };
}

/**
 * Hook for managing a specific experiment
 */
export function useExperiment(experimentId: string) {
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [events, setEvents] = useState<ExperimentEvent[]>([]);
  const [results, setResults] = useState<ExperimentResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ExperimentProgress | null>(null);

  // Load experiment data
  useEffect(() => {
    if (experimentId) {
      loadExperiment();
      loadEvents();
    }
  }, [experimentId]);

  const loadExperiment = useCallback(async () => {
    setIsLoading(true);
    try {
      // In real implementation, fetch from API
      // For now, we'll simulate with mock data
      console.log('Loading experiment:', experimentId);
    } catch (err) {
      console.error('Failed to load experiment:', err);
    } finally {
      setIsLoading(false);
    }
  }, [experimentId]);

  const loadEvents = useCallback(async () => {
    try {
      // In real implementation, fetch from analytics service
      console.log('Loading events for experiment:', experimentId);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  }, [experimentId]);

  const analyzeResults = useCallback((controlVariantId?: string) => {
    if (!experiment || events.length === 0) return;

    const analysis = analyzeExperimentResults(
      experiment.id,
      events,
      controlVariantId || experiment.variants.find(v => v.isControl)?.id || experiment.variants[0].id
    );

    setResults(analysis);
    return analysis;
  }, [experiment, events]);

  const addEvent = useCallback((event: Omit<ExperimentEvent, 'id' | 'experimentId' | 'timestamp'>) => {
    const newEvent: ExperimentEvent = {
      ...event,
      id: generateEventId(),
      experimentId,
      timestamp: new Date()
    };

    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, [experimentId]);

  const updateProgress = useCallback(() => {
    if (!experiment) return;

    const variantCounts = events.reduce((counts, event) => {
      if (!counts[event.variantId]) {
        counts[event.variantId] = new Set();
      }
      counts[event.variantId].add(event.userId);
      return counts;
    }, {} as Record<string, Set<string>>);

    const usersPerVariant = Object.entries(variantCounts).reduce((result, [variantId, users]) => {
      result[variantId] = users.size;
      return result;
    }, {} as Record<string, number>);

    const progress: ExperimentProgress = {
      experimentId,
      status: isExperimentActive(experiment) ? 'running' : 'paused',
      totalUsers: Object.values(usersPerVariant).reduce((sum, count) => sum + count, 0),
      usersPerVariant,
      eventsPerMetric: {},
      statisticalPower: 0.8, // Would be calculated based on actual data
      confidenceInterval: {}
    };

    setProgress(progress);
    return progress;
  }, [experiment, events]);

  return {
    experiment,
    events,
    results,
    progress,
    isLoading,
    addEvent,
    analyzeResults,
    updateProgress,
    loadExperiment,
    loadEvents
  };
}

/**
 * Hook for getting user's A/B test assignments
 */
export function useUserABTests(userId: string | null) {
  const [assignments, setAssignments] = useState<UserAssignment[]>([]);
  const [variants, setVariants] = useState<Array<{
    experiment: Experiment;
    variant: ExperimentVariant | null;
    assignment: UserAssignment | null;
  }>>>([]);

  const { activeExperiments, getUserAssignment } = useABTesting();

  // Update assignments when experiments change
  useEffect(() => {
    if (!userId) return;

    const userAssignments = activeExperiments
      .map(experiment => {
        const assignment = getUserAssignment(userId, experiment.id);
        const variant = assignment 
          ? experiment.variants.find(v => v.id === assignment.variantId) 
          : null;

        return {
          experiment,
          variant,
          assignment
        };
      })
      .filter(result => result.variant !== null);

    setVariants(userAssignments);
    setAssignments(userAssignments.map(v => v.assignment!).filter(Boolean));
  }, [userId, activeExperiments, getUserAssignment]);

  const getVariantForExperiment = useCallback((experimentId: string) => {
    return variants.find(v => v.experiment.id === experimentId)?.variant || null;
  }, [variants]);

  const hasAssignment = useCallback((experimentId: string) => {
    return variants.some(v => v.experiment.id === experimentId);
  }, [variants]);

  return {
    assignments,
    variants,
    getVariantForExperiment,
    hasAssignment
  };
}

// ============================================================================
// FILTERING AND SORTING HOOKS
// ============================================================================

/**
 * Hook for filtering and sorting experiments
 */
export function useExperimentFilters() {
  const [filters, setFilters] = useState<ExperimentFilter>({});
  const [sorting, setSorting] = useState<ExperimentSorting>({
    field: 'updatedAt',
    direction: 'desc'
  });

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [filteredExperiments, setFilteredExperiments] = useState<Experiment[]>([]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ExperimentFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Update sorting
  const updateSorting = useCallback((newSorting: Partial<ExperimentSorting>) => {
    setSorting(prev => ({ ...prev, ...newSorting }));
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...experiments];

    // Apply filters
    if (filters.status?.length) {
      filtered = filtered.filter(exp => filters.status!.includes(exp.status));
    }

    if (filters.createdBy?.length) {
      filtered = filtered.filter(exp => filters.createdBy!.includes(exp.createdBy));
    }

    if (filters.tags?.length) {
      filtered = filtered.filter(exp => 
        exp.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    if (filters.dateRange) {
      filtered = filtered.filter(exp => {
        const expDate = exp.createdAt;
        return expDate >= filters.dateRange!.start && expDate <= filters.dateRange!.end;
      });
    }

    if (filters.priority) {
      filtered = filtered.filter(exp => {
        if (filters.priority!.min !== undefined && exp.priority! < filters.priority!.min) {
          return false;
        }
        if (filters.priority!.max !== undefined && exp.priority! > filters.priority!.max) {
          return false;
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sorting.field];
      const bValue = b[sorting.field];
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return sorting.direction === 'desc' ? -comparison : comparison;
    });

    setFilteredExperiments(filtered);
  }, [experiments, filters, sorting]);

  return {
    filters,
    sorting,
    experiments: filteredExperiments,
    allExperiments: experiments,
    updateFilters,
    updateSorting,
    setExperiments
  };
}

// ============================================================================
// EXPERIMENT CREATION HOOK
// ============================================================================

/**
 * Hook for creating new experiments
 */
export function useExperimentCreator() {
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<Partial<Experiment>>({
    name: '',
    description: '',
    status: 'draft',
    variants: [],
    metrics: [],
    tags: [],
    priority: 5
  });

  const updateDraft = useCallback((updates: Partial<Experiment>) => {
    setDraft(prev => ({ ...prev, ...updates }));
  }, []);

  const addVariant = useCallback((variant: Omit<ExperimentVariant, 'id'>) => {
    const newVariant: ExperimentVariant = {
      ...variant,
      id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setDraft(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));

    return newVariant;
  }, []);

  const removeVariant = useCallback((variantId: string) => {
    setDraft(prev => ({
      ...prev,
      variants: prev.variants?.filter(v => v.id !== variantId) || []
    }));
  }, []);

  const addMetric = useCallback((metric: Omit<Experiment['metrics'][0], 'id'>) => {
    const newMetric = {
      ...metric,
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setDraft(prev => ({
      ...prev,
      metrics: [...(prev.metrics || []), newMetric]
    }));

    return newMetric;
  }, []);

  const removeMetric = useCallback((metricId: string) => {
    setDraft(prev => ({
      ...prev,
      metrics: prev.metrics?.filter(m => m.id !== metricId) || []
    }));
  }, []);

  const validateDraft = useCallback(() => {
    return validateExperiment(draft);
  }, [draft]);

  const resetDraft = useCallback(() => {
    setDraft({
      name: '',
      description: '',
      status: 'draft',
      variants: [],
      metrics: [],
      tags: [],
      priority: 5
    });
  }, []);

  return {
    draft,
    isCreating,
    updateDraft,
    addVariant,
    removeVariant,
    addMetric,
    removeMetric,
    validateDraft,
    resetDraft,
    setIsCreating
  };
}