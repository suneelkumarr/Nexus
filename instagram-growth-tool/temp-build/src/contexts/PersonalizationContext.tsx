import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

// Personalization State
interface PersonalizationState {
  userJourney: {
    onboardingCompleted: boolean;
    tutorialStep: number;
    guidedTourCompleted: boolean;
    featureDiscoveries: string[];
  };
  behavioralInsights: {
    mostUsedFeature: string;
    timeSpentPerFeature: Record<string, number>;
    preferredPostingTimes: string[];
    contentTypePreferences: string[];
  };
  context: {
    currentSession: {
      startTime: Date;
      featuresUsed: string[];
      timeSpent: number;
    };
    previousSessions: Array<{
      date: Date;
      duration: number;
      featuresUsed: string[];
      goalsAchieved: string[];
    }>;
  };
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      weekly: boolean;
      achievements: boolean;
    };
    accessibility: {
      highContrast: boolean;
      reducedMotion: boolean;
      fontSize: 'small' | 'medium' | 'large';
    };
  };
}

// Action types
type PersonalizationAction =
  | { type: 'SET_ONBOARDING_COMPLETED'; payload: boolean }
  | { type: 'SET_TUTORIAL_STEP'; payload: number }
  | { type: 'ADD_FEATURE_DISCOVERY'; payload: string }
  | { type: 'SET_MOST_USED_FEATURE'; payload: string }
  | { type: 'UPDATE_TIME_SPENT'; payload: { feature: string; time: number } }
  | { type: 'SET_PREFERRED_POSTING_TIMES'; payload: string[] }
  | { type: 'SET_CONTENT_PREFERENCES'; payload: string[] }
  | { type: 'START_SESSION' }
  | { type: 'END_SESSION'; payload: { goalsAchieved?: string[] } }
  | { type: 'ADD_FEATURE_USAGE'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<PersonalizationState['preferences']> }
  | { type: 'LOAD_STATE'; payload: PersonalizationState };

// Initial state
const initialState: PersonalizationState = {
  userJourney: {
    onboardingCompleted: false,
    tutorialStep: 0,
    guidedTourCompleted: false,
    featureDiscoveries: []
  },
  behavioralInsights: {
    mostUsedFeature: '',
    timeSpentPerFeature: {},
    preferredPostingTimes: [],
    contentTypePreferences: []
  },
  context: {
    currentSession: {
      startTime: new Date(),
      featuresUsed: [],
      timeSpent: 0
    },
    previousSessions: []
  },
  preferences: {
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notifications: {
      email: true,
      push: true,
      weekly: true,
      achievements: true
    },
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium'
    }
  }
};

