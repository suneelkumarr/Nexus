import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  BeakerIcon,
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { ABTest, Variant, TargetAudience, Metric, TestTemplate } from '../types';

// Enhanced validation schema
const createTestSchema = z.object({
  name: z.string()
    .min(3, 'Test name must be at least 3 characters')
    .max(100, 'Test name cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Test name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  
  hypothesis: z.string()
    .min(20, 'Hypothesis must be at least 20 characters')
    .max(1000, 'Hypothesis cannot exceed 1000 characters'),
  
  category: z.string().min(1, 'Category is required'),
  
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  
  variants: z.array(z.object({
    id: z.string(),
    name: z.string()
      .min(2, 'Variant name must be at least 2 characters')
      .max(50, 'Variant name cannot exceed 50 characters'),
    description: z.string()
      .min(5, 'Variant description must be at least 5 characters')
      .max(200, 'Description cannot exceed 200 characters'),
    trafficAllocation: z.number()
      .min(1, 'Traffic allocation must be at least 1%')
      .max(100, 'Traffic allocation cannot exceed 100%'),
    isControl: z.boolean(),
    config: z.record(z.any()).default({}),
    color: z.string(),
    icon: z.string().optional(),
  })).min(2, 'At least 2 variants are required').max(10, 'Maximum 10 variants allowed'),
  
  targetAudience: z.object({
    demographic: z.object({
      ageRange: z.tuple([z.number(), z.number()]).optional(),
      gender: z.array(z.string()).optional(),
      income: z.string().optional(),
      education: z.array(z.string()).optional(),
    }).optional(),
    
    geographic: z.object({
      countries: z.array(z.string()).optional(),
      regions: z.array(z.string()).optional(),
      cities: z.array(z.string()).optional(),
    }).optional(),
    
    device: z.object({
      desktop: z.boolean().default(true),
      mobile: z.boolean().default(true),
      tablet: z.boolean().default(true),
    }),
    
    behavior: z.object({
      newUsers: z.boolean().optional(),
      returningUsers: z.boolean().optional(),
      highValue: z.boolean().optional(),
      specificPages: z.array(z.string()).optional(),
      referrerType: z.array(z.string()).optional(),
    }).optional(),
    
    percentage: z.number()
      .min(1, 'Percentage must be at least 1%')
      .max(100, 'Percentage cannot exceed 100%'),
    
    includeRules: z.array(z.string()).optional(),
    excludeRules: z.array(z.string()).optional(),
  }),
  
  metrics: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Metric name is required'),
    type: z.enum(['conversion', 'revenue', 'engagement', 'retention', 'custom']),
    eventName: z.string().min(1, 'Event name is required'),
    aggregation: z.enum(['sum', 'average', 'percentage', 'count']),
    isPrimary: z.boolean(),
    targetValue: z.number().optional(),
    unit: z.string().optional(),
  })).min(1, 'At least one metric is required').max(10, 'Maximum 10 metrics allowed'),
  
  statisticalSettings: z.object({
    minimumSampleSize: z.number().min(100, 'Minimum sample size must be at least 100'),
    confidenceLevel: z.number().min(80).max(99),
    statisticalPower: z.number().min(70).max(99).default(80),
    minDetectableEffect: z.number().min(1).max(50),
  }),
  
  schedule: z.object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    timezone: z.string().default('UTC'),
    autoStart: z.boolean().default(false),
    autoStop: z.boolean().default(false),
  }),
  
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Maximum 10 tags allowed'),
  
  collaborators: z.array(z.string()).default([]),
  
  notifications: z.object({
    significanceReached: z.boolean().default(true),
    sampleSizeAchieved: z.boolean().default(true),
    testCompleted: z.boolean().default(true),
    anomalyDetected: z.boolean().default(true),
  }),
});

type CreateTestForm = z.infer<typeof createTestSchema>;

interface CreateTestProps {
  onComplete: (test: ABTest) => void;
  onCancel: () => void;
  template?: TestTemplate;
  editTest?: ABTest;
}

// Pre-defined options
const DEMOGRAPHIC_OPTIONS = {
  ageRanges: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
  genders: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
  income: ['<$30k', '$30k-$50k', '$50k-$75k', '$75k-$100k', '$100k-$150k', '$150k+'],
  education: ['High School', 'Some College', 'Bachelor\'s', 'Master\'s', 'PhD'],
};

