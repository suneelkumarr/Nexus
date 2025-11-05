import React, { useState } from 'react';
import { TrendingUp, Zap, Users, CheckCircle, Star, ArrowRight, ChevronDown } from 'lucide-react';
import { OnboardingStep } from '../types';
import { Button, Card, Badge } from './ui';
import { SocialProof, StarRating } from './SocialProof';
import { cn } from '../lib/utils';

interface FullShowcaseProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  showSocialProof?: boolean;
  layout?: 'grid' | 'tabs' | 'accordion';
}

export const FullShowcase: React.FC<FullShowcaseProps> = ({
  steps,
  onComplete,
  showSocialProof = true,
  layout = 'grid'
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'features']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStepIcon = (stepId: string) => {
    switch (stepId) {
      case 'analytics': return <TrendingUp className="w-6 h-6" />;
      case 'automation': return <Zap className="w-6 h-6" />;
      case 'growth': return <Users className="w-6 h-6" />;
      default: return <TrendingUp className="w-6 h-6" />;
    }
  };

  const getColorClasses = (index: number) => {
    const colors = [
      { bg: 'bg-blue-600', light: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-500 to-blue-600' },
      { bg: 'bg-purple-600', light: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-500 to-purple-600' },
      { bg: 'bg-green-600', light: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', gradient: 'from-green-500 to-green-600' }
    ];
    return colors[index % colors.length];
  };

  const overallStats = [
    { label: 'Active Users', value: '50,000+', icon: '👥' },
    { label: 'Avg. Growth Rate', value: '340%', icon: '📈' },
    { label: 'Time Saved', value: '15hrs/week', icon: '⏰' },
    { label: 'ROI Increase', value: '420%', icon: '💰' }
  ];

  if (layout === 'tabs') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Complete Feature Overview
              </h1>
              <p className="text-lg text-gray-600">
                Everything you need to know about GrowthHub in one place
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
            {steps.map((step, index) => {
              const colors = getColorClasses(index);
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveTab(index)}
                  className={cn(
                    "flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-all",
                    activeTab === index
                      ? `${colors.bg} text-white shadow-md`
                      : "text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {getStepIcon(step.id)}
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Content Side */}
            <div className="space-y-6">
              {/* Overview */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {steps[activeTab].title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {steps[activeTab].description}
                </p>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
                <div className="space-y-3">
                  {steps[activeTab].features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Benefits */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
                <div className="space-y-3">
                  {steps[activeTab].benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Social Proof */}
              {showSocialProof && steps[activeTab].socialProof && (
                <SocialProof
                  content={steps[activeTab].socialProof}
                  position="top"
                />
              )}
            </div>

            {/* Visual Side */}
            <div className="space-y-6">
              {/* Demo Interface */}
              <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                <h3 className="text-xl font-bold mb-4 text-center">Live Dashboard Preview</h3>
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="text-2xl font-bold">+234%</div>
                    <div className="text-sm text-gray-300">Engagement Growth</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="text-2xl font-bold">50K+</div>
                    <div className="text-sm text-gray-300">Total Users</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-sm text-gray-300">Uptime</div>
                  </div>
                </div>
              </Card>

              {/* Statistics */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  {overallStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Testimonials */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Reviews</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                      <div>
                        <StarRating rating={5} size="sm" className="mb-1" />
                        <p className="text-sm text-gray-700">
                          "Incredible results! My engagement increased by 300% in just 2 months."
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          User {i}, Verified Account
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button onClick={onComplete} size="lg" className="px-8 py-4">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout (Default)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Feature Showcase
            </h1>
            <p className="text-lg text-gray-600">
              Explore all GrowthHub features at once
            </p>
            <Badge variant="info" className="mt-2">Full Overview</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {overallStats.map((stat, index) => (
            <Card key={index} className="text-center p-6">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => {
            const colors = getColorClasses(index);
            const isExpanded = expandedSections.has(step.id);
            
            return (
              <Card key={step.id} className="p-6 h-fit">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${colors.bg}`}>
                    {getStepIcon(step.id)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-900">Features</h4>
                  {step.features.map((feature, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Benefits Preview */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-900">Key Benefits</h4>
                  {step.benefits.slice(0, 2).map((benefit, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                  {step.benefits.length > 2 && (
                    <button
                      onClick={() => toggleSection(step.id)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <span>{isExpanded ? 'Show Less' : `+${step.benefits.length - 2} more`}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                  )}
                </div>

                {/* Social Proof Preview */}
                {showSocialProof && step.socialProof && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <StarRating rating={5} size="sm" />
                    </div>
                    <p className="text-sm text-gray-700 italic">
                      "{step.socialProof.text}"
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      - {step.socialProof.author}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Social Proof Section */}
        {showSocialProof && (
          <Card className="p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              What Our Users Say
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                step.socialProof && (
                  <SocialProof
                    key={index}
                    content={step.socialProof}
                    position="inline"
                  />
                )
              ))}
            </div>
          </Card>
        )}

        {/* Complete Benefits List */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Complete Benefits Overview
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const colors = getColorClasses(index);
              return (
                <div key={step.id}>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${colors.bg}`}>
                      {getStepIcon(step.id)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {step.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Final CTA */}
        <div className="text-center">
          <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-blue-100 mb-6">
              Join thousands of successful creators who are already growing with GrowthHub
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onComplete}
                className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="ghost" 
                className="text-white border-white hover:bg-white hover:text-gray-900 px-8 py-3"
              >
                Watch Demo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};