// Reducer
function personalizationReducer(state: PersonalizationState, action: PersonalizationAction): PersonalizationState {
  switch (action.type) {
    case 'SET_ONBOARDING_COMPLETED':
      return {
        ...state,
        userJourney: {
          ...state.userJourney,
          onboardingCompleted: action.payload
        }
      };

    case 'SET_TUTORIAL_STEP':
      return {
        ...state,
        userJourney: {
          ...state.userJourney,
          tutorialStep: action.payload
        }
      };

    case 'ADD_FEATURE_DISCOVERY':
      return {
        ...state,
        userJourney: {
          ...state.userJourney,
          featureDiscoveries: [...new Set([...state.userJourney.featureDiscoveries, action.payload])]
        }
      };

    case 'SET_MOST_USED_FEATURE':
      return {
        ...state,
        behavioralInsights: {
          ...state.behavioralInsights,
          mostUsedFeature: action.payload
        }
      };

    case 'UPDATE_TIME_SPENT':
      return {
        ...state,
        behavioralInsights: {
          ...state.behavioralInsights,
          timeSpentPerFeature: {
            ...state.behavioralInsights.timeSpentPerFeature,
            [action.payload.feature]: (state.behavioralInsights.timeSpentPerFeature[action.payload.feature] || 0) + action.payload.time
          }
        }
      };

    case 'SET_PREFERRED_POSTING_TIMES':
      return {
        ...state,
        behavioralInsights: {
          ...state.behavioralInsights,
          preferredPostingTimes: action.payload
        }
      };

    case 'SET_CONTENT_PREFERENCES':
      return {
        ...state,
        behavioralInsights: {
          ...state.behavioralInsights,
          contentTypePreferences: action.payload
        }
      };

    case 'START_SESSION':
      return {
        ...state,
        context: {
          ...state.context,
          currentSession: {
            startTime: new Date(),
            featuresUsed: [],
            timeSpent: 0
          }
        }
      };

    case 'END_SESSION':
      // Defensive programming: ensure startTime is a valid Date object
      const startTime = state.context.currentSession.startTime;
      let sessionDuration = 0;
      
      if (startTime instanceof Date && !isNaN(startTime.getTime())) {
        sessionDuration = Date.now() - startTime.getTime();
      } else {
        console.warn('Invalid startTime in session, using current time as fallback');
        sessionDuration = 0;
      }
      const newSession = {
        date: new Date(),
        duration: sessionDuration,
        featuresUsed: state.context.currentSession.featuresUsed,
        goalsAchieved: action.payload.goalsAchieved || []
      };

      return {
        ...state,
        context: {
          previousSessions: [...state.context.previousSessions.slice(-9), newSession],
          currentSession: {
            startTime: new Date(),
            featuresUsed: [],
            timeSpent: 0
          }
        }
      };

    case 'ADD_FEATURE_USAGE':
      return {
        ...state,
        context: {
          ...state.context,
          currentSession: {
            ...state.context.currentSession,
            featuresUsed: [...new Set([...state.context.currentSession.featuresUsed, action.payload])]
          }
        }
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };

    case 'LOAD_STATE':
      // Ensure Date objects are properly restored from JSON
      const loadedState = { ...action.payload };
      
      // Fix currentSession startTime
      if (loadedState.context?.currentSession?.startTime) {
        if (typeof loadedState.context.currentSession.startTime === 'string') {
          loadedState.context.currentSession.startTime = new Date(loadedState.context.currentSession.startTime);
        }
      }
      
      // Fix previousSessions dates
      if (loadedState.context?.previousSessions) {
        loadedState.context.previousSessions = loadedState.context.previousSessions.map((session: any) => ({
          ...session,
          date: typeof session.date === 'string' ? new Date(session.date) : session.date
        }));
      }
      
      return loadedState;

    default:
      return state;
  }
}

// Context
interface PersonalizationContextType {
  state: PersonalizationState;
  dispatch: React.Dispatch<PersonalizationAction>;
  saveState: () => Promise<void>;
  loadState: () => Promise<void>;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

// Provider component
export function PersonalizationContextProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(personalizationReducer, initialState);

  // Load state from localStorage and database
  const loadState = async () => {
    if (!user) return;

    try {
      // Try to load from database first
      const { data, error } = await supabase
        .from('user_personalization_state')
        .select('state')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        dispatch({ type: 'LOAD_STATE', payload: data.state });
        return;
      }

      // Fallback to localStorage with proper Date deserialization
      const localState = localStorage.getItem(`personalization_state_${user.id}`);
      if (localState) {
        try {
          const parsed = deserializeState(localState);
          dispatch({ type: 'LOAD_STATE', payload: parsed });
        } catch (error) {
          console.error('Error parsing local storage state:', error);
          // Fallback to default state if parsing fails
        }
      }
    } catch (error) {
      console.error('Error loading personalization state:', error);
    }
  };

  // Custom JSON serialization for Date objects
  const serializeState = (state: PersonalizationState) => {
    return JSON.stringify(state, (key, value) => {
      if (value instanceof Date) {
        return {
          __type: 'Date',
          value: value.getTime()
        };
      }
      return value;
    });
  };

  const deserializeState = (jsonString: string): PersonalizationState => {
    return JSON.parse(jsonString, (key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
  };

  // Save state to localStorage and database
  const saveState = async () => {
    if (!user) return;

    try {
      // Save to database
      await supabase
        .from('user_personalization_state')
        .upsert({
          user_id: user.id,
          state,
          updated_at: new Date().toISOString()
        });

      // Save to localStorage as backup with proper Date serialization
      localStorage.setItem(`personalization_state_${user.id}`, serializeState(state));
    } catch (error) {
      console.error('Error saving personalization state:', error);
      // Fallback to localStorage only
      localStorage.setItem(`personalization_state_${user.id}`, serializeState(state));
    }
  };

  // Load state on mount and user change
  useEffect(() => {
    if (user) {
      loadState();
      dispatch({ type: 'START_SESSION' });
    }
  }, [user]);

  // Auto-save state changes
  useEffect(() => {
    if (user && Object.keys(state).length > 0) {
      const timeoutId = setTimeout(saveState, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [state, user]);

  // Save state when user leaves
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user) {
        dispatch({ type: 'END_SESSION', payload: {} });
        saveState();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      dispatch({ type: 'END_SESSION', payload: {} });
    };
  }, [user]);

  const contextValue: PersonalizationContextType = {
    state,
    dispatch,
    saveState,
    loadState
  };

  return (
    <PersonalizationContext.Provider value={contextValue}>
      {children}
    </PersonalizationContext.Provider>
  );
}

// Hook to use the context
export function usePersonalizationContext() {
  const context = useContext(PersonalizationContext);
  if (context === undefined) {
    throw new Error('usePersonalizationContext must be used within a PersonalizationContextProvider');
  }
  return context;
}

// Helper hooks
export function useUserJourney() {
  const { state, dispatch } = usePersonalizationContext();
  return {
    onboardingCompleted: state.userJourney.onboardingCompleted,
    tutorialStep: state.userJourney.tutorialStep,
    guidedTourCompleted: state.userJourney.guidedTourCompleted,
    featureDiscoveries: state.userJourney.featureDiscoveries,
    setOnboardingCompleted: (completed: boolean) => dispatch({ type: 'SET_ONBOARDING_COMPLETED', payload: completed }),
    setTutorialStep: (step: number) => dispatch({ type: 'SET_TUTORIAL_STEP', payload: step }),
    addFeatureDiscovery: (feature: string) => dispatch({ type: 'ADD_FEATURE_DISCOVERY', payload: feature })
  };
}

export function useBehavioralInsights() {
  const { state, dispatch } = usePersonalizationContext();
  return {
    mostUsedFeature: state.behavioralInsights.mostUsedFeature,
    timeSpentPerFeature: state.behavioralInsights.timeSpentPerFeature,
    preferredPostingTimes: state.behavioralInsights.preferredPostingTimes,
    contentTypePreferences: state.behavioralInsights.contentTypePreferences,
    setMostUsedFeature: (feature: string) => dispatch({ type: 'SET_MOST_USED_FEATURE', payload: feature }),
    updateTimeSpent: (feature: string, time: number) => dispatch({ type: 'UPDATE_TIME_SPENT', payload: { feature, time } }),
    setPreferredPostingTimes: (times: string[]) => dispatch({ type: 'SET_PREFERRED_POSTING_TIMES', payload: times }),
    setContentPreferences: (preferences: string[]) => dispatch({ type: 'SET_CONTENT_PREFERENCES', payload: preferences })
  };
}

export function useSessionContext() {
  const { state, dispatch } = usePersonalizationContext();
  return {
    currentSession: state.context.currentSession,
    previousSessions: state.context.previousSessions,
    addFeatureUsage: (feature: string) => dispatch({ type: 'ADD_FEATURE_USAGE', payload: feature }),
    endSession: (goalsAchieved?: string[]) => dispatch({ type: 'END_SESSION', payload: { goalsAchieved } })
  };
}