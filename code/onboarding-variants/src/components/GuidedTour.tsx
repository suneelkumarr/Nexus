import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, Play, Users, TrendingUp, Zap } from 'lucide-react';
import { OnboardingStep } from '../types';
import { Button, Card } from './ui';
import { ProgressIndicator } from './ProgressIndicator';
import { SocialProof, StarRating } from './SocialProof';
import { cn } from '../lib/utils';

interface GuidedTourProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  showSocialProof?: boolean;
  showProgress?: boolean;
  autoAdvance?: boolean;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  onComplete,
  showSocialProof = true,
  showProgress = true,
  autoAdvance = false
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const startAutoPlay = () => {
    setIsPlaying(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    const advanceStep = () => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        timeoutRef.current = setTimeout(advanceStep, 3000);
      } else {
        setIsPlaying(false);
        onComplete();
      }
    };
    
    timeoutRef.current = setTimeout(advanceStep, 3000);
  };

  const stopAutoPlay = () => {
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'analytics': return <TrendingUp className="w-6 h-6" />;
      case 'automation': return <Zap className="w-6 h-6" />;
      case 'growth': return <Users className="w-6 h-6" />;
      default: return <Play className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Welcome to GrowthHub</h1>
              <Badge variant="success">Interactive Tour</Badge>
            </div>
            {showProgress && (
              <div className="flex items-center space-x-4">
                <ProgressIndicator 
                  currentStep={currentStepIndex + 1} 
                  totalSteps={steps.length}
                  variant="bar"
                />
                <span className="text-sm text-gray-600">
                  {currentStepIndex + 1} of {steps.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            {/* Step Header */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                  {getStepIcon(currentStep.id)}
                </div>
                <div className="text-sm font-medium text-blue-600">
                  Step {currentStepIndex + 1}
                </div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {currentStep.title}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Auto-play Controls */}
            <div className="flex items-center justify-center lg:justify-start space-x-4">
              {!isPlaying ? (
                <Button onClick={startAutoPlay} variant="ghost" className="space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Auto-play Tour</span>
                </Button>
              ) : (
                <Button onClick={stopAutoPlay} variant="ghost" className="space-x-2">
                  <span>⏸ Pause</span>
                </Button>
              )}
            </div>

            {/* Features List */}
            <Card className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What you'll learn:</h3>
              <ul className="space-y-3">
                {currentStep.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Social Proof */}
            {showSocialProof && currentStep.socialProof && (
              <SocialProof
                content={currentStep.socialProof}
                position="top"
                className="animate-in slide-in-from-left-4 duration-500"
              />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6">
              <Button
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                variant="ghost"
                className="space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStepIndex(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      index === currentStepIndex
                        ? "bg-blue-600"
                        : index < currentStepIndex
                        ? "bg-blue-300"
                        : "bg-gray-300"
                    )}
                  />
                ))}
              </div>

              <Button onClick={nextStep} className="space-x-2">
                <span>
                  {currentStepIndex === steps.length - 1 ? 'Get Started' : 'Next'}
                </span>
                {currentStepIndex < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className="lg:pl-8">
            <div className="relative">
              {/* Main Visual */}
              <Card className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                    {getStepIcon(currentStep.id)}
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-4">Live Dashboard Preview</h3>
                  <p className="text-center text-blue-100 mb-6">
                    See your analytics come to life in real-time
                  </p>
                  
                  {/* Mock Dashboard Elements */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-4">
                      <span>Total Engagement</span>
                      <span className="text-2xl font-bold">+234%</span>
                    </div>
                    <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-4">
                      <span>Followers Growth</span>
                      <span className="text-2xl font-bold">+156%</span>
                    </div>
                    <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-4">
                      <span>Best Time to Post</span>
                      <span className="font-semibold">2:00 PM</span>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-pulse" />
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white bg-opacity-10 rounded-full animate-pulse delay-100" />
                <div className="absolute top-1/2 left-4 w-8 h-8 bg-white bg-opacity-10 rounded-full animate-pulse delay-200" />
              </Card>

              {/* Floating Social Proof */}
              {showSocialProof && (
                <SocialProof
                  content={{
                    text: "💯 Loved the interactive tour! Made everything crystal clear.",
                    author: "Alex Thompson",
                    company: "Marketing Director"
                  }}
                  position="floating"
                  className="animate-in zoom-in duration-700"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Badge({ children, variant }: { children: React.ReactNode; variant?: string }) {
  const variantClasses = {
    success: "bg-green-100 text-green-800 border-green-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    default: "bg-gray-100 text-gray-800 border-gray-200"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
        variantClasses[variant as keyof typeof variantClasses] || variantClasses.default
      )}
    >
      {children}
    </span>
  );
}