const GEOGRAPHIC_OPTIONS = {
  countries: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan'],
  regions: ['North America', 'Europe', 'Asia Pacific', 'South America', 'Africa'],
  cities: ['New York', 'Los Angeles', 'Chicago', 'London', 'Berlin', 'Tokyo', 'Sydney'],
};

const BEHAVIOR_OPTIONS = {
  specificPages: ['/home', '/pricing', '/features', '/about', '/contact', '/blog'],
  referrerType: ['Direct', 'Google', 'Facebook', 'Twitter', 'LinkedIn', 'Email'],
};

const CATEGORIES = [
  'Landing Page',
  'Checkout Flow',
  'Email Marketing',
  'Social Media',
  'Pricing',
  'Product Features',
  'UI/UX',
  'Content',
  'Navigation',
  'Call-to-Action',
  'Form Design',
  'Other'
];

const PREDEFINED_TEMPLATES: TestTemplate[] = [
  {
    id: 'conversion-optimization',
    name: 'Conversion Rate Optimization',
    description: 'Template for testing conversion-focused changes',
    category: 'Landing Page',
    usageCount: 45,
    tags: ['conversion', 'landing-page', 'cta'],
    isPublic: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    template: {
      metrics: [{
        id: 'primary',
        name: 'Conversion Rate',
        type: 'conversion',
        eventName: 'conversion',
        aggregation: 'percentage',
        isPrimary: true,
        unit: '%'
      }],
      statisticalSettings: {
        minimumSampleSize: 500,
        confidenceLevel: 95,
        statisticalPower: 80,
        minDetectableEffect: 5,
      }
    }
  },
  {
    id: 'revenue-optimization',
    name: 'Revenue Optimization',
    description: 'Template for testing revenue-focused changes',
    category: 'Pricing',
    usageCount: 32,
    tags: ['revenue', 'pricing', 'ecommerce'],
    isPublic: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    template: {
      metrics: [{
        id: 'primary',
        name: 'Revenue per User',
        type: 'revenue',
        eventName: 'purchase',
        aggregation: 'sum',
        isPrimary: true,
        unit: '$'
      }],
      statisticalSettings: {
        minimumSampleSize: 200,
        confidenceLevel: 95,
        statisticalPower: 80,
        minDetectableEffect: 10,
      }
    }
  },
  {
    id: 'engagement-optimization',
    name: 'User Engagement',
    description: 'Template for testing engagement-focused changes',
    category: 'Content',
    usageCount: 28,
    tags: ['engagement', 'content', 'social'],
    isPublic: true,
    createdAt: new Date().toISOString(),
    createdBy: 'system',
    template: {
      metrics: [{
        id: 'primary',
        name: 'Time on Page',
        type: 'engagement',
        eventName: 'engagement',
        aggregation: 'average',
        isPrimary: true,
        unit: 'seconds'
      }],
      statisticalSettings: {
        minimumSampleSize: 300,
        confidenceLevel: 95,
        statisticalPower: 80,
        minDetectableEffect: 15,
      }
    }
  }
];

