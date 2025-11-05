import React, { useState } from 'react';
import { TrendingUp, Zap, Users, Database, Settings, BarChart3, Target, CheckCircle } from 'lucide-react';
import { OnboardingStep } from '../types';
import { Button, Card, Badge } from './ui';
import { SocialProof } from './SocialProof';
import { cn } from '../lib/utils';

interface FeatureFocusedProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  showSocialProof?: boolean;
  detailedFeatures?: boolean;
}

export const FeatureFocused: React.FC<FeatureFocusedProps> = ({
  steps,
  onComplete,
  showSocialProof = true,
  detailedFeatures = true
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedFeatures, setCompletedFeatures] = useState<Set<string>>(new Set());
  
  const currentStep = steps[activeStep];

  const featureDetails = {
    analytics: {
      icon: <TrendingUp className="w-6 h-6" />,
      color: "blue",
      metrics: [
        { name: "Real-time Data", value: "< 30s delay", description: "Live data processing" },
        { name: "Data Points", value: "50M+", description: "Posts analyzed daily" },
        { name: "Accuracy", value: "99.9%", description: "Verified accuracy rate" },
        { name: "Integrations", value: "25+", description: "Third-party APIs" }
      ],
      technicalSpecs: [
        "Advanced machine learning algorithms",
        "Multi-platform data aggregation",
        "Real-time event processing",
        "Distributed analytics engine"
      ]
    },
    automation: {
      icon: <Zap className="w-6 h-6" />,
      color: "purple",
      metrics: [
        { name: "Tasks Automated", value: "100K+", description: "Actions daily" },
        { name: "Time Saved", value: "15-20h/week", description: "Per user average" },
        { name: "Success Rate", value: "94.7%", description: "Task completion" },
        { name: "AI Accuracy", value: "96%", description: "Decision accuracy" }
      ],
      technicalSpecs: [
        "Intelligent scheduling algorithms",
        "Natural language processing",
        "Behavioral pattern analysis",
        "Cloud-based automation engine"
      ]
    },
    growth: {
      icon: <Users className="w-6 h-6" />,
      color: "green",
      metrics: [
        { name: "Growth Rate", value: "340%", description: "Average increase" },
        { name: "Engagement", value: "250%", description: "Boost in interactions" },
        { name: "Reach", value: "180%", description: "Organic reach growth" },
        { name: "ROI", value: "420%", description: "Return on investment" }
      ],
      technicalSpecs: [
        "Predictive growth modeling",
        "Influencer network mapping",
        "Content virality scoring",
        "Audience segmentation AI"
      ]
    }
  };

  const currentFeatures = featureDetails[currentStep.id as keyof typeof featureDetails];

  const toggleFeatureCompletion = (featureName: string) => {
    const newCompleted = new Set(completedFeatures);
    if (newCompleted.has(featureName)) {
      newCompleted.delete(featureName);
    } else {
      newCompleted.add(featureName);
    }
    setCompletedFeatures(newCompleted);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-600",
        bgLight: "bg-blue-100",
        text: "text-blue-600",
        border: "border-blue-200"
      },
      purple: {
        bg: "bg-purple-600",
        bgLight: "bg-purple-100", 
        text: "text-purple-600",
        border: "border-purple-200"
      },
      green: {
        bg: "bg-green-600",
        bgLight: "bg-green-100",
        text: "text-green-600", 
        border: "border-green-200"
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const colors = getColorClasses(currentFeatures.color);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Technical Features Overview
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Detailed feature specifications and capabilities
              </p>
            </div>
            <Badge variant="info">Feature-Focused</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Navigation */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const stepColors = getColorClasses(featureDetails[step.id as keyof typeof featureDetails]?.color || 'blue');
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={cn(
                  "flex items-center space-x-3 px-6 py-3 rounded-lg border transition-all whitespace-nowrap",
                  activeStep === index
                    ? `${stepColors.bg} text-white border-transparent`
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                )}
              >
                {featureDetails[step.id as keyof typeof featureDetails]?.icon}
                <span className="font-medium">{step.title}</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Feature Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Feature Card */}
            <Card className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center text-white", colors.bg)}>
                  {currentFeatures.icon}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{currentStep.title}</h2>
                  <p className="text-lg text-gray-600">{currentStep.description}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {currentFeatures.metrics.map((metric, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {metric.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {metric.description}
                    </div>
                  </div>
                ))}
              </div>

              {/* Technical Specifications */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Technical Specifications
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentFeatures.technicalSpecs.map((spec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Interactive Feature Checklist */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Feature Checklist - Explore Each Capability
              </h3>
              <div className="space-y-4">
                {currentStep.features.map((feature, index) => {
                  const isCompleted = completedFeatures.has(feature);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start space-x-4 p-4 border rounded-lg cursor-pointer transition-all",
                        isCompleted
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                      onClick={() => toggleFeatureCompletion(feature)}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                        isCompleted
                          ? "border-green-500 bg-green-500"
                          : "border-gray-300"
                      )}>
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{feature}</h4>
                        <p className="text-sm text-gray-600">
                          {detailedFeatures ? 
                            `Advanced ${feature.toLowerCase()} with enterprise-grade reliability and performance.` :
                            `Key capability for ${currentStep.title.toLowerCase()}`
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Social Proof */}
            {showSocialProof && currentStep.socialProof && (
              <SocialProof
                content={currentStep.socialProof}
                position="top"
              />
            )}
          </div>

          {/* Right Side - Additional Information */}
          <div className="space-y-6">
            {/* Feature Statistics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Performance Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-semibold text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold text-green-600">&lt;200ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data Security</span>
                  <span className="font-semibold text-green-600">SOC 2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">API Rate Limit</span>
                  <span className="font-semibold text-blue-600">10K/min</span>
                </div>
              </div>
            </Card>

            {/* Integration Status */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                API Integration
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Instagram Graph API</span>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Meta Business API</span>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Analytics APIs</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Automation APIs</span>
                  <Badge variant="success">Ready</Badge>
                </div>
              </div>
            </Card>

            {/* Next Steps */}
            <Card className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Next Steps
              </h3>
              <p className="text-gray-600 mb-4">
                Explore all features to unlock full capabilities
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{completedFeatures.size} / {currentStep.features.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn("h-2 rounded-full transition-all", colors.bg)}
                    style={{ 
                      width: `${(completedFeatures.size / currentStep.features.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <Button 
                className="w-full"
                disabled={completedFeatures.size < currentStep.features.length * 0.8}
                onClick={() => {
                  if (activeStep < steps.length - 1) {
                    setActiveStep(activeStep + 1);
                  } else {
                    onComplete();
                  }
                }}
              >
                {activeStep < steps.length - 1 ? 'Next Feature' : 'Get Started'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};