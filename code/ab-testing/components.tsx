/**
 * A/B Testing React Components
 * UI components for managing experiments and displaying results
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Experiment,
  ExperimentVariant,
  ExperimentResults,
  ExperimentProgress,
  User,
  UserAssignment
} from './types';
import { 
  useABTesting, 
  useExperiment, 
  useExperimentFilters,
  useExperimentCreator 
} from './hooks';
import { 
  getTrafficAllocation, 
  isExperimentActive, 
  getExperimentDuration,
  hasSufficientSampleSize 
} from './utils';

// ============================================================================
// EXPERIMENT MANAGEMENT COMPONENTS
// ============================================================================

interface ExperimentListProps {
  onCreateExperiment?: () => void;
  onEditExperiment?: (experiment: Experiment) => void;
  className?: string;
}

export const ExperimentList: React.FC<ExperimentListProps> = ({
  onCreateExperiment,
  onEditExperiment,
  className = ''
}) => {
  const { experiments, isLoading, deleteExperiment } = useABTesting();
  const { 
    experiments: filteredExperiments, 
    filters, 
    sorting, 
    updateFilters, 
    updateSorting 
  } = useExperimentFilters();

  useEffect(() => {
    // Load experiments when component mounts
    console.log('Loading experiments...');
  }, []);

  const getStatusColor = (status: Experiment['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Experiments</h2>
          <button
            onClick={onCreateExperiment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Create Experiment
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={filters.status?.[0] || ''}
            onChange={(e) => updateFilters({ 
              status: e.target.value ? [e.target.value as Experiment['status']] : undefined 
            })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={sorting.field}
            onChange={(e) => updateSorting({ field: e.target.value as any })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="name">Name</option>
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Updated Date</option>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
          </select>

          <button
            onClick={() => updateSorting({ direction: sorting.direction === 'asc' ? 'desc' : 'asc' })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm hover:bg-gray-50"
          >
            {sorting.direction === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Experiment List */}
      {isLoading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading experiments...</p>
        </div>
      ) : filteredExperiments.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">No experiments found</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredExperiments.map((experiment) => (
            <ExperimentListItem
              key={experiment.id}
              experiment={experiment}
              onEdit={onEditExperiment}
              onDelete={deleteExperiment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ExperimentListItemProps {
  experiment: Experiment;
  onEdit?: (experiment: Experiment) => void;
  onDelete?: (id: string) => void;
}

const ExperimentListItem: React.FC<ExperimentListItemProps> = ({
  experiment,
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusColor = (status: Experiment['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(experiment.id);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-medium text-gray-900">{experiment.name}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(experiment.status)}`}>
              {experiment.status}
            </span>
            {experiment.priority && (
              <span className="text-xs text-gray-500">Priority: {experiment.priority}</span>
            )}
          </div>
          
          {experiment.description && (
            <p className="text-gray-600 text-sm mb-3">{experiment.description}</p>
          )}
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>{experiment.variants.length} variants</span>
            <span>{experiment.metrics.length} metrics</span>
            {experiment.startDate && (
              <span>
                {isExperimentActive(experiment) ? 'Running' : 'Ended'} 
                {experiment.endDate && ` • ${getExperimentDuration(experiment)} days`}
              </span>
            )}
            {experiment.tags && experiment.tags.length > 0 && (
              <div className="flex gap-1">
                {experiment.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
                {experiment.tags.length > 3 && (
                  <span className="text-xs text-gray-400">+{experiment.tags.length - 3} more</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(experiment)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPERIMENT CREATION COMPONENT
// ============================================================================

interface ExperimentCreatorProps {
  onCreate?: (experiment: Experiment) => void;
  onCancel?: () => void;
}

export const ExperimentCreator: React.FC<ExperimentCreatorProps> = ({
  onCreate,
  onCancel
}) => {
  const { createExperiment } = useABTesting();
  const { 
    draft, 
    isCreating, 
    updateDraft, 
    addVariant, 
    removeVariant,
    addMetric,
    removeMetric,
    validateDraft,
    resetDraft
  } = useExperimentCreator();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const validationErrors = useMemo(() => validateDraft(), [validateDraft]);
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1: return draft.name && draft.description;
      case 2: return draft.variants && draft.variants.length >= 2;
      case 3: return draft.metrics && draft.metrics.length >= 1;
      case 4: return validationErrors.length === 0;
      default: return false;
    }
  }, [currentStep, draft, validationErrors]);

  const handleCreate = async () => {
    try {
      const experiment = await createExperiment(draft as Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>);
      resetDraft();
      onCreate?.(experiment);
    } catch (error) {
      console.error('Failed to create experiment:', error);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            i + 1 <= currentStep 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'bg-gray-100 border-gray-300 text-gray-400'
          }`}>
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-12 h-0.5 ${
              i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Experiment Name *
        </label>
        <input
          type="text"
          value={draft.name || ''}
          onChange={(e) => updateDraft({ name: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter experiment name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={draft.description || ''}
          onChange={(e) => updateDraft({ description: e.target.value })}
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe what you're testing and why"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority (1-10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={draft.priority || 5}
            onChange={(e) => updateDraft({ priority: parseInt(e.target.value) })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            value={draft.tags?.join(', ') || ''}
            onChange={(e) => updateDraft({ 
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tag1, tag2, tag3"
          />
        </div>
      </div>
    </div>
  );

  const renderVariants = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Experiment Variants</h3>
        <button
          onClick={() => addVariant({
            name: '',
            description: '',
            weight: 50,
            isControl: false
          })}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
        >
          Add Variant
        </button>
      </div>

      <div className="space-y-3">
        {draft.variants?.map((variant, index) => (
          <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Variant {index + 1}
                </span>
                {index === 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Control
                  </span>
                )}
              </div>
              {index > 0 && (
                <button
                  onClick={() => removeVariant(variant.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => {
                    const updatedVariants = draft.variants!.map(v => 
                      v.id === variant.id ? { ...v, name: e.target.value } : v
                    );
                    updateDraft({ variants: updatedVariants });
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="Variant name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Traffic %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={variant.weight}
                  onChange={(e) => {
                    const updatedVariants = draft.variants!.map(v => 
                      v.id === variant.id ? { ...v, weight: parseInt(e.target.value) } : v
                    );
                    updateDraft({ variants: updatedVariants });
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>

            <div className="mt-2">
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                value={variant.description || ''}
                onChange={(e) => {
                  const updatedVariants = draft.variants!.map(v => 
                    v.id === variant.id ? { ...v, description: e.target.value } : v
                  );
                  updateDraft({ variants: updatedVariants });
                }}
                rows={2}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                placeholder="Describe this variant"
              />
            </div>
          </div>
        ))}

        {draft.variants && draft.variants.length > 0 && (
          <div className="text-sm text-gray-600">
            Total Weight: {draft.variants.reduce((sum, v) => sum + v.weight, 0)}%
            {draft.variants.reduce((sum, v) => sum + v.weight, 0) !== 100 && (
              <span className="text-red-600 ml-2">(Must equal 100%)</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Success Metrics</h3>
        <button
          onClick={() => addMetric({
            name: '',
            type: 'conversion',
            eventName: '',
            aggregation: 'percentage',
            isPrimary: false
          })}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
        >
          Add Metric
        </button>
      </div>

      <div className="space-y-3">
        {draft.metrics?.map((metric, index) => (
          <div key={metric.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Metric {index + 1}
                </span>
                {metric.isPrimary && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                )}
              </div>
              <button
                onClick={() => removeMetric(metric.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={metric.name}
                  onChange={(e) => {
                    const updatedMetrics = draft.metrics!.map(m => 
                      m.id === metric.id ? { ...m, name: e.target.value } : m
                    );
                    updateDraft({ metrics: updatedMetrics });
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="Metric name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Type</label>
                <select
                  value={metric.type}
                  onChange={(e) => {
                    const updatedMetrics = draft.metrics!.map(m => 
                      m.id === metric.id ? { ...m, type: e.target.value as any } : m
                    );
                    updateDraft({ metrics: updatedMetrics });
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="conversion">Conversion</option>
                  <option value="retention">Retention</option>
                  <option value="engagement">Engagement</option>
                  <option value="revenue">Revenue</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Event Name</label>
                <input
                  type="text"
                  value={metric.eventName}
                  onChange={(e) => {
                    const updatedMetrics = draft.metrics!.map(m => 
                      m.id === metric.id ? { ...m, eventName: e.target.value } : m
                    );
                    updateDraft({ metrics: updatedMetrics });
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="analytics_event_name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Aggregation</label>
                <select
                  value={metric.aggregation}
                  onChange={(e) => {
                    const updatedMetrics = draft.metrics!.map(m => 
                      m.id === metric.id ? { ...m, aggregation: e.target.value as any } : m
                    );
                    updateDraft({ metrics: updatedMetrics });
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="percentage">Percentage</option>
                  <option value="sum">Sum</option>
                  <option value="average">Average</option>
                  <option value="count">Count</option>
                </select>
              </div>
            </div>

            <div className="mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={metric.isPrimary}
                  onChange={(e) => {
                    const updatedMetrics = draft.metrics!.map(m => 
                      m.id === metric.id ? { ...m, isPrimary: e.target.checked } : m
                    );
                    updateDraft({ metrics: updatedMetrics });
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Primary metric</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Review & Create</h3>
      
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following issues:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900">{draft.name}</h4>
          <p className="text-gray-600">{draft.description}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Variants ({draft.variants?.length || 0})</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {draft.variants?.map((variant, index) => (
              <li key={variant.id}>
                {variant.name} - {variant.weight}% {index === 0 && '(Control)'}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-gray-900">Metrics ({draft.metrics?.length || 0})</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {draft.metrics?.map((metric) => (
              <li key={metric.id}>
                {metric.name} ({metric.type}) {metric.isPrimary && '- Primary'}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderBasicInfo();
      case 2: return renderVariants();
      case 3: return renderMetrics();
      case 4: return renderReview();
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Experiment</h2>
          <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
        </div>

        {renderStepIndicator()}
        
        <div className="mb-8">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={!isStepValid || isCreating}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Experiment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};