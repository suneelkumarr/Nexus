import React, { useState } from 'react';
import { TrendingUp, Zap, Users, Star, CheckCircle, Quote } from 'lucide-react';
import { OnboardingStep } from '../types';
import { Button, Card, Badge } from './ui';
import { SocialProof, StarRating } from './SocialProof';
import { cn } from '../lib/utils';

interface SocialProofPlacementProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  placement?: 'top' | 'middle' | 'bottom' | 'floating' | 'multiple';
  socialProofStyle?: 'minimal' | 'detailed' | 'visual' | 'compact';
}

export const SocialProofPlacement: React.FC<SocialProofPlacementProps> = ({
  steps,
  onComplete,
  placement = 'middle',
  socialProofStyle = 'detailed'
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'analytics': return <TrendingUp className="w-6 h-6" />;
      case 'automation': return <Zap className="w-6 h-6" />;
      case 'growth': return <Users className="w-6 h-6" />;
      default: return <TrendingUp className="w-6 h-6" />;
    }
  };

  const additionalTestimonials = [
    {
      text: "This tool completely transformed my Instagram strategy. My engagement is through the roof!",
      author: "Alex Thompson",
      company: "Digital Marketing Director",
      avatar: "AT",
      rating: 5,
      metrics: "+340% engagement"
    },
    {
      text: "I was skeptical at first, but the results speak for themselves. Best investment I've made.",
      author: "Maria Rodriguez",
      company: "Fashion Influencer", 
      avatar: "MR",
      rating: 5,
      metrics: "10x follower growth"
    },
    {
      text: "Finally, a tool that actually delivers on its promises. Highly recommended!",
      author: "James Wilson",
      company: "Content Creator",
      avatar: "JW", 
      rating: 5,
      metrics: "20hrs saved/week"
    },
    {
      text: "Game-changer for my business. The automation features are incredible.",
      author: "Sarah Chen",
      company: "E-commerce Owner",
      avatar: "SC",
      rating: 5,
      metrics: "+250% revenue"
    }
  ];

  const renderSocialProof = (testimonial: typeof additionalTestimonials[0], position: string, index: number) => {
    const baseClasses = "transition-all duration-500";
    
    const styleVariants = {
      minimal: (
        <div className={cn(baseClasses, "bg-blue-50 border border-blue-200 rounded-lg p-4")}>
          <div className="flex items-center space-x-2">
            <StarRating rating={testimonial.rating} size="sm" />
            <span className="text-sm font-medium text-blue-900">{testimonial.metrics}</span>
          </div>
        </div>
      ),
      detailed: (
        <Card className={cn(baseClasses, "animate-in slide-in-from-bottom-4 duration-500")}>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {testimonial.avatar}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{testimonial.author}</div>
              <div className="text-sm text-gray-600">{testimonial.company}</div>
            </div>
          </div>
          <StarRating rating={testimonial.rating} className="mb-3" />
          <blockquote className="text-gray-700 italic mb-3">
            "{testimonial.text}"
          </blockquote>
          <div className="text-sm font-medium text-green-600">
            {testimonial.metrics}
          </div>
        </Card>
      ),
      visual: (
        <div className={cn(baseClasses, "relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white")}>
          <Quote className="w-8 h-8 mb-4 opacity-60" />
          <StarRating rating={testimonial.rating} className="mb-3" />
          <blockquote className="text-lg mb-4">
            "{testimonial.text}"
          </blockquote>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-bold">
              {testimonial.avatar}
            </div>
            <div>
              <div className="font-semibold">{testimonial.author}</div>
              <div className="text-blue-100 text-sm">{testimonial.company}</div>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-white bg-opacity-20 rounded-lg px-3 py-1 text-sm font-bold">
            {testimonial.metrics}
          </div>
        </div>
      ),
      compact: (
        <div className={cn(baseClasses, "flex items-center space-x-3 bg-gray-50 rounded-lg p-3")}>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
            {testimonial.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{testimonial.author}</div>
            <div className="text-xs text-gray-600 truncate">"{testimonial.text.substring(0, 40)}..."</div>
          </div>
          <StarRating rating={testimonial.rating} size="sm" />
        </div>
      )
    };

    return styleVariants[socialProofStyle];
  };

  const renderPlacementSpecificContent = () => {
    const commonTestimonials = additionalTestimonials.slice(0, 3);

    switch (placement) {
      case 'top':
        return (
          <div className="space-y-6 mb-8">
            <div className="text-center mb-6">
              <Badge variant="success" className="mb-4">Social Proof: Top Placement</Badge>
              <h2 className="text-2xl font-bold text-gray-900">
                Trusted by 50,000+ Creators
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {commonTestimonials.map((testimonial, index) => 
                renderSocialProof(testimonial, 'top', index)
              )}
            </div>
          </div>
        );

      case 'floating':
        return (
          <div className="relative">
            {/* Main content takes full width */}
            <div className="pr-80">
              {/* Main content here */}
              <Card className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {step.title}
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  {step.description}
                </p>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
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
              </Card>
            </div>

            {/* Floating Social Proof */}
            <div className="absolute top-0 right-0 w-72 space-y-4">
              <div className="bg-white rounded-lg shadow-lg border p-4">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-green-600">50,000+</div>
                  <div className="text-sm text-gray-600">Happy Users</div>
                </div>
              </div>
              
              {additionalTestimonials.map((testimonial, index) => (
                <div key={index} className="transform rotate-1 hover:rotate-0 transition-transform">
                  {renderSocialProof(testimonial, 'floating', index)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'multiple':
        return (
          <div className="space-y-8">
            {/* Top testimonials */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Top Rated by Industry Leaders
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {additionalTestimonials.slice(0, 2).map((testimonial, index) => 
                  renderSocialProof(testimonial, 'top', index)
                )}
              </div>
            </div>

            {/* Middle testimonials */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Real Results from Real Users
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {additionalTestimonials.slice(2, 5).map((testimonial, index) => 
                  renderSocialProof(testimonial, 'middle', index)
                )}
              </div>
            </div>

            {/* Bottom testimonials */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Don't Just Take Our Word for It
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {additionalTestimonials.slice(0, 2).map((testimonial, index) => 
                  renderSocialProof(testimonial, 'bottom', index)
                )}
              </div>
            </div>
          </div>
        );

      case 'bottom':
        return (
          <div className="space-y-8">
            {/* Main content first */}
            <Card className="p-8">
              <div className="flex items-center space-x-4 mb-6">
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
                  <ul className="space-y-2">
                    {step.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h3>
                  <ul className="space-y-2">
                    {step.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Bottom social proof */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Join Our Community of Successful Creators
              </h3>
              <p className="text-gray-600 mb-6">
                See what others are saying about their GrowthHub experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {additionalTestimonials.map((testimonial, index) => 
                renderSocialProof(testimonial, 'bottom', index)
              )}
            </div>
          </div>
        );

      default: // middle
        return (
          <div className="space-y-8">
            {/* Content before social proof */}
            <Card className="p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  {getStepIcon(step.id)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{step.title}</h2>
                  <p className="text-lg text-gray-600">{step.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
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
            </Card>

            {/* Social Proof in Middle */}
            <div>
              <div className="text-center mb-8">
                <Badge variant="info" className="mb-4">Social Proof: Middle Placement</Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Trusted by Thousands of Creators
                </h3>
                <p className="text-gray-600">
                  Here's what our community is saying
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {commonTestimonials.map((testimonial, index) => 
                  renderSocialProof(testimonial, 'middle', index)
                )}
              </div>
            </div>

            {/* Content after social proof */}
            <Card className="p-6 bg-blue-50 border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">
                Ready to Join Them?
              </h3>
              <p className="text-blue-800 mb-6">
                These creators started just like you. See what GrowthHub can do for your Instagram growth.
              </p>
              <Button onClick={onComplete} className="bg-blue-600 hover:bg-blue-700">
                Start Your Success Story
              </Button>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Social Proof Placement Test
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Testing {placement} placement with {socialProofStyle} style
              </p>
            </div>
            <div className="flex space-x-2">
              <Badge variant="info">Placement: {placement}</Badge>
              <Badge variant="default">Style: {socialProofStyle}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Navigation */}
        <div className="flex items-center justify-center space-x-4 mb-12">
          {steps.map((s, index) => (
            <button
              onClick={() => setCurrentStep(index)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all",
                currentStep === index
                  ? "bg-blue-600 text-white border-transparent"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              )}
            >
              {getStepIcon(s.id)}
              <span className="font-medium">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Main Content with Placement-Specific Social Proof */}
        {placement === 'top' ? (
          <>
            {/* Top placement renders first */}
            {renderPlacementSpecificContent()}
            
            {/* Then the main content */}
            <Card className="p-8 mt-8">
              <div className="flex items-center space-x-4 mb-6">
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
            </Card>
          </>
        ) : placement === 'floating' ? (
          renderPlacementSpecificContent()
        ) : placement === 'multiple' ? (
          renderPlacementSpecificContent()
        ) : placement === 'bottom' ? (
          renderPlacementSpecificContent()
        ) : (
          renderPlacementSpecificContent()
        )}

        {/* Final CTA */}
        {placement !== 'bottom' && placement !== 'multiple' && (
          <div className="text-center mt-12">
            <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-blue-100 mb-6">
                Join thousands of successful creators who trust GrowthHub
              </p>
              <Button 
                onClick={onComplete}
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3"
              >
                Start Free Trial
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};