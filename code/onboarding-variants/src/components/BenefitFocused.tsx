import React, { useState } from 'react';
import { TrendingUp, Zap, Users, Heart, DollarSign, Clock, Star, ArrowRight } from 'lucide-react';
import { OnboardingStep } from '../types';
import { Button, Card, Badge } from './ui';
import { SocialProof, StarRating } from './SocialProof';
import { cn } from '../lib/utils';

interface BenefitFocusedProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  showSocialProof?: boolean;
  emphasizeOutcomes?: boolean;
}

export const BenefitFocused: React.FC<BenefitFocusedProps> = ({
  steps,
  onComplete,
  showSocialProof = true,
  emphasizeOutcomes = true
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedBenefits, setSelectedBenefits] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  
  const currentStep = steps[activeStep];

  const benefitDetails = {
    analytics: {
      icon: <TrendingUp className="w-6 h-6" />,
      color: "blue",
      primaryBenefit: "Increase Engagement by 340%",
      outcomes: [
        {
          icon: <Heart className="w-5 h-5" />,
          title: "Higher Engagement",
          description: "Turn casual viewers into loyal followers",
          metric: "+340%",
          timeframe: "in 8 weeks"
        },
        {
          icon: <DollarSign className="w-5 h-5" />,
          title: "More Revenue",
          description: "Convert followers into paying customers",
          metric: "+250%",
          timeframe: "in 3 months"
        },
        {
          icon: <Clock className="w-5 h-5" />,
          title: "Save Time",
          description: "Make data-driven decisions instantly",
          metric: "15hrs",
          timeframe: "saved weekly"
        }
      ],
      testimonials: [
        { name: "Sarah M.", result: "Doubled my engagement in 2 months", stars: 5 },
        { name: "Mike R.", result: "Increased my business revenue by 300%", stars: 5 },
        { name: "Emily J.", result: "Finally understand what my audience wants", stars: 5 }
      ]
    },
    automation: {
      icon: <Zap className="w-6 h-6" />,
      color: "purple",
      primaryBenefit: "Save 20+ Hours Per Week",
      outcomes: [
        {
          icon: <Clock className="w-5 h-5" />,
          title: "Get Time Back",
          description: "Focus on creating, not managing",
          metric: "20hrs",
          timeframe: "saved weekly"
        },
        {
          icon: <Star className="w-5 h-5" />,
          title: "Never Miss Optimal Times",
          description: "Post when your audience is most active",
          metric: "99%",
          timeframe: "optimal timing"
        },
        {
          icon: <TrendingUp className="w-5 h-5" />,
          title: "Scale Effortlessly",
          description: "Handle multiple accounts seamlessly",
          metric: "10x",
          timeframe: "faster growth"
        }
      ],
      testimonials: [
        { name: "Alex T.", result: "Went from 2 to 10 accounts easily", stars: 5 },
        { name: "Maria S.", result: "Got my evenings back!", stars: 5 },
        { name: "David L.", result: "My productivity tripled", stars: 5 }
      ]
    },
    growth: {
      icon: <Users className="w-6 h-6" />,
      color: "green",
      primaryBenefit: "10x Your Follower Growth",
      outcomes: [
        {
          icon: <Users className="w-5 h-5" />,
          title: "Rapid Growth",
          description: "Attract high-quality followers organically",
          metric: "10x",
          timeframe: "faster growth"
        },
        {
          icon: <Heart className="w-5 h-5" />,
          title: "Better Engagement",
          description: "Build a community that actually cares",
          metric: "+450%",
          timeframe: "engagement boost"
        },
        {
          icon: <Star className="w-5 h-5" />,
          title: "Brand Authority",
          description: "Establish yourself as a thought leader",
          metric: "#1",
          timeframe: "in your niche"
        }
      ],
      testimonials: [
        { name: "Jessica W.", result: "From 5K to 50K in 3 months", stars: 5 },
        { name: "Carlos M.", result: "My posts finally go viral", stars: 5 },
        { name: "Lisa K.", result: "I became an influencer in my field", stars: 5 }
      ]
    }
  };

  const currentBenefits = benefitDetails[currentStep.id as keyof typeof benefitDetails];

  const toggleBenefitSelection = (benefitTitle: string) => {
    const newSelected = new Set(selectedBenefits);
    if (newSelected.has(benefitTitle)) {
      newSelected.delete(benefitTitle);
    } else {
      newSelected.add(benefitTitle);
    }
    setSelectedBenefits(newSelected);
  };

  const handleStepComplete = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1);
        setIsAnimating(false);
      } else {
        onComplete();
      }
    }, 500);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-blue-600",
        bgLight: "bg-blue-100",
        text: "text-blue-600",
        border: "border-blue-200",
        gradient: "from-blue-600 to-blue-700"
      },
      purple: {
        bg: "bg-purple-600",
        bgLight: "bg-purple-100",
        text: "text-purple-600", 
        border: "border-purple-200",
        gradient: "from-purple-600 to-purple-700"
      },
      green: {
        bg: "bg-green-600",
        bgLight: "bg-green-100",
        text: "text-green-600",
        border: "border-green-200", 
        gradient: "from-green-600 to-green-700"
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const colors = getColorClasses(currentBenefits.color);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Transform Your Instagram Success
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                See the incredible results our users achieve
              </p>
            </div>
            <Badge variant="success">Results-Focused</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8 mb-12">
          {steps.map((step, index) => {
            const stepBenefits = benefitDetails[step.id as keyof typeof benefitDetails];
            const isActive = activeStep === index;
            const isCompleted = index < activeStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setActiveStep(index)}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all",
                    isActive
                      ? `${colors.bg} text-white border-transparent shadow-lg scale-110`
                      : isCompleted
                      ? "bg-green-600 text-white border-transparent"
                      : "bg-white text-gray-400 border-gray-300"
                  )}
                >
                  {stepBenefits?.icon}
                </button>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-16 h-1 mx-4 rounded-full",
                    isCompleted ? "bg-green-300" : "bg-gray-300"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Primary Benefit */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Benefit Card */}
            <Card className={cn(
              "p-8 text-white relative overflow-hidden",
              `bg-gradient-to-r ${colors.gradient}`
            )}>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    {currentBenefits.icon}
                  </div>
                  <Badge className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                    STEP {activeStep + 1}
                  </Badge>
                </div>
                
                <h2 className="text-4xl font-bold mb-4">
                  {currentBenefits.primaryBenefit}
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Real results from real users who've transformed their Instagram presence
                </p>

                {/* Success Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  {currentBenefits.outcomes.slice(0, 3).map((outcome, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold mb-2">{outcome.metric}</div>
                      <div className="text-sm text-blue-100">{outcome.timeframe}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-5 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24" />
            </Card>

            {/* Detailed Outcomes */}
            <div className="grid md:grid-cols-3 gap-6">
              {currentBenefits.outcomes.map((outcome, index) => {
                const isSelected = selectedBenefits.has(outcome.title);
                return (
                  <Card
                    key={index}
                    className={cn(
                      "p-6 cursor-pointer transition-all hover:scale-105",
                      isSelected ? "border-green-500 bg-green-50" : ""
                    )}
                    onClick={() => toggleBenefitSelection(outcome.title)}
                  >
                    <div className="text-center">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center text-white mx-auto mb-4",
                        colors.bg
                      )}>
                        {outcome.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {outcome.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {outcome.description}
                      </p>
                      <div className="text-2xl font-bold text-green-600">
                        {outcome.metric}
                      </div>
                      <div className="text-sm text-gray-500">
                        {outcome.timeframe}
                      </div>
                      {isSelected && (
                        <div className="mt-3 text-green-600 font-medium">
                          ✅ Selected
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* User Testimonials */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                What Our Users Say
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {currentBenefits.testimonials.map((testimonial, index) => (
                  <div key={index} className="text-center">
                    <StarRating rating={testimonial.stars} className="justify-center mb-3" />
                    <blockquote className="text-gray-700 italic mb-3">
                      "{testimonial.result}"
                    </blockquote>
                    <cite className="text-gray-600 font-medium">
                      {testimonial.name}
                    </cite>
                  </div>
                ))}
              </div>
            </Card>

            {/* Social Proof */}
            {showSocialProof && currentStep.socialProof && (
              <SocialProof
                content={currentStep.socialProof}
                position="top"
                className="animate-in slide-in-from-bottom-4 duration-500"
              />
            )}
          </div>

          {/* Right Side - Value Calculator & CTA */}
          <div className="space-y-6">
            {/* Personal Impact Calculator */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Potential Impact
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time Saved Weekly</span>
                  <span className="font-bold text-green-600">15-20 hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Engagement Boost</span>
                  <span className="font-bold text-green-600">340%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Revenue Increase</span>
                  <span className="font-bold text-green-600">250%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ROI</span>
                  <span className="font-bold text-green-600">420%</span>
                </div>
              </div>
            </Card>

            {/* Success Stories */}
            <Card className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Success Stories
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-white rounded-lg border">
                  <div className="font-medium text-gray-900">Sarah Chen</div>
                  <div className="text-sm text-gray-600">Fashion Influencer</div>
                  <div className="text-green-600 font-semibold mt-1">340% engagement increase</div>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <div className="font-medium text-gray-900">Mike Rodriguez</div>
                  <div className="text-sm text-gray-600">Marketing Agency</div>
                  <div className="text-green-600 font-semibold mt-1">20 hours saved weekly</div>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <div className="font-medium text-gray-900">Emily Johnson</div>
                  <div className="text-sm text-gray-600">Blogger</div>
                  <div className="text-green-600 font-semibold mt-1">10x follower growth</div>
                </div>
              </div>
            </Card>

            {/* Value Proposition */}
            <Card className="p-6 border-green-200 bg-green-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What This Means For You
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Focus on creating, not analyzing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Watch your account grow organically</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Turn followers into customers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Become an authority in your niche</span>
                </li>
              </ul>
            </Card>

            {/* CTA */}
            <Card className={cn(
              "p-6 text-white relative overflow-hidden transition-all duration-500",
              isAnimating ? "scale-105" : "",
              `bg-gradient-to-r ${colors.gradient}`
            )}>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">
                  Ready to Transform Your Instagram?
                </h3>
                <p className="text-blue-100 mb-6">
                  Join thousands of successful creators
                </p>
                <Button
                  onClick={handleStepComplete}
                  className={cn(
                    "w-full bg-white text-gray-900 hover:bg-gray-100 font-bold",
                    isAnimating ? "animate-pulse" : ""
                  )}
                >
                  {activeStep < steps.length - 1 ? (
                    <>
                      Continue to Next Benefit
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    "Start Growing Now - It's Free!"
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};