/**
 * A/B Testing Framework Example Implementation
 * Complete example showing how to use the A/B testing framework
 */

import React, { useState, useEffect } from 'react';
import {
  useABTesting,
  useUserABTests,
  useExperiment,
  useExperimentFilters,
  useExperimentCreator
} from './hooks';
import {
  ExperimentList,
  ExperimentCreator,
  ExperimentResultsDashboard,
  UserAssignmentManager,
  ExperimentExport
} from './components';
import { ABTestConfigManager } from './config';
import { 
  Experiment, 
  User, 
  ExperimentVariant,
  ExperimentEvent 
} from './types';

// ============================================================================
// MAIN A/B TESTING DASHBOARD COMPONENT
// ============================================================================

/**
 * Complete A/B Testing Dashboard
 * Main component that ties everything together
 */
export const ABTestingDashboard: React.FC = () => {
  const [currentUser] = useState<User>({
    id: 'user_123',
    email: 'user@example.com',
    properties: {
      plan: 'free',
      country: 'US',
      device: 'desktop'
    },
    createdAt: new Date()
  });

  const [view, setView] = useState<'list' | 'create' | 'results' | 'user-assignments'>('list');
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);

  const {
    experiments,
    activeExperiments,
    isLoading,
    error,
    createExperiment,
    updateExperiment,
    deleteExperiment
  } = useABTesting();

  const { variants } = useUserABTests(currentUser?.id || null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const configManager = ABTestConfigManager.getInstance();
    
    // Load experiments from config manager
    const savedExperiments = configManager.getAllExperimentConfigs();
    console.log('Loaded experiments:', savedExperiments);
  };

  const handleCreateExperiment = async (experimentData: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const configManager = ABTestConfigManager.getInstance();
      const experiment = await configManager.saveExperimentConfig(experimentData);
      
      // Update the state
      createExperiment(experimentData);
      
      setView('list');
      setSelectedExperimentId(experiment.id);
    } catch (error) {
      console.error('Failed to create experiment:', error);
    }
  };

  const handleEditExperiment = (experiment: Experiment) => {
    setSelectedExperimentId(experiment.id);
    // In a real implementation, you'd open an edit modal or navigate to edit page
    console.log('Edit experiment:', experiment);
  };

  const handleViewResults = (experimentId: string) => {
    setSelectedExperimentId(experimentId);
    setView('results');
  };

  const renderNavigation = () => (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">A/B Testing Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('user-assignments')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            My Assignments ({variants.length})
          </button>
          
          <button
            onClick={() => setView('list')}
            className={`px-3 py-2 rounded text-sm ${
              view === 'list' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Experiments
          </button>
          
          <button
            onClick={() => setView('create')}
            className={`px-3 py-2 rounded text-sm ${
              view === 'create' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Create New
          </button>
          
          {selectedExperimentId && (
            <button
              onClick={() => setView('results')}
              className={`px-3 py-2 rounded text-sm ${
                view === 'results' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              View Results
            </button>
          )}
        </div>
      </div>
    </nav>
  );

  const renderContent = () => {
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      );
    }

    switch (view) {
      case 'create':
        return (
          <ExperimentCreator
            onCreate={handleCreateExperiment}
            onCancel={() => setView('list')}
          />
        );

      case 'results':
        if (!selectedExperimentId) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500">No experiment selected</p>
              <button
                onClick={() => setView('list')}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                View Experiments
              </button>
            </div>
          );
        }
        return (
          <ExperimentResultsDashboard 
            experimentId={selectedExperimentId}
            className="max-w-7xl mx-auto"
          />
        );

      case 'user-assignments':
        return (
          <div className="max-w-4xl mx-auto">
            <UserAssignmentManager userId={currentUser.id} />
          </div>
        );

      default:
        return (
          <ExperimentList
            onCreateExperiment={() => setView('create')}
            onEditExperiment={handleEditExperiment}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      
      <main className="p-6">
        {renderContent()}
      </main>
    </div>
  );
};

// ============================================================================
// SIMPLE INTEGRATION EXAMPLE
// ============================================================================

/**
 * Simple hook for adding A/B testing to any React component
 */
export function useSimpleABTest(
  experimentName: string,
  variants: { name: string; component: React.ComponentType }[],
  userId?: string
) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const { assignUserToExperiment, getUserAssignment } = useABTesting();

  useEffect(() => {
    const setupExperiment = async () => {
      // This is a simplified version - in reality you'd have a more robust system
      const experimentId = `simple_${experimentName.toLowerCase().replace(/\s+/g, '_')}`;
      
      if (userId) {
        const assignment = getUserAssignment(userId, experimentId);
        if (assignment) {
          // Convert variantId to index (simplified)
          const variantIndex = parseInt(assignment.variantId.split('_').pop() || '0') % variants.length;
          setSelectedVariant(variantIndex);
        } else {
          // Assign user to random variant
          const randomVariant = Math.floor(Math.random() * variants.length);
          setSelectedVariant(randomVariant);
        }
      }
    };

    setupExperiment();
  }, [experimentName, userId, variants.length, getUserAssignment]);

  const trackEvent = async (eventName: string, value?: number) => {
    if (userId) {
      const experimentId = `simple_${experimentName.toLowerCase().replace(/\s+/g, '_')}`;
      const variantId = `variant_${selectedVariant}`;
      
      // Track the event (simplified)
      console.log('Track event:', {
        experimentId,
        variantId,
        userId,
        eventName,
        value
      });
    }
  };

  const VariantComponent = variants[selectedVariant]?.component;

  return {
    VariantComponent,
    variantIndex: selectedVariant,
    variantName: variants[selectedVariant]?.name || 'Unknown',
    trackEvent,
    selectedVariant
  };
}

// ============================================================================
// EXAMPLE COMPONENTS USING A/B TESTING
// ============================================================================

/**
 * Example: A/B testing a button color
 */
export const ButtonColorTest: React.FC<{ userId: string }> = ({ userId }) => {
  const { VariantComponent, trackEvent } = useSimpleABTest(
    'button_color_test',
    [
      { name: 'blue_button', component: BlueButton },
      { name: 'green_button', component: GreenButton },
      { name: 'red_button', component: RedButton }
    ],
    userId
  );

  const handleClick = async () => {
    await trackEvent('button_click');
  };

  return (
    <div className="text-center py-8">
      <VariantComponent onClick={handleClick}>
        Try our new feature!
      </VariantComponent>
    </div>
  );
};

const BlueButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button 
    {...props}
    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
  >
    {children}
  </button>
);

const GreenButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button 
    {...props}
    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
  >
    {children}
  </button>
);

const RedButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button 
    {...props}
    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
  >
    {children}
  </button>
);

/**
 * Example: A/B testing a landing page hero
 */
export const HeroTest: React.FC<{ userId: string }> = ({ userId }) => {
  const { VariantComponent, trackEvent } = useSimpleABTest(
    'hero_message_test',
    [
      { name: 'value_proposition', component: ValuePropositionHero },
      { name: 'social_proof', component: SocialProofHero },
      { name: 'urgency', component: UrgencyHero }
    ],
    userId
  );

  useEffect(() => {
    trackEvent('hero_impression');
  }, []);

  const handleCTAClick = async () => {
    await trackEvent('cta_click');
  };

  return (
    <VariantComponent onCTAClick={handleCTAClick} />
  );
};

const ValuePropositionHero: React.FC<{ onCTAClick: () => void }> = ({ onCTAClick }) => (
  <div className="bg-blue-600 text-white py-16 text-center">
    <h1 className="text-4xl font-bold mb-4">Grow Your Instagram 10x Faster</h1>
    <p className="text-xl mb-8">AI-powered analytics and insights to boost your engagement</p>
    <button onClick={onCTAClick} className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold">
      Start Free Trial
    </button>
  </div>
);

const SocialProofHero: React.FC<{ onCTAClick: () => void }> = ({ onCTAClick }) => (
  <div className="bg-purple-600 text-white py-16 text-center">
    <h1 className="text-4xl font-bold mb-4">Join 50,000+ Creators</h1>
    <p className="text-xl mb-4">Trusted by top influencers and brands worldwide</p>
    <p className="text-lg mb-8">"This tool increased my engagement by 300%" - @topcreator</p>
    <button onClick={onCTAClick} className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold">
      Get Started Now
    </button>
  </div>
);

const UrgencyHero: React.FC<{ onCTAClick: () => void }> = ({ onCTAClick }) => (
  <div className="bg-red-600 text-white py-16 text-center">
    <h1 className="text-4xl font-bold mb-4">Limited Time: 50% Off</h1>
    <p className="text-xl mb-4">Transform your Instagram in just 7 days</p>
    <p className="text-lg mb-8">Offer expires in 24 hours</p>
    <button onClick={onCTAClick} className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold">
      Claim Discount Now
    </button>
  </div>
);

// ============================================================================
// INTEGRATION GUIDE COMPONENTS
// ============================================================================

/**
 * Integration example for a real Instagram Analytics Platform
 */
export const InstagramAnalyticsIntegration: React.FC<{ userId: string }> = ({ userId }) => {
  const [dashboardVariant, setDashboardVariant] = useState(0);
  const { variants } = useUserABTests(userId);

  useEffect(() => {
    // Load user's A/B test assignments
    const assignment = variants.find(v => 
      v.experiment.name.includes('dashboard_layout')
    );
    
    if (assignment) {
      setDashboardVariant(
        assignment.variant?.name === 'grid_layout' ? 1 : 
        assignment.variant?.name === 'compact_layout' ? 2 : 0
      );
    }
  }, [variants]);

  const renderDashboard = () => {
    switch (dashboardVariant) {
      case 1: return <GridDashboard />;
      case 2: return <CompactDashboard />;
      default: return <ListDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDashboard()}
    </div>
  );
};

const ListDashboard: React.FC = () => (
  <div className="p-6">
    <div className="space-y-4">
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Followers</h3>
        <p className="text-2xl">1,234</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Engagement Rate</h3>
        <p className="text-2xl">4.2%</p>
      </div>
    </div>
  </div>
);

const GridDashboard: React.FC = () => (
  <div className="p-6 grid grid-cols-2 gap-4">
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold">Followers</h3>
      <p className="text-3xl">1,234</p>
    </div>
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold">Engagement Rate</h3>
      <p className="text-3xl">4.2%</p>
    </div>
    <div className="bg-white p-4 rounded shadow col-span-2">
      <h3 className="font-semibold">Recent Posts</h3>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="bg-gray-200 h-20 rounded"></div>
        <div className="bg-gray-200 h-20 rounded"></div>
        <div className="bg-gray-200 h-20 rounded"></div>
      </div>
    </div>
  </div>
);

const CompactDashboard: React.FC = () => (
  <div className="p-6">
    <div className="grid grid-cols-4 gap-2">
      <div className="bg-white p-3 rounded text-center">
        <p className="text-sm text-gray-600">Followers</p>
        <p className="text-xl font-bold">1.2K</p>
      </div>
      <div className="bg-white p-3 rounded text-center">
        <p className="text-sm text-gray-600">Engagement</p>
        <p className="text-xl font-bold">4.2%</p>
      </div>
      <div className="bg-white p-3 rounded text-center">
        <p className="text-sm text-gray-600">Posts</p>
        <p className="text-xl font-bold">127</p>
      </div>
      <div className="bg-white p-3 rounded text-center">
        <p className="text-sm text-gray-600">Growth</p>
        <p className="text-xl font-bold">+12%</p>
      </div>
    </div>
  </div>
);

// ============================================================================
// TESTING AND DEVELOPMENT HELPERS
// ============================================================================

/**
 * Mock data generator for development and testing
 */
export class MockDataGenerator {
  static generateUser(id: string = 'user_' + Math.random().toString(36).substr(2, 9)): User {
    return {
      id,
      email: `${id}@example.com`,
      properties: {
        plan: Math.random() > 0.5 ? 'free' : 'pro',
        country: ['US', 'UK', 'CA', 'AU'][Math.floor(Math.random() * 4)],
        device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)]
      },
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    };
  }

  static generateExperiment(name: string = 'Test Experiment'): Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name,
      description: 'A sample experiment for testing purposes',
      status: 'active',
      variants: [
        {
          id: 'control',
          name: 'Control',
          weight: 50,
          isControl: true,
          description: 'The original version'
        },
        {
          id: 'variant_1',
          name: 'Variant A',
          weight: 50,
          description: 'Test variant with changes'
        }
      ],
      metrics: [
        {
          id: 'primary_metric',
          name: 'Conversion Rate',
          type: 'conversion',
          eventName: 'conversion',
          aggregation: 'percentage',
          isPrimary: true
        }
      ],
      createdBy: 'admin',
      priority: 5,
      tags: ['test', 'development']
    };
  }

  static generateEvents(experimentId: string, variantIds: string[], userCount: number = 100): ExperimentEvent[] {
    const events: ExperimentEvent[] = [];
    
    for (let i = 0; i < userCount; i++) {
      const userId = `user_${i}`;
      const variantId = variantIds[Math.floor(Math.random() * variantIds.length)];
      
      // Generate impression
      events.push({
        id: `evt_${i}_impression`,
        experimentId,
        variantId,
        userId,
        eventName: 'impression',
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });

      // Generate conversion with some probability
      if (Math.random() > 0.7) {
        events.push({
          id: `evt_${i}_conversion`,
          experimentId,
          variantId,
          userId,
          eventName: 'conversion',
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }
    
    return events;
  }
}

/**
 * Development toolbar for testing A/B tests
 */
export const ABTestDevToolbar: React.FC<{ userId: string }> = ({ userId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { variants } = useUserABTests(userId);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700"
      >
        A/B Test Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">A/B Test Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">User ID: {userId}</p>
        <p className="text-sm text-gray-600">Active Experiments: {variants.length}</p>
        
        <div className="max-h-40 overflow-y-auto">
          {variants.map(({ experiment, variant }) => (
            <div key={experiment.id} className="text-xs bg-gray-50 p-2 rounded mb-1">
              <p className="font-medium">{experiment.name}</p>
              <p className="text-gray-600">{variant?.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};