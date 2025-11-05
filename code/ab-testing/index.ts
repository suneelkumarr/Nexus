/**
 * A/B Testing Framework - Main Export File
 * Central export point for all framework components
 */

// Types and interfaces
export * from './types';

// Core utilities
export * from './utils';

// React hooks
export * from './hooks';

// UI components
export * from './components';
export * from './components-advanced';

// Configuration management
export * from './config';

// Examples and integration patterns
export * from './example';

// Re-export commonly used types for convenience
export type {
  Experiment,
  ExperimentVariant,
  ExperimentResults,
  User,
  UserAssignment,
  ExperimentEvent,
  StatisticalResult,
  ABTestSystemConfig,
  TargetAudience
} from './types';

// Re-export commonly used hooks
export {
  useABTesting,
  useExperiment,
  useUserABTests,
  useSimpleABTest
} from './hooks';

// Re-export commonly used components
export {
  ExperimentList,
  ExperimentCreator,
  ExperimentResultsDashboard,
  UserAssignmentManager,
  ButtonColorTest,
  HeroTest,
  ABTestingDashboard
} from './example';

// Re-export configuration manager
export {
  ABTestConfigManager,
  ConfigValidator,
  useConfigManager,
  useSystemConfig
} from './config';

// Re-export utilities
export {
  assignVariant,
  calculateStatisticalSignificance,
  analyzeExperimentResults,
  validateExperiment,
  isExperimentActive,
  getTrafficAllocation
} from './utils';

// Default configuration for quick setup
export const DEFAULT_AB_TEST_CONFIG = {
  confidenceLevel: 0.95,
  minimumSampleSize: 100,
  defaultDuration: 14, // days
  autoStart: false,
  enableRealTimeTracking: true,
  enableAutomaticAnalysis: true
} as const;

// Quick setup function for new projects
export async function setupABTesting(config?: Partial<typeof DEFAULT_AB_TEST_CONFIG>) {
  const finalConfig = { ...DEFAULT_AB_TEST_CONFIG, ...config };
  const configManager = ABTestConfigManager.getInstance();
  
  await configManager.updateSystemConfig({
    defaultConfidenceLevel: finalConfig.confidenceLevel,
    minimumSampleSize: finalConfig.minimumSampleSize,
    defaultExperimentDuration: finalConfig.defaultDuration,
    autoStartExperiments: finalConfig.autoStart,
    enableRealTimeTracking: finalConfig.enableRealTimeTracking,
    enableAutomaticAnalysis: finalConfig.enableAutomaticAnalysis
  });

  return configManager;
}

// Version information
export const AB_TESTING_FRAMEWORK_VERSION = '1.0.0';
export const FRAMEWORK_INFO = {
  name: 'Instagram Analytics A/B Testing Framework',
  version: AB_TESTING_FRAMEWORK_VERSION,
  description: 'Comprehensive A/B testing framework for SaaS platforms',
  author: 'Instagram Analytics Team',
  license: 'MIT'
} as const;

// Development utilities
export const DevUtils = {
  /**
   * Create a quick test experiment for development
   */
  createTestExperiment: async (name: string = 'Test Experiment') => {
    const configManager = ABTestConfigManager.getInstance();
    
    return await configManager.saveExperimentConfig({
      name,
      description: 'Development test experiment',
      status: 'active',
      variants: [
        {
          id: 'control',
          name: 'Control',
          weight: 50,
          isControl: true,
          description: 'Control variant'
        },
        {
          id: 'variant_a',
          name: 'Variant A',
          weight: 50,
          description: 'Test variant'
        }
      ],
      metrics: [
        {
          id: 'test_metric',
          name: 'Test Conversion',
          type: 'conversion',
          eventName: 'test_conversion',
          aggregation: 'percentage',
          isPrimary: true
        }
      ],
      createdBy: 'dev_user',
      priority: 1,
      tags: ['test', 'development']
    });
  },

  /**
   * Generate mock data for testing
   */
  generateMockData: (experimentCount: number = 5, userCount: number = 100) => {
    const { MockDataGenerator } = require('./example');
    
    const experiments = Array.from({ length: experimentCount }, (_, i) =>
      MockDataGenerator.generateExperiment(`Test Experiment ${i + 1}`)
    );

    const users = Array.from({ length: userCount }, (_, i) =>
      MockDataGenerator.generateUser(`test_user_${i}`)
    );

    return { experiments, users };
  }
};

// Integration helpers
export const Integration = {
  /**
   * React context provider for A/B testing
   */
  ABTestingProvider: ({ children }: { children: React.ReactNode }) => {
    // This would be implemented as a React context provider
    // for global A/B testing state management
    return <>{children}</>;
  },

  /**
   * Higher-order component for automatic experiment setup
   */
  withABTesting: (WrappedComponent: React.ComponentType) => {
    return (props: any) => {
      // This would wrap a component with automatic A/B testing setup
      return <WrappedComponent {...props} />;
    };
  }
};

// Export everything as a single framework object for convenience
const ABMTestingFramework = {
  // Core
  useABTesting,
  useExperiment,
  useUserABTests,
  useSimpleABTest,
  
  // Components
  ExperimentList,
  ExperimentCreator,
  ExperimentResultsDashboard,
  UserAssignmentManager,
  ABTestingDashboard,
  
  // Configuration
  ABTestConfigManager,
  ConfigValidator,
  setupABTesting,
  
  // Utilities
  assignVariant,
  calculateStatisticalSignificance,
  analyzeExperimentResults,
  validateExperiment,
  
  // Development
  DevUtils,
  MockDataGenerator: require('./example').MockDataGenerator,
  
  // Info
  version: AB_TESTING_FRAMEWORK_VERSION,
  info: FRAMEWORK_INFO
} as const;

export default ABMTestingFramework;