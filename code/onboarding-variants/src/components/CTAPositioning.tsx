import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, Users, ArrowRight, CheckCircle, Star, Clock, Target } from 'lucide-react';
import { OnboardingStep } from '../types';
import { Button, Card, Badge } from './ui';
import { cn } from '../lib/utils';

interface CTAPositioningProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  positioning?: 'early' | 'balanced' | 'late';
  ctaStyle?: 'prominent' | 'subtle' | 'progressive' | 'contextual';
  showProgress?: boolean;
}

export const CTAPositioning: React.FC<CTAPositioningProps> = ({
  steps,
  onComplete,
  positioning = 'balanced',
  ctaStyle = 'prominent',
  showProgress = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [timeOnPage, setTimeOnPage] = useState(0);
  const [showCTA, setShowCTA] = useState(false);

  const step = steps[currentStep];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOnPage(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Determine when to show CTA based on positioning strategy
    const totalSteps = steps.length;
    let triggerStep = 0;
    
    switch (positioning) {
      case 'early':
        triggerStep = Math.floor(totalSteps * 0.3); // Show after 30% progress
        break;
      case 'balanced':
        triggerStep = Math.floor(totalSteps * 0.6); // Show after 60% progress
        break;
      case 'late':
        triggerStep = totalSteps - 1; // Show only at the end
        break;
    }

    // Show CTA based on step progress or time on page
    if (currentStep >= triggerStep || timeOnPage > 30) {
      setShowCTA(true);
    }
  }, [currentStep, steps.length, positioning, timeOnPage]);

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'analytics': return <TrendingUp className="w-6 h-6" />;
      case 'automation': return <Zap className="w-6 h-6" />;
      case 'growth': return <Users className="w-6 h-6" />;
      default: return <TrendingUp className="w-6 h-6" />;
    }
  };

  const getCTAButton = (context: 'header' | 'content' | 'sidebar' | 'footer') => {
    const ctaVariants = {
      prominent: (
        <Button 
          onClick={onComplete}
          size="lg"
          className={cn(
            "bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all",
            context === 'header' && "animate-pulse",
            context === 'content' && "w-full",
            context === 'sidebar' && "w-full"
          )}
        >
          Start Free Trial
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      ),
      subtle: (
        <Button 
          onClick={onComplete}
          variant="ghost"
          className={cn(
            "text-gray-600 hover:text-gray-900",
            context === 'header' && "text-sm",
            context === 'sidebar' && "w-full"
          )}
        >
          Get Started
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      ),
      progressive: (
        <div className="space-y-2">
          <Button 
            onClick={onComplete}
            className={cn(
              "bg-blue-600 hover:bg-blue-700",
              context === 'content' && "w-full",
              context === 'sidebar' && "w-full"
            )}
          >
            Continue Learning
          </Button>
          <Button 
            onClick={onComplete}
            variant="ghost"
            size="sm"
            className="w-full text-xs"
          >
            Skip to Start Free Trial
          </Button>
        </div>
      ),
      contextual: (
        <Button 
          onClick={onComplete}
          className={cn(
            "bg-green-600 hover:bg-green-700 text-white font-medium",
            context === 'content' && "w-full",
            context === 'sidebar' && "w-full"
          )}
        >
          {context === 'header' && "Try It Free"}
          {context === 'content' && "Start Growing Now"}
          {context === 'sidebar' && "Begin Your Growth Journey"}
          {context === 'footer' && "Get Started Today"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      )
    };

    return ctaVariants[ctaStyle];
  };

  const renderHeader = () => (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {step.title}
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              {step.description}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {showProgress && (
              <div className="text-sm text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </div>
            )}
            {showCTA && getCTAButton('header')}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-10">
      {showCTA && (
        <Card className={cn(
          "p-6 shadow-lg border-l-4 border-blue-600 bg-white",
          ctaStyle === 'subtle' && "bg-gray-50 border-l-gray-400",
          ctaStyle === 'progressive' && "bg-green-50 border-l-green-600",
          ctaStyle === 'contextual' && "bg-purple-50 border-l-purple-600"
        )}>
          <div className="text-center">
            <Target className="w-8 h-8 mx-auto mb-3 text-blue-600" />
            <h3 className="font-semibold text-gray-900 mb-2">Ready to Start?</h3>
            <p className="text-sm text-gray-600 mb-4">
              {positioning === 'early' && "Get started right away!"}
              {positioning === 'balanced' && "You've seen enough to begin!"}
              {positioning === 'late' && "Time to take action!"}
            </p>
            {getCTAButton('sidebar')}
          </div>
        </Card>
      )}
    </div>
  );

  const renderContent = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Content */}
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              {getStepIcon(step.id)}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
              <p className="text-lg text-gray-600">{step.description}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-3">
                {step.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h3>
              <ul className="space-y-3">
                {step.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contextual CTA in content */}
          {showCTA && (
            <Card className={cn(
              "p-6",
              ctaStyle === 'subtle' && "bg-gray-50 border border-gray-200",
              ctaStyle === 'progressive' && "bg-blue-50 border border-blue-200",
              ctaStyle === 'contextual' && "bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
            )}>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {ctaStyle === 'subtle' && "Like what you see?"}
                  {ctaStyle === 'progressive' && "Ready to implement these features?"}
                  {ctaStyle === 'contextual' && "Transform your Instagram today!"}
                  {ctaStyle === 'prominent' && "Start Growing Your Instagram!"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {ctaStyle === 'subtle' && "Join thousands of creators growing with GrowthHub"}
                  {ctaStyle === 'progressive' && "Get access to all these powerful features"}
                  {ctaStyle === 'contextual' && "See the results our users achieve"}
                  {ctaStyle === 'prominent' && "Free trial • No credit card required"}
                </p>
                {getCTAButton('content')}
              </div>
            </Card>
          )}
        </div>

        {/* Right Side - Visual */}
        <div className="space-y-6">
          <Card className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">Live Dashboard</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-4">
                <span>Engagement Rate</span>
                <span className="text-2xl font-bold text-green-400">+340%</span>
              </div>
              <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-4">
                <span>Follower Growth</span>
                <span className="text-2xl font-bold text-blue-400">+156%</span>
              </div>
              <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-4">
                <span>Time Saved</span>
                <span className="text-2xl font-bold text-yellow-400">15hrs/week</span>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{timeOnPage}s</div>
              <div className="text-sm text-gray-600">Time on page</div>
            </Card>
            <Card className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-gray-900">{currentStep + 1}</div>
              <div className="text-sm text-gray-600">Current step</div>
            </Card>
          </div>
        </div>
      </div>

      {/* Progressive CTA for multi-step */}
      {positioning !== 'late' && currentStep < steps.length - 1 && (
        <div className="flex justify-center mt-12">
          <Button
            onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
            variant="ghost"
            className="space-x-2"
          >
            <span>Continue to {steps[Math.min(currentStep + 1, steps.length - 1)].title}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderFooter = () => (
    <div className="bg-gray-900 text-white py-8 mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Transform Your Instagram Presence?
        </h2>
        <p className="text-gray-300 mb-6">
          Join thousands of creators who are already growing with GrowthHub
        </p>
        {showCTA && getCTAButton('footer')}
        
        {/* Progress indicator for late positioning */}
        {positioning === 'late' && (
          <div className="mt-8">
            <div className="flex justify-center space-x-4 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-3 h-3 rounded-full",
                    index <= currentStep ? "bg-blue-500" : "bg-gray-600"
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Positioning Strategy Info */}
      <div className="bg-blue-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Positioning: {positioning}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Style: {ctaStyle}</span>
            </div>
            {showProgress && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Progress: {Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      {renderHeader()}

      {/* Main Content */}
      {renderContent()}

      {/* Sidebar CTA */}
      {renderSidebar()}

      {/* Footer */}
      {renderFooter()}

      {/* Step Navigation (for multi-step experience) */}
      {steps.length > 1 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
          <Card className="px-6 py-3 shadow-lg">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0}
                variant="ghost"
                size="sm"
              >
                Previous
              </Button>
              
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      index === currentStep
                        ? "bg-blue-600 scale-125"
                        : index < currentStep
                        ? "bg-blue-300"
                        : "bg-gray-300"
                    )}
                  />
                ))}
              </div>
              
              <Button
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                disabled={currentStep === steps.length - 1}
                variant="ghost"
                size="sm"
              >
                Next
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};