const CreateTest: React.FC<CreateTestProps> = ({ onComplete, onCancel, template, editTest }) => {
  const { user, hasPermission } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TestTemplate | null>(template || null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateTestForm>({
    resolver: zodResolver(createTestSchema),
    mode: 'onChange',
    defaultValues: editTest ? {
      name: editTest.name,
      description: editTest.description,
      hypothesis: editTest.hypothesis,
      category: editTest.category,
      priority: editTest.priority,
      variants: editTest.variants,
      targetAudience: editTest.targetAudience,
      metrics: editTest.metrics,
      statisticalSettings: {
        minimumSampleSize: editTest.minimumSampleSize,
        confidenceLevel: editTest.confidenceLevel,
        statisticalPower: editTest.statisticalPower || 80,
        minDetectableEffect: 5, // Default value
      },
      schedule: {
        startDate: editTest.startDate.split('T')[0],
        endDate: editTest.endDate?.split('T')[0],
        timezone: editTest.schedule?.timezone || 'UTC',
        autoStart: editTest.schedule?.autoStart || false,
        autoStop: editTest.schedule?.autoStop || false,
      },
      tags: editTest.tags,
      collaborators: editTest.collaborators,
      notifications: {
        significanceReached: true,
        sampleSizeAchieved: true,
        testCompleted: true,
        anomalyDetected: true,
      },
    } : {
      variants: [
        {
          id: 'control',
          name: 'Control',
          description: 'Current version',
          trafficAllocation: 50,
          isControl: true,
          config: {},
          color: '#3B82F6',
        },
        {
          id: 'variant_a',
          name: 'Variant A',
          description: 'Test variation',
          trafficAllocation: 50,
          isControl: false,
          config: {},
          color: '#EF4444',
        },
      ],
      targetAudience: {
        percentage: 100,
        device: {
          desktop: true,
          mobile: true,
          tablet: true,
        },
      },
      metrics: [
        {
          id: 'primary',
          name: 'Conversion Rate',
          type: 'conversion',
          eventName: 'conversion',
          aggregation: 'percentage',
          isPrimary: true,
          unit: '%',
        },
      ],
      statisticalSettings: {
        minimumSampleSize: 500,
        confidenceLevel: 95,
        statisticalPower: 80,
        minDetectableEffect: 5,
      },
      schedule: {
        startDate: new Date().toISOString().split('T')[0],
        timezone: 'UTC',
        autoStart: false,
        autoStop: false,
      },
      tags: [],
      collaborators: [],
      notifications: {
        significanceReached: true,
        sampleSizeAchieved: true,
        testCompleted: true,
        anomalyDetected: true,
      },
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  const { fields: metricFields, append: appendMetric, remove: removeMetric } = useFieldArray({
    control,
    name: 'metrics',
  });

  // Watch for changes to update preview
  const watchedValues = watch();

  useEffect(() => {
    if (selectedTemplate) {
      // Apply template settings
      if (selectedTemplate.template.metrics) {
        setValue('metrics', selectedTemplate.template.metrics as any);
      }
      if (selectedTemplate.template.statisticalSettings) {
        setValue('statisticalSettings', selectedTemplate.template.statisticalSettings as any);
      }
    }
  }, [selectedTemplate, setValue]);

  useEffect(() => {
    // Generate preview data based on current form values
    const calculatePreview = () => {
      const trafficAllocations = watchedValues.variants?.map(v => v.trafficAllocation) || [];
      const totalAllocation = trafficAllocations.reduce((sum, val) => sum + val, 0);
      const validAllocation = totalAllocation === 100;
      
      const sampleSize = watchedValues.statisticalSettings?.minimumSampleSize || 0;
      const estimatedDays = Math.ceil(sampleSize / 100); // Rough estimation
      
      setPreviewData({
        totalAllocation: validAllocation,
        estimatedDuration: estimatedDays,
        requiredTraffic: sampleSize * 2, // Rough calculation
        significance: {
          current: 0,
          required: watchedValues.statisticalSettings?.confidenceLevel || 95,
        },
      });
    };

    calculatePreview();
  }, [watchedValues]);

  const steps = [
    {
      title: 'Basic Information',
      description: 'Test name, description, and hypothesis',
      icon: LightBulbIcon,
      component: BasicInfoStep,
    },
    {
      title: 'Variants',
      description: 'Define test variants and traffic allocation',
      icon: BeakerIcon,
      component: VariantsStep,
    },
    {
      title: 'Target Audience',
      description: 'Define who will see this test',
      icon: UserGroupIcon,
      component: TargetAudienceStep,
    },
    {
      title: 'Metrics',
      description: 'Choose what to measure',
      icon: ChartBarIcon,
      component: MetricsStep,
    },
    {
      title: 'Statistical Settings',
      description: 'Configure statistical parameters',
      icon: ShieldCheckIcon,
      component: StatisticalStep,
    },
    {
      title: 'Schedule',
      description: 'When to run the test',
      icon: CalendarIcon,
      component: ScheduleStep,
    },
    {
      title: 'Review & Create',
      description: 'Review all settings and create test',
      icon: ClipboardDocumentListIcon,
      component: ReviewStep,
    },
  ];

  const onSubmit = async (data: CreateTestForm) => {
    if (!hasPermission('create_tests')) {
      toast.error('You do not have permission to create tests');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate total traffic allocation
      const totalAllocation = data.variants.reduce((sum, variant) => sum + variant.trafficAllocation, 0);
      if (totalAllocation !== 100) {
        toast.error('Traffic allocation must total 100%');
        setIsSubmitting(false);
        return;
      }

      // Create test object
      const test: ABTest = {
        id: editTest?.id || `test_${Date.now()}`,
        ...data,
        status: 'draft',
        startDate: new Date(data.schedule.startDate).toISOString(),
        endDate: data.schedule.endDate ? new Date(data.schedule.endDate).toISOString() : undefined,
        duration: data.schedule.endDate 
          ? Math.ceil((new Date(data.schedule.endDate).getTime() - new Date(data.schedule.startDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        minimumSampleSize: data.statisticalSettings.minimumSampleSize,
        statisticalSignificance: 100 - data.statisticalSettings.confidenceLevel,
        confidenceLevel: data.statisticalSettings.confidenceLevel,
        createdAt: new Date().toISOString(),
        createdBy: user!.id,
        lastModified: new Date().toISOString(),
        schedule: {
          startAt: data.schedule.startDate,
          endAt: data.schedule.endDate,
          timezone: data.schedule.timezone,
          autoStart: data.schedule.autoStart,
          autoStop: data.schedule.autoStop,
        },
        owner: user!.id,
        isArchived: false,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, this would save to your backend
      console.log('Creating test:', test);
      
      toast.success(editTest ? 'Test updated successfully!' : 'Test created successfully!');
      onComplete(test);

    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Failed to create test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const isStepValid = await trigger();
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error('Please fix validation errors before continuing');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex < currentStep || stepIndex === currentStep + 1) {
      setCurrentStep(stepIndex);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editTest ? 'Edit Test' : 'Create New Test'}
            </h1>
            <p className="text-gray-600 mt-1">
              {editTest ? 'Modify your test settings' : 'Set up a new A/B test to optimize your results'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Navigation */}
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isAccessible = index <= currentStep + 1;

            return (
              <button
                key={index}
                onClick={() => isAccessible && goToStep(index)}
                disabled={!isAccessible}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : isCompleted
                    ? 'text-green-600 hover:bg-green-50'
                    : isAccessible
                    ? 'text-gray-600 hover:bg-gray-50'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <div className={`p-2 rounded-full mb-1 ${
                  isActive
                    ? 'bg-indigo-100'
                    : isCompleted
                    ? 'bg-green-100'
                    : 'bg-gray-100'
                }`}>
                  {isCompleted ? (
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <Icon className={`h-5 w-5 ${
                      isActive ? 'text-indigo-600' : 'text-gray-400'
                    }`} />
                  )}
                </div>
                <span className="text-xs font-medium text-center">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-8">
          <CurrentStepComponent
            register={register}
            control={control}
            setValue={setValue}
            watch={watch}
            errors={errors}
            variantFields={variantFields}
            appendVariant={appendVariant}
            removeVariant={removeVariant}
            metricFields={metricFields}
            appendMetric={appendMetric}
            removeMetric={removeMetric}
            previewData={previewData}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            templates={PREDEFINED_TEMPLATES}
            watchedValues={watchedValues}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
              currentStep === 0
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center px-6 py-2 rounded-lg border transition-colors ${
                isSubmitting
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-indigo-600 text-white bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {editTest ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {editTest ? 'Update Test' : 'Create Test'}
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Next
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

// Step Components
const BasicInfoStep: React.FC<any> = ({ register, errors, templates, selectedTemplate, setSelectedTemplate }) => (
  <div className="space-y-6">
    {/* Template Selection */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Start from Template (Optional)
      </label>
      <select
        value={selectedTemplate?.id || ''}
        onChange={(e) => {
          const template = templates.find((t: TestTemplate) => t.id === e.target.value);
          setSelectedTemplate(template || null);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">Start from scratch</option>
        {templates.map((template: TestTemplate) => (
          <option key={template.id} value={template.id}>
            {template.name} ({template.usageCount} uses)
          </option>
        ))}
      </select>
      {selectedTemplate && (
        <p className="mt-2 text-sm text-gray-600">{selectedTemplate.description}</p>
      )}
    </div>

    {/* Test Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Test Name *
      </label>
      <input
        {...register('name')}
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="e.g., Homepage CTA Button Color Test"
      />
      {errors.name && (
        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
      )}
    </div>

    {/* Category */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Category *
      </label>
      <select
        {...register('category')}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">Select a category</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      {errors.category && (
        <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
      )}
    </div>

    {/* Description */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Description *
      </label>
      <textarea
        {...register('description')}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Describe what you're testing and why"
      />
      {errors.description && (
        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
      )}
    </div>

    {/* Hypothesis */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Hypothesis *
      </label>
      <textarea
        {...register('hypothesis')}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="State your hypothesis: 'We believe that [change] will [outcome] because [reason]'"
      />
      {errors.hypothesis && (
        <p className="mt-1 text-sm text-red-600">{errors.hypothesis.message}</p>
      )}
    </div>

    {/* Priority */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Priority *
      </label>
      <select
        {...register('priority')}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      {errors.priority && (
        <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
      )}
    </div>
  </div>
);

const VariantsStep: React.FC<any> = ({ 
  register, 
  control, 
  errors, 
  variantFields, 
  appendVariant, 
  removeVariant, 
  setValue,
  watch 
}) => {
  const variants = watch('variants');

  const addVariant = () => {
    const newVariant = {
      id: `variant_${Date.now()}`,
      name: `Variant ${String.fromCharCode(65 + variantFields.length - 1)}`,
      description: 'Test variation',
      trafficAllocation: 0,
      isControl: false,
      config: {},
      color: ['#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][variantFields.length % 4] || '#6B7280',
    };
    appendVariant(newVariant);
  };

  const updateTrafficAllocation = (index: number, value: number) => {
    const totalOtherAllocation = variants.reduce((sum: number, variant: any, i: number) => 
      i !== index ? sum + variant.trafficAllocation : sum, 0
    );
    const maxAllocation = 100 - totalOtherAllocation;
    setValue(`variants.${index}.trafficAllocation`, Math.min(value, maxAllocation));
  };

  const totalAllocation = variants?.reduce((sum: number, variant: any) => sum + variant.trafficAllocation, 0) || 0;
  const isValidAllocation = totalAllocation === 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Test Variants</h3>
        <button
          type="button"
          onClick={addVariant}
          disabled={variantFields.length >= 10}
          className="flex items-center px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Variant
        </button>
      </div>

      {/* Traffic Allocation Summary */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Total Traffic Allocation</span>
          <span className={`text-sm font-bold ${isValidAllocation ? 'text-green-600' : 'text-red-600'}`}>
            {totalAllocation}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${isValidAllocation ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(totalAllocation, 100)}%` }}
          />
        </div>
        {!isValidAllocation && (
          <p className="text-xs text-red-600 mt-1">
            Total allocation must equal 100%. Current: {totalAllocation}%
          </p>
        )}
      </div>

      {/* Variants List */}
      <div className="space-y-4">
        {variantFields.map((field, index) => (
          <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: variants[index]?.color || '#6B7280' }}
                />
                <h4 className="font-medium text-gray-900">
                  {variants[index]?.isControl ? 'Control' : `Variant ${String.fromCharCode(65 + index - 1)}`}
                </h4>
                {variants[index]?.isControl && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    Control
                  </span>
                )}
              </div>
              {!variants[index]?.isControl && variantFields.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variant Name
                </label>
                <input
                  {...register(`variants.${index}.name`)}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                {errors.variants?.[index]?.name && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.variants[index]?.name?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Traffic Allocation (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={variants[index]?.trafficAllocation || 0}
                  onChange={(e) => updateTrafficAllocation(index, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register(`variants.${index}.description`)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe this variant"
              />
            </div>

            {/* Advanced Configuration */}
            <details className="mt-3">
              <summary className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer">
                Advanced Configuration
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  {...register(`variants.${index}.color`)}
                  className="w-20 h-8 border border-gray-300 rounded"
                />
              </div>
            </details>
          </div>
        ))}
      </div>

      {variantFields.length < 2 && (
        <div className="text-center py-8 text-gray-500">
          <BeakerIcon className="h-12 w-12 mx-auto mb-2" />
          <p>At least 2 variants are required</p>
        </div>
      )}
    </div>
  );
};

const TargetAudienceStep: React.FC<any> = ({ register, control, errors, setValue, watch }) => {
  const targetAudience = watch('targetAudience');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Target Audience</h3>
        <p className="text-sm text-gray-600">
          Define who will see this test. Leave fields empty to include everyone.
        </p>
      </div>

      {/* Traffic Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Traffic Percentage *
        </label>
        <input
          {...register('targetAudience.percentage')}
          type="number"
          min="1"
          max="100"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Percentage of eligible users to include in this test
        </p>
        {errors.targetAudience?.percentage && (
          <p className="text-sm text-red-600 mt-1">
            {errors.targetAudience.percentage.message}
          </p>
        )}
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Range
          </label>
          <div className="flex space-x-2">
            <input
              {...register('targetAudience.demographic.ageRange.0')}
              type="number"
              min="13"
              max="100"
              placeholder="Min"
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <span className="self-center">-</span>
            <input
              {...register('targetAudience.demographic.ageRange.1')}
              type="number"
              min="13"
              max="100"
              placeholder="Max"
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Income Level
          </label>
          <select
            {...register('targetAudience.demographic.income')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Any</option>
            {DEMOGRAPHIC_OPTIONS.income.map((income) => (
              <option key={income} value={income}>{income}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Devices */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Devices
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              {...register('targetAudience.device.desktop')}
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Desktop</span>
          </label>
          <label className="flex items-center">
            <input
              {...register('targetAudience.device.mobile')}
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Mobile</span>
          </label>
          <label className="flex items-center">
            <input
              {...register('targetAudience.device.tablet')}
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Tablet</span>
          </label>
        </div>
      </div>

      {/* Geographic */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Countries
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {GEOGRAPHIC_OPTIONS.countries.map((country) => (
            <label key={country} className="flex items-center">
              <input
                type="checkbox"
                {...register('targetAudience.geographic.countries')}
                value={country}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">{country}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Behavioral */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Behavioral Targeting</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              {...register('targetAudience.behavior.newUsers')}
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">New Users Only</span>
          </label>
          
          <label className="flex items-center">
            <input
              {...register('targetAudience.behavior.returningUsers')}
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Returning Users</span>
          </label>
          
          <label className="flex items-center">
            <input
              {...register('targetAudience.behavior.highValue')}
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">High Value Users</span>
          </label>
        </div>
      </div>
    </div>
  );
};

const MetricsStep: React.FC<any> = ({ 
  register, 
  control, 
  errors, 
  metricFields, 
  appendMetric, 
  removeMetric,
  setValue,
  watch 
}) => {
  const metrics = watch('metrics');
  const [customMetricType, setCustomMetricType] = useState('');

  const addMetric = () => {
    const newMetric = {
      id: `metric_${Date.now()}`,
      name: 'New Metric',
      type: 'conversion',
      eventName: '',
      aggregation: 'percentage',
      isPrimary: false,
      unit: '',
    };
    appendMetric(newMetric);
  };

  const addPredefinedMetric = (type: string) => {
    const predefinedMetrics = {
      conversion: { name: 'Conversion Rate', eventName: 'conversion', aggregation: 'percentage', unit: '%' },
      revenue: { name: 'Revenue', eventName: 'purchase', aggregation: 'sum', unit: '$' },
      engagement: { name: 'Time on Page', eventName: 'engagement', aggregation: 'average', unit: 'seconds' },
      retention: { name: 'Retention Rate', eventName: 'return_visit', aggregation: 'percentage', unit: '%' },
    };

    const metric = predefinedMetrics[type as keyof typeof predefinedMetrics];
    if (metric) {
      const newMetric = {
        id: `metric_${Date.now()}`,
        name: metric.name,
        type: type as any,
        eventName: metric.eventName,
        aggregation: metric.aggregation as any,
        isPrimary: false,
        unit: metric.unit,
      };
      appendMetric(newMetric);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Success Metrics</h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose what to measure and how to measure it
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => addPredefinedMetric('conversion')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
          >
            Add Conversion
          </button>
          <button
            type="button"
            onClick={() => addPredefinedMetric('revenue')}
            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
          >
            Add Revenue
          </button>
          <button
            type="button"
            onClick={() => addPredefinedMetric('engagement')}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
          >
            Add Engagement
          </button>
          <button
            type="button"
            onClick={addMetric}
            className="flex items-center px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Custom
          </button>
        </div>
      </div>

      {metrics.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
          <p>No metrics defined yet</p>
          <p className="text-sm">Add metrics to define what success looks like</p>
        </div>
      )}

      <div className="space-y-4">
        {metricFields.map((field, index) => (
          <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{metrics[index]?.name}</h4>
                {metrics[index]?.isPrimary && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setValue(`metrics.${index}.isPrimary`, !metrics[index]?.isPrimary)}
                  className={`px-2 py-1 text-xs rounded ${
                    metrics[index]?.isPrimary
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {metrics[index]?.isPrimary ? 'Primary' : 'Secondary'}
                </button>
                {metricFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMetric(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metric Name
                </label>
                <input
                  {...register(`metrics.${index}.name`)}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  {...register(`metrics.${index}.type`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="conversion">Conversion</option>
                  <option value="revenue">Revenue</option>
                  <option value="engagement">Engagement</option>
                  <option value="retention">Retention</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aggregation
                </label>
                <select
                  {...register(`metrics.${index}.aggregation`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="sum">Sum</option>
                  <option value="average">Average</option>
                  <option value="count">Count</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name
                </label>
                <input
                  {...register(`metrics.${index}.eventName`)}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., conversion, purchase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit (Optional)
                </label>
                <input
                  {...register(`metrics.${index}.unit`)}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., %, $, seconds"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Value (Optional)
              </label>
              <input
                {...register(`metrics.${index}.targetValue`)}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Target value for this metric"
              />
            </div>
          </div>
        ))}
      </div>

      {metrics.filter((m: any) => m.isPrimary).length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">No Primary Metric</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please set at least one metric as primary to define the main success criteria.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatisticalStep: React.FC<any> = ({ register, errors, previewData, watchedValues }) => {
  const settings = watchedValues.statisticalSettings;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Statistical Settings</h3>
        <p className="text-sm text-gray-600">
          Configure the statistical parameters for your test
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Sample Size *
          </label>
          <input
            {...register('statisticalSettings.minimumSampleSize')}
            type="number"
            min="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum number of visitors per variant
          </p>
          {errors.statisticalSettings?.minimumSampleSize && (
            <p className="text-sm text-red-600 mt-1">
              {errors.statisticalSettings.minimumSampleSize.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confidence Level (%)
          </label>
          <select
            {...register('statisticalSettings.confidenceLevel')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value={80}>80%</option>
            <option value={90}>90%</option>
            <option value={95}>95% (Recommended)</option>
            <option value={99}>99%</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Higher confidence requires larger sample sizes
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statistical Power (%)
          </label>
          <select
            {...register('statisticalSettings.statisticalPower')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value={70}>70%</option>
            <option value={80}>80% (Recommended)</option>
            <option value={90}>90%</option>
            <option value={95}>95%</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Probability of detecting a true effect
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Detectable Effect (%)
          </label>
          <input
            {...register('statisticalSettings.minDetectableEffect')}
            type="number"
            min="1"
            max="50"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Smallest effect size you want to detect
          </p>
        </div>
      </div>

      {/* Sample Size Calculation */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Sample Size Recommendations</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700">Per Variant:</span>
            <span className="font-medium text-blue-900 ml-2">
              {settings?.minimumSampleSize?.toLocaleString() || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Total Required:</span>
            <span className="font-medium text-blue-900 ml-2">
              {((settings?.minimumSampleSize || 0) * 2).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-blue-700">Est. Duration:</span>
            <span className="font-medium text-blue-900 ml-2">
              {previewData?.estimatedDuration || 'N/A'} days
            </span>
          </div>
        </div>
      </div>

      {/* Statistical Guidance */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Statistical Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 95% confidence level is industry standard for most tests</li>
          <li>• 80% statistical power balances detection ability with sample size requirements</li>
          <li>• Higher confidence and power require larger sample sizes</li>
          <li>• Consider minimum detectable effect based on business impact</li>
        </ul>
      </div>
    </div>
  );
};

const ScheduleStep: React.FC<any> = ({ register, errors, watchedValues }) => {
  const schedule = watchedValues.schedule;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Test Schedule</h3>
        <p className="text-sm text-gray-600">
          Configure when to run the test and auto-start/stop settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            {...register('schedule.startDate')}
            type="date"
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          {errors.schedule?.startDate && (
            <p className="text-sm text-red-600 mt-1">
              {errors.schedule.startDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date (Optional)
          </label>
          <input
            {...register('schedule.endDate')}
            type="date"
            min={schedule?.startDate || new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty for manual stop
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            {...register('schedule.timezone')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">GMT</option>
            <option value="Europe/Paris">CET</option>
            <option value="Asia/Tokyo">JST</option>
          </select>
        </div>
      </div>

      {/* Auto Actions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Auto Actions</h4>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              {...register('schedule.autoStart')}
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Auto-start test at scheduled time
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              {...register('schedule.autoStop')}
              type="checkbox"
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Auto-stop test at end date
            </span>
          </label>
        </div>
      </div>

      {/* Schedule Preview */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <h4 className="text-sm font-medium text-indigo-900 mb-2">Schedule Preview</h4>
        <div className="text-sm text-indigo-700 space-y-1">
          <div>
            <span className="font-medium">Starts:</span> {schedule?.startDate || 'Not set'}
          </div>
          <div>
            <span className="font-medium">Ends:</span> {schedule?.endDate || 'Manual stop'}
          </div>
          <div>
            <span className="font-medium">Timezone:</span> {schedule?.timezone || 'UTC'}
          </div>
          <div>
            <span className="font-medium">Auto-start:</span> {schedule?.autoStart ? 'Enabled' : 'Disabled'}
          </div>
          <div>
            <span className="font-medium">Auto-stop:</span> {schedule?.autoStop ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewStep: React.FC<any> = ({ register, errors, watchedValues, control }) => {
  const test = watchedValues;
  const totalTraffic = test.variants?.reduce((sum: number, v: any) => sum + v.trafficAllocation, 0) || 0;
  const primaryMetrics = test.metrics?.filter((m: any) => m.isPrimary) || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Review & Confirm</h3>
        <p className="text-sm text-gray-600">
          Review all test settings before creating your A/B test
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Test Info</h4>
          <p className="text-xs text-blue-700">{test.name}</p>
          <p className="text-xs text-blue-600 mt-1">{test.category}</p>
        </div>
        
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-1">Variants</h4>
          <p className="text-xs text-green-700">{test.variants?.length || 0} variants</p>
          <p className="text-xs text-green-600 mt-1">{totalTraffic}% traffic allocated</p>
        </div>
        
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900 mb-1">Metrics</h4>
          <p className="text-xs text-purple-700">{test.metrics?.length || 0} metrics</p>
          <p className="text-xs text-purple-600 mt-1">{primaryMetrics.length} primary</p>
        </div>
        
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="text-sm font-medium text-orange-900 mb-1">Audience</h4>
          <p className="text-xs text-orange-700">{test.targetAudience?.percentage || 100}% eligible</p>
          <p className="text-xs text-orange-600 mt-1">
            {Object.values(test.targetAudience?.device || {}).filter(Boolean).length} devices
          </p>
        </div>
      </div>

      {/* Detailed Review */}
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{test.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Category:</span>
              <span className="ml-2 font-medium">{test.category}</span>
            </div>
            <div>
              <span className="text-gray-600">Priority:</span>
              <span className="ml-2 font-medium capitalize">{test.priority}</span>
            </div>
            <div>
              <span className="text-gray-600">Hypothesis:</span>
              <span className="ml-2 font-medium">{test.hypothesis}</span>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Variants & Traffic</h4>
          <div className="space-y-2">
            {test.variants?.map((variant: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: variant.color }}
                  />
                  <span className="font-medium">{variant.name}</span>
                  {variant.isControl && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      Control
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600">{variant.trafficAllocation}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Statistical Settings */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Statistical Settings</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Sample Size:</span>
              <span className="ml-2 font-medium">{test.statisticalSettings?.minimumSampleSize}</span>
            </div>
            <div>
              <span className="text-gray-600">Confidence:</span>
              <span className="ml-2 font-medium">{test.statisticalSettings?.confidenceLevel}%</span>
            </div>
            <div>
              <span className="text-gray-600">Power:</span>
              <span className="ml-2 font-medium">{test.statisticalSettings?.statisticalPower}%</span>
            </div>
            <div>
              <span className="text-gray-600">MDE:</span>
              <span className="ml-2 font-medium">{test.statisticalSettings?.minDetectableEffect}%</span>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Schedule</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Start Date:</span>
              <span className="ml-2 font-medium">{test.schedule?.startDate || 'Not set'}</span>
            </div>
            <div>
              <span className="text-gray-600">End Date:</span>
              <span className="ml-2 font-medium">{test.schedule?.endDate || 'Manual'}</span>
            </div>
            <div>
              <span className="text-gray-600">Timezone:</span>
              <span className="ml-2 font-medium">{test.schedule?.timezone || 'UTC'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Final Checklist */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="text-sm font-medium text-green-900 mb-2">Pre-Launch Checklist</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-green-700">Test configuration is complete</span>
          </div>
          <div className="flex items-center">
            <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-green-700">Statistical parameters are configured</span>
          </div>
          <div className="flex items-center">
            <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-green-700">Success metrics are defined</span>
          </div>
          <div className="flex items-center">
            <CheckIcon className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-green-700">Target audience is configured</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTest;
