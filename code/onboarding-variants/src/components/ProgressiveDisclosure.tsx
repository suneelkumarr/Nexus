import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Lock, Unlock, CheckCircle, Zap, TrendingUp, Users } from 'lucide-react';
import { OnboardingStep } from '../types';
import { Button, Card } from './ui';
import { SocialProof } from './SocialProof';
import { cn } from '../lib/utils';

interface ProgressiveDisclosureProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  showSocialProof?: boolean;
  revealSpeed?: 'fast' | 'medium' | 'slow';
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  steps,
  onComplete,
  showSocialProof = true,
  revealSpeed = 'medium'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [unlockedSections, setUnlockedSections] = useState<Set<number>>(new Set([0]));
  const [revealedContent, setRevealedContent] = useState<Set<string>>(new Set());
  const [isRevealing, setIsRevealing] = useState(false);

  const step = steps[currentStep];
  const revealTimeouts = {
    fast: 300,
    medium: 600,
    slow: 1000
  };

  const sectionTypes = ['overview', 'features', 'benefits', 'proof', 'action'];

  useEffect(() => {
    // Auto-reveal content sections sequentially
    const revealNextSection = (index: number) => {
      if (index >= sectionTypes.length) return;

      const sectionType = sectionTypes[index];
      const timeoutKey = `section_${currentStep}_${sectionType}`;
      
      setTimeout(() => {
        setRevealedContent(prev => new Set([...prev, timeoutKey]));
        if (showSocialProof && sectionType === 'proof') {
          // Reveal social proof after a short delay
          setTimeout(() => {
            setRevealedContent(prev => new Set([...prev, `social_${currentStep}`]));
          }, 300);
        }
        revealNextSection(index + 1);
      }, revealTimeouts[revealSpeed] * (index + 1));
    };

    // Reset and start revealing when step changes
    setRevealedContent(new Set());
    revealNextSection(0);
  }, [currentStep, revealSpeed, showSocialProof]);

  const unlockSection = (sectionIndex: number) => {
    if (sectionIndex <= Math.max(...unlockedSections)) {
      setUnlockedSections(prev => new Set([...prev, sectionIndex]));
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setUnlockedSections(prev => new Set([...prev, currentStep + 1]));
    } else {
      onComplete();
    }
  };

  const isContentVisible = (sectionType: string) => {
    return revealedContent.has(`section_${currentStep}_${sectionType}`);
  };

  const isSocialProofVisible = () => {
    return revealedContent.has(`social_${currentStep}`);
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'analytics': return <TrendingUp className="w-6 h-6" />;
      case 'automation': return <Zap className="w-6 h-6" />;
      case 'growth': return <Users className="w-6 h-6" />;
      default: return <TrendingUp className="w-6 h-6" />;
    }
  };

  const sectionColors = {
    overview: 'from-blue-500 to-blue-600',
    features: 'from-purple-500 to-purple-600', 
    benefits: 'from-green-500 to-green-600',
    proof: 'from-yellow-500 to-yellow-600',
    action: 'from-red-500 to-red-600'
  };

  const sectionTitles = {
    overview: 'What is this?',
    features: 'How does it work?',
    benefits: 'Why should you care?',
    proof: 'Who else is using it?',
    action: 'Ready to get started?'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Step Progress */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Discover {step.title}
            </h1>
            <p className="text-gray-600">
              Let's explore this step by step...
            </p>
          </div>

          {/* Step Progress */}
          <div className="flex items-center justify-center space-x-4">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    index === currentStep
                      ? "bg-blue-600 text-white scale-110"
                      : index < currentStep
                      ? "bg-green-600 text-white"
                      : unlockedSections.has(index)
                      ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                  disabled={!unlockedSections.has(index)}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-8 h-1 mx-2 rounded-full",
                    index < currentStep ? "bg-green-300" : "bg-gray-300"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Overview Section */}
          <Card className={cn(
            "p-8 transition-all duration-500",
            isContentVisible('overview') ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
                {getStepIcon(step.id)}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                <p className="text-lg text-gray-600">{step.description}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Overview</h3>
              <p className="text-blue-800">
                This feature is designed to help you {step.benefits[0].toLowerCase()} 
                through advanced automation and intelligent insights.
              </p>
            </div>
          </Card>

          {/* Features Section */}
          <Card className={cn(
            "p-8 transition-all duration-500",
            isContentVisible('features') ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{sectionTitles.features}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {step.features.map((feature, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-start space-x-3 p-4 border border-gray-200 rounded-lg transition-all duration-500",
                    isContentVisible('features') ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  )}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">🔧 How it Works</h4>
              <p className="text-purple-800">
                Our AI-powered system analyzes your content patterns and audience behavior 
                to automatically optimize performance and deliver insights that matter.
              </p>
            </div>
          </Card>

          {/* Benefits Section */}
          <Card className={cn(
            "p-8 transition-all duration-500",
            isContentVisible('benefits') ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{sectionTitles.benefits}</h3>
            </div>

            <div className="space-y-4">
              {step.benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className={cn(
                    "flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg transition-all duration-500",
                    isContentVisible('benefits') ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                  )}
                  style={{ transitionDelay: `${index * 300}ms` }}
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">{benefit}</h4>
                    <p className="text-green-700 text-sm">
                      {index === 0 && "Save valuable time and focus on what matters most"}
                      {index === 1 && "Leverage data to make smarter content decisions"}
                      {index === 2 && "Build sustainable growth that lasts"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Social Proof Section */}
          {showSocialProof && step.socialProof && (
            <Card className={cn(
              "p-8 transition-all duration-500",
              isSocialProofVisible() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{sectionTitles.proof}</h3>
              </div>

              <SocialProof
                content={step.socialProof}
                position="top"
              />
            </Card>
          )}

          {/* Action Section */}
          <Card className={cn(
            "p-8 transition-all duration-500",
            isContentVisible('action') ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white mx-auto mb-6">
                <span className="text-2xl">🚀</span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {sectionTitles.action}
              </h3>
              
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You've learned about {step.title}. Ready to unlock the next level of Instagram growth?
              </p>

              <div className="flex justify-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (currentStep > 0) {
                      setCurrentStep(prev => prev - 1);
                    }
                  }}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                <Button onClick={nextStep}>
                  {currentStep < steps.length - 1 ? (
                    <>
                      Continue to {steps[currentStep + 1].title}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    'Start Growing Now!'
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Progress Indicator */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Section {Object.values(sectionTitles).findIndex(title => 
                !isContentVisible(Object.keys(sectionTitles).find(key => sectionTitles[key as keyof typeof sectionTitles] === title))
              ) + 1} of {sectionTitles.length} revealed
            </p>
            <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${(Array.from(revealedContent).filter(content => content.startsWith(`section_${currentStep}`)).length / sectionTypes.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};