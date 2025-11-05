/**
 * A/B Testing Configuration Management
 * Configuration handling, overrides, and system settings
 */

import {
  Experiment,
  ExperimentOverride,
  ExperimentConfig,
  ExperimentSegment,
  User,
  TargetAudience
} from './types';
import { generateExperimentId } from './utils';

// ============================================================================
// CONFIGURATION MANAGEMENT
// ============================================================================

/**
 * A/B Testing Configuration Manager
 * Handles experiment configurations, user overrides, and system settings
 */
export class ABTestConfigManager {
  private static instance: ABTestConfigManager;
  private experiments: Map<string, Experiment> = new Map();
  private overrides: Map<string, ExperimentOverride> = new Map();
  private segments: Map<string, ExperimentSegment> = new Map();
  private systemConfig: ABTestSystemConfig = this.getDefaultConfig();

  static getInstance(): ABTestConfigManager {
    if (!ABTestConfigManager.instance) {
      ABTestConfigManager.instance = new ABTestConfigManager();
    }
    return ABTestConfigManager.instance;
  }

  // ============================================================================
  // EXPERIMENT CONFIGURATION
  // ============================================================================

  /**
   * Save experiment configuration
   */
  async saveExperimentConfig(config: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Experiment> {
    const experiment: Experiment = {
      ...config,
      id: generateExperimentId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.experiments.set(experiment.id, experiment);
    await this.persistToStorage('experiments', this.serializeExperiments());
    
    return experiment;
  }

  /**
   * Update experiment configuration
   */
  async updateExperimentConfig(id: string, updates: Partial<Experiment>): Promise<Experiment | null> {
    const existing = this.experiments.get(id);
    if (!existing) return null;

    const updated: Experiment = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    this.experiments.set(id, updated);
    await this.persistToStorage('experiments', this.serializeExperiments());
    
    return updated;
  }

  /**
   * Get experiment configuration
   */
  getExperimentConfig(id: string): Experiment | null {
    return this.experiments.get(id) || null;
  }

  /**
   * Get all experiment configurations
   */
  getAllExperimentConfigs(): Experiment[] {
    return Array.from(this.experiments.values());
  }

  /**
   * Delete experiment configuration
   */
  async deleteExperimentConfig(id: string): Promise<boolean> {
    const deleted = this.experiments.delete(id);
    if (deleted) {
      await this.persistToStorage('experiments', this.serializeExperiments());
    }
    return deleted;
  }

  /**
   * Clone experiment configuration
   */
  async cloneExperimentConfig(
    id: string, 
    modifications?: Partial<Experiment>
  ): Promise<Experiment | null> {
    const original = this.getExperimentConfig(id);
    if (!original) return null;

    const cloned: Experiment = {
      ...original,
      ...modifications,
      id: generateExperimentId(),
      name: modifications?.name ? `${original.name} (Copy)` : `${original.name} Copy`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.saveExperimentConfig(cloned);
    return cloned;
  }

  // ============================================================================
  // USER OVERRIDES
  // ============================================================================

  /**
   * Set user override for experiment
   */
  async setUserOverride(override: ExperimentOverride): Promise<void> {
    const overrideKey = this.getOverrideKey(override);
    this.overrides.set(overrideKey, {
      ...override,
      expiresAt: override.expiresAt || this.calculateDefaultExpiry()
    });
    
    await this.persistToStorage('overrides', this.serializeOverrides());
  }

  /**
   * Remove user override
   */
  async removeUserOverride(experimentId: string, userId?: string): Promise<boolean> {
    const overrideKey = this.getOverrideKey({ experimentId, userId });
    const deleted = this.overrides.delete(overrideKey);
    
    if (deleted) {
      await this.persistToStorage('overrides', this.serializeOverrides());
    }
    
    return deleted;
  }

  /**
   * Get user override for experiment
   */
  getUserOverride(experimentId: string, userId?: string): ExperimentOverride | null {
    const overrideKey = this.getOverrideKey({ experimentId, userId });
    const override = this.overrides.get(overrideKey);
    
    if (!override) return null;
    
    // Check if override has expired
    if (override.expiresAt && override.expiresAt < new Date()) {
      this.overrides.delete(overrideKey);
      return null;
    }
    
    return override;
  }

  /**
   * Get all user overrides
   */
  getAllUserOverrides(): ExperimentOverride[] {
    const now = new Date();
    return Array.from(this.overrides.values()).filter(override => 
      !override.expiresAt || override.expiresAt > now
    );
  }

  // ============================================================================
  // EXPERIMENT SEGMENTS
  // ============================================================================

  /**
   * Create experiment segment
   */
  async createSegment(segment: Omit<ExperimentSegment, 'id' | 'createdAt'>): Promise<ExperimentSegment> {
    const newSegment: ExperimentSegment = {
      ...segment,
      id: `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    this.segments.set(newSegment.id, newSegment);
    await this.persistToStorage('segments', this.serializeSegments());
    
    return newSegment;
  }

  /**
   * Update experiment segment
   */
  async updateSegment(id: string, updates: Partial<ExperimentSegment>): Promise<ExperimentSegment | null> {
    const existing = this.segments.get(id);
    if (!existing) return null;

    const updated: ExperimentSegment = {
      ...existing,
      ...updates
    };

    this.segments.set(id, updated);
    await this.persistToStorage('segments', this.serializeSegments());
    
    return updated;
  }

  /**
   * Get segment by ID
   */
  getSegment(id: string): ExperimentSegment | null {
    return this.segments.get(id) || null;
  }

  /**
   * Get all segments
   */
  getAllSegments(): ExperimentSegment[] {
    return Array.from(this.segments.values());
  }

  /**
   * Delete segment
   */
  async deleteSegment(id: string): Promise<boolean> {
    const deleted = this.segments.delete(id);
    if (deleted) {
      await this.persistToStorage('segments', this.serializeSegments());
    }
    return deleted;
  }

  /**
   * Get experiments for segment
   */
  getExperimentsForSegment(segmentId: string): Experiment[] {
    const segment = this.getSegment(segmentId);
    if (!segment) return [];

    return this.getAllExperimentConfigs().filter(exp => 
      segment.experiments.includes(exp.id)
    );
  }

  // ============================================================================
  // TARGET AUDIENCE MANAGEMENT
  // ============================================================================

  /**
   * Check if user matches target audience
   */
  isUserInTargetAudience(user: User, targetAudience: TargetAudience): boolean {
    // Check user properties
    if (targetAudience.userProperties) {
      for (const [key, value] of Object.entries(targetAudience.userProperties)) {
        if (user.properties?.[key] !== value) {
          return false;
        }
      }
    }

    // Check percentage filter
    if (targetAudience.percentage) {
      const userHash = this.hashUserId(user.id);
      if ((userHash % 10000) / 100 > targetAudience.percentage) {
        return false;
      }
    }

    // In a real implementation, you would also evaluate include/exclude rules
    // These would be custom logic defined by the experiment creator

    return true;
  }

  /**
   * Get matching segments for user
   */
  getMatchingSegments(user: User): ExperimentSegment[] {
    return this.getAllSegments().filter(segment => {
      if (!segment.isActive) return false;
      
      return this.isUserInTargetAudience(user, {
        userProperties: segment.criteria
      });
    });
  }

  // ============================================================================
  // SYSTEM CONFIGURATION
  // ============================================================================

  /**
   * Update system configuration
   */
  async updateSystemConfig(updates: Partial<ABTestSystemConfig>): Promise<void> {
    this.systemConfig = {
      ...this.systemConfig,
      ...updates
    };
    
    await this.persistToStorage('systemConfig', this.systemConfig);
  }

  /**
   * Get system configuration
   */
  getSystemConfig(): ABTestSystemConfig {
    return { ...this.systemConfig };
  }

  /**
   * Reset to default configuration
   */
  async resetToDefaults(): Promise<void> {
    this.systemConfig = this.getDefaultConfig();
    this.experiments.clear();
    this.overrides.clear();
    this.segments.clear();
    
    await Promise.all([
      this.persistToStorage('systemConfig', this.systemConfig),
      this.persistToStorage('experiments', []),
      this.persistToStorage('overrides', []),
      this.persistToStorage('segments', [])
    ]);
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Bulk update experiment statuses
   */
  async bulkUpdateExperimentStatus(
    experimentIds: string[], 
    status: Experiment['status']
  ): Promise<void> {
    const updates = experimentIds.map(id => 
      this.updateExperimentConfig(id, { status })
    );
    await Promise.all(updates);
  }

  /**
   * Export all configuration data
   */
  async exportConfiguration(): Promise<ABTestConfigExport> {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      experiments: this.getAllExperimentConfigs(),
      overrides: this.getAllUserOverrides(),
      segments: this.getAllSegments(),
      systemConfig: this.getSystemConfig()
    };
  }

  /**
   * Import configuration data
   */
  async importConfiguration(data: ABTestConfigExport): Promise<void> {
    // Validate import data
    if (!this.validateConfigExport(data)) {
      throw new Error('Invalid configuration data');
    }

    // Clear existing data
    this.experiments.clear();
    this.overrides.clear();
    this.segments.clear();

    // Import data
    data.experiments.forEach(exp => {
      this.experiments.set(exp.id, exp);
    });

    data.overrides.forEach(override => {
      const key = this.getOverrideKey(override);
      this.overrides.set(key, override);
    });

    data.segments.forEach(segment => {
      this.segments.set(segment.id, segment);
    });

    this.systemConfig = data.systemConfig;

    // Persist all data
    await Promise.all([
      this.persistToStorage('experiments', this.serializeExperiments()),
      this.persistToStorage('overrides', this.serializeOverrides()),
      this.persistToStorage('segments', this.serializeSegments()),
      this.persistToStorage('systemConfig', this.systemConfig)
    ]);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private getDefaultConfig(): ABTestSystemConfig {
    return {
      autoStartExperiments: false,
      defaultExperimentDuration: 14, // days
      minimumSampleSize: 100,
      defaultConfidenceLevel: 0.95,
      defaultStatisticalPower: 0.8,
      enableRealTimeTracking: true,
      enableAutomaticAnalysis: true,
      maxConcurrentExperiments: 10,
      dataRetentionDays: 365,
      enableCrossDomainTracking: false,
      enableUserSegmentation: true,
      defaultTrafficAllocation: {
        control: 50,
        variant: 50
      },
      alertThresholds: {
        minimumSampleSize: 100,
        minimumDuration: 3, // days
        maximumDuration: 60, // days
        significanceLevel: 0.05,
        power: 0.8
      },
      featureFlags: {
        enableMultivariateTests: false,
        enableFunnelAnalysis: false,
        enableCohortAnalysis: false,
        enablePersonalization: true
      }
    };
  }

  private getOverrideKey(override: ExperimentOverride): string {
    return `${override.experimentId}:${override.userId || 'global'}`;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private calculateDefaultExpiry(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30); // 30 days from now
    return expiry;
  }

  private async persistToStorage(key: string, data: any): Promise<void> {
    // In a real implementation, this would persist to your storage system
    // For now, we'll use localStorage as a simple example
    try {
      localStorage.setItem(`abtest_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist data to storage:', error);
    }
  }

  private serializeExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }

  private serializeOverrides(): ExperimentOverride[] {
    return Array.from(this.overrides.values());
  }

  private serializeSegments(): ExperimentSegment[] {
    return Array.from(this.segments.values());
  }

  private validateConfigExport(data: any): data is ABTestConfigExport {
    return (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray(data.experiments) &&
      Array.isArray(data.overrides) &&
      Array.isArray(data.segments) &&
      typeof data.systemConfig === 'object'
    );
  }
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface ABTestSystemConfig {
  autoStartExperiments: boolean;
  defaultExperimentDuration: number; // days
  minimumSampleSize: number;
  defaultConfidenceLevel: number;
  defaultStatisticalPower: number;
  enableRealTimeTracking: boolean;
  enableAutomaticAnalysis: boolean;
  maxConcurrentExperiments: number;
  dataRetentionDays: number;
  enableCrossDomainTracking: boolean;
  enableUserSegmentation: boolean;
  defaultTrafficAllocation: {
    control: number;
    variant: number;
  };
  alertThresholds: {
    minimumSampleSize: number;
    minimumDuration: number;
    maximumDuration: number;
    significanceLevel: number;
    power: number;
  };
  featureFlags: {
    enableMultivariateTests: boolean;
    enableFunnelAnalysis: boolean;
    enableCohortAnalysis: boolean;
    enablePersonalization: boolean;
  };
}

export interface ABTestConfigExport {
  version: string;
  exportedAt: string;
  experiments: Experiment[];
  overrides: ExperimentOverride[];
  segments: ExperimentSegment[];
  systemConfig: ABTestSystemConfig;
}

// ============================================================================
// CONFIGURATION HOOKS AND COMPONENTS
// ============================================================================

/**
 * Hook for accessing configuration manager
 */
export function useConfigManager() {
  return ABTestConfigManager.getInstance();
}

/**
 * React hook for system configuration
 */
import { useState, useEffect } from 'react';

export function useSystemConfig() {
  const [config, setConfig] = useState<ABTestSystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const configManager = useConfigManager();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const currentConfig = configManager.getSystemConfig();
        setConfig(currentConfig);
      } catch (error) {
        console.error('Failed to load system configuration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [configManager]);

  const updateConfig = async (updates: Partial<ABTestSystemConfig>) => {
    if (!config) return;
    
    try {
      await configManager.updateSystemConfig(updates);
      setConfig(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Failed to update system configuration:', error);
      throw error;
    }
  };

  return {
    config,
    isLoading,
    updateConfig
  };
}

/**
 * Configuration validation utilities
 */
export const ConfigValidator = {
  validateExperimentConfig(config: Partial<Experiment>): string[] {
    const errors: string[] = [];

    if (!config.name?.trim()) {
      errors.push('Experiment name is required');
    }

    if (!config.variants || config.variants.length < 2) {
      errors.push('At least 2 variants are required');
    }

    if (config.variants) {
      const totalWeight = config.variants.reduce((sum, v) => sum + (v.weight || 0), 0);
      if (Math.abs(totalWeight - 100) > 0.01) {
        errors.push('Variant weights must sum to 100%');
      }
    }

    if (!config.metrics || config.metrics.length === 0) {
      errors.push('At least one metric is required');
    }

    if (config.startDate && config.endDate && config.startDate >= config.endDate) {
      errors.push('End date must be after start date');
    }

    return errors;
  },

  validateSystemConfig(config: Partial<ABTestSystemConfig>): string[] {
    const errors: string[] = [];

    if (config.minimumSampleSize !== undefined && config.minimumSampleSize < 10) {
      errors.push('Minimum sample size must be at least 10');
    }

    if (config.defaultConfidenceLevel !== undefined && 
        (config.defaultConfidenceLevel < 0.5 || config.defaultConfidenceLevel >= 1)) {
      errors.push('Confidence level must be between 0.5 and 1');
    }

    if (config.defaultStatisticalPower !== undefined && 
        (config.defaultStatisticalPower <= 0 || config.defaultStatisticalPower >= 1)) {
      errors.push('Statistical power must be between 0 and 1');
    }

    if (config.maxConcurrentExperiments !== undefined && config.maxConcurrentExperiments < 1) {
      errors.push('Maximum concurrent experiments must be at least 1');
    }

    return errors;
  }
};