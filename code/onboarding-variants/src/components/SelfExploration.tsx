import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Users, TrendingUp, Zap, ChevronLeft } from 'lucide-react';
import { OnboardingStep } from '../types';
import { Button, Card } from './ui';
import { ProgressIndicator } from './ProgressIndicator';
import { SocialProof } from './SocialProof';
import { cn } from '../lib/utils';

interface SelfExplorationProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  showSocialProof?: boolean;
  allowFreeNavigation?: boolean;
}

export const SelfExploration: React.FC<SelfExplorationProps> = ({
  steps,
  onComplete,
  showSocialProof = true,
  allowFreeNavigation = true
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(steps[0] || null);

  const toggleStep = (index: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
    setVisitedSteps(prev => new Set([...prev, index]));
    setCurrentStep(steps[index]);
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'analytics': return <TrendingUp className="w-6 h-6" />;
      case 'automation': return <Zap className="w-6 h-6" />;
      case 'growth': return <Users className="w-6 h-6" />;
      default: return <TrendingUp className="w-6 h-6" />;
    }
  };

  const getStepColor = (stepId: string) => {
    switch (stepId) {
      case 'analytics': return 'from-blue-500 to-blue-600';
      case 'automation': return 'from-purple-500 to-purple-600';
      case 'growth': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const progress = (visitedSteps.size / steps.length) * 100;
  const canComplete = visitedSteps.size >= Math.ceil(steps.length * 0.7); // 70% of steps

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Explore at Your Own Pace
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Click on any section below to learn more about GrowthHub's features
            </p>
            
            {/* Progress Tracking */}
            <div className="max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{visitedSteps.size} of {steps.length} explored</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress >= 70 && (
                <p className="text-green-600 text-sm font-medium">
                  ✅ You're ready to get started!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Interactive Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Your Path</h2>
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const isExpanded = expandedSteps.has(index);
                  const isVisited = visitedSteps.has(index);
                  const isActive = currentStep?.id === step.id;

                  return (
                    <div key={step.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleStep(index)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 text-left transition-all",
                          isActive
                            ? "bg-blue-50 border-blue-200"
                            : "hover:bg-gray-50",
                          isVisited && "bg-green-50 border-green-200"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-r",
                            getStepColor(step.id)
                          )}>
                            {getStepIcon(step.id)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{step.title}</h3>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isVisited && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Key Features:</h4>
                              <ul className="space-y-1">
                                {step.features.slice(0, 3).map((feature, i) => (
                                  <li key={i} className="flex items-center space-x-2 text-sm">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                                    <span className="text-gray-700">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {showSocialProof && step.socialProof && (
                              <div className="bg-white p-3 rounded-lg border">
                                <p className="text-sm italic text-gray-700 mb-2">
                                  "{step.socialProof.text}"
                                </p>
                                <p className="text-xs text-gray-600">
                                  - {step.socialProof.author}, {step.socialProof.company}
                                </p>
                              </div>
                            )}

                            <Button
                              size="sm"
                              onClick={() => {
                                setCurrentStep(step);
                                setVisitedSteps(prev => new Set([...prev, index]));
                              }}
                              className="w-full"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {canComplete && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-green-600 font-medium mb-3">
                      🎉 You've explored enough to get started!
                    </p>
                    <Button onClick={onComplete} className="w-full">
                      Start Growing Now
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Side - Detailed View */}
          <div className="lg:col-span-2">
            {currentStep ? (
              <div className="space-y-8">
                {/* Main Content */}
                <Card className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center text-white bg-gradient-to-r",
                      getStepColor(currentStep.id)
                    )}>
                      {getStepIcon(currentStep.id)}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{currentStep.title}</h1>
                      <p className="text-lg text-gray-600">{currentStep.description}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Features</h3>
                      <ul className="space-y-3">
                        {currentStep.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h3>
                      <ul className="space-y-3">
                        {currentStep.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                {/* Visual Demo */}
                <Card className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                  <h3 className="text-2xl font-bold mb-6 text-center">See It In Action</h3>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                      <h4 className="font-semibold mb-2">Real-time Metrics</h4>
                      <p className="text-sm text-gray-300">
                        Track performance as it happens
                      </p>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                      <Zap className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                      <h4 className="font-semibold mb-2">Instant Insights</h4>
                      <p className="text-sm text-gray-300">
                        Get actionable recommendations
                      </p>
                    </div>
                    
                    <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                      <Users className="w-8 h-8 mx-auto mb-3 text-green-400" />
                      <h4 className="font-semibold mb-2">Audience Growth</h4>
                      <p className="text-sm text-gray-300">
                        Build and engage your community
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Social Proof */}
                {showSocialProof && currentStep.socialProof && (
                  <SocialProof
                    content={currentStep.socialProof}
                    position="top"
                  />
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const currentIndex = steps.findIndex(s => s.id === currentStep.id);
                      if (currentIndex > 0) {
                        setCurrentStep(steps[currentIndex - 1]);
                      }
                    }}
                    disabled={steps.findIndex(s => s.id === currentStep.id) === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <span className="text-sm text-gray-600">
                    Step {steps.findIndex(s => s.id === currentStep.id) + 1} of {steps.length}
                  </span>

                  <Button
                    onClick={() => {
                      const currentIndex = steps.findIndex(s => s.id === currentStep.id);
                      if (currentIndex < steps.length - 1) {
                        setCurrentStep(steps[currentIndex + 1]);
                      }
                    }}
                    disabled={steps.findIndex(s => s.id === currentStep.id) === steps.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Start Exploring
                </h2>
                <p className="text-gray-600 mb-8">
                  Click on any section in the navigation to learn about GrowthHub's features
                </p>
                <Button onClick={() => setCurrentStep(steps[0])}>
                  Start with Analytics
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};