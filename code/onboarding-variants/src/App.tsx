import React, { useState } from 'react';
import { 
  GuidedTour, 
  SelfExploration, 
  FeatureFocused, 
  BenefitFocused, 
  ProgressiveDisclosure,
  FullShowcase,
  SocialProofPlacement,
  CTAPositioning,
  Card,
  Badge
} from './components';
import { DEFAULT_STEPS } from './types';
import './App.css';

type VariantType = 
  | 'guided-tour'
  | 'self-exploration'
  | 'feature-focused'
  | 'benefit-focused'
  | 'progressive'
  | 'full-showcase'
  | 'social-proof-placement'
  | 'cta-positioning';

const variantConfigs = {
  'guided-tour': {
    name: 'Interactive Guided Tour vs Self-Exploration',
    component: GuidedTour,
    description: 'Interactive step-by-step tour with auto-play capabilities',
    tags: ['Tour', 'Interactive', 'Auto-play']
  },
  'self-exploration': {
    name: 'Self-Exploration',
    component: SelfExploration,
    description: 'Users explore features at their own pace with free navigation',
    tags: ['Exploration', 'Self-paced', 'Free navigation']
  },
  'feature-focused': {
    name: 'Feature-Focused Messaging',
    component: FeatureFocused,
    description: 'Emphasizes technical features and specifications',
    tags: ['Features', 'Technical', 'Specs']
  },
  'benefit-focused': {
    name: 'Benefit-Focused Messaging',
    component: BenefitFocused,
    description: 'Focuses on outcomes and value users will achieve',
    tags: ['Benefits', 'Outcomes', 'Value']
  },
  'progressive': {
    name: 'Progressive Disclosure',
    component: ProgressiveDisclosure,
    description: 'Information revealed gradually as users progress',
    tags: ['Progressive', 'Reveal', 'Step-by-step']
  },
  'full-showcase': {
    name: 'Full Feature Showcase',
    component: FullShowcase,
    description: 'All features displayed simultaneously',
    tags: ['Complete', 'All features', 'Grid']
  },
  'social-proof-placement': {
    name: 'Social Proof Placement',
    component: SocialProofPlacement,
    description: 'Tests different social proof positioning strategies',
    tags: ['Social Proof', 'Positioning', 'Testimonials']
  },
  'cta-positioning': {
    name: 'CTA Timing & Positioning',
    component: CTAPositioning,
    description: 'Tests different call-to-action approaches',
    tags: ['CTA', 'Positioning', 'Conversion']
  }
};

function App() {
  const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    setCompleted(true);
    setTimeout(() => setCompleted(false), 3000);
  };

  const resetVariant = () => {
    setSelectedVariant(null);
    setCompleted(false);
  };

  if (selectedVariant) {
    const config = variantConfigs[selectedVariant];
    const Component = config.component;

    const props: any = {
      steps: DEFAULT_STEPS,
      onComplete: handleComplete,
      showSocialProof: true
    };

    // Add variant-specific props
    switch (selectedVariant) {
      case 'guided-tour':
        props.showProgress = true;
        props.autoAdvance = false;
        break;
      case 'self-exploration':
        props.allowFreeNavigation = true;
        break;
      case 'feature-focused':
        props.detailedFeatures = true;
        break;
      case 'benefit-focused':
        props.emphasizeOutcomes = true;
        break;
      case 'progressive':
        props.revealSpeed = 'medium';
        break;
      case 'full-showcase':
        props.layout = 'grid';
        break;
      case 'social-proof-placement':
        props.placement = 'middle';
        props.socialProofStyle = 'detailed';
        break;
      case 'cta-positioning':
        props.positioning = 'balanced';
        props.ctaStyle = 'prominent';
        props.showProgress = true;
        break;
    }

    return (
      <div className="min-h-screen">
        {/* Header with back button */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={resetVariant}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Variants
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{config.name}</h1>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {config.tags.map(tag => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Completion message */}
        {completed && (
          <div className="fixed top-4 right-4 z-50">
            <Card className="p-4 bg-green-50 border-green-200 border-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <div className="font-semibold text-green-900">Onboarding Complete!</div>
                  <div className="text-sm text-green-700">Variant: {config.name}</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Variant Component */}
        <Component {...props} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Onboarding A/B Test Variants
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Test different approaches to onboarding flows, messaging strategies, 
              content disclosure, social proof placement, and call-to-action positioning.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Test Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Categories</h2>
          <div className="grid md:grid-cols-5 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Interaction Style</h3>
              <p className="text-sm text-gray-600">Guided vs Self-directed</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Messaging</h3>
              <p className="text-sm text-gray-600">Features vs Benefits</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Content Disclosure</h3>
              <p className="text-sm text-gray-600">Progressive vs Full</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Social Proof</h3>
              <p className="text-sm text-gray-600">Placement variations</p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Call-to-Action</h3>
              <p className="text-sm text-gray-600">Timing & positioning</p>
            </Card>
          </div>
        </div>

        {/* Variant Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Variants</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {Object.entries(variantConfigs).map(([key, config]) => (
              <Card key={key} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedVariant(key as VariantType)}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {key.split('-')[0].charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{config.name}</h3>
                    <p className="text-gray-600 mb-3">{config.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {config.tags.map(tag => (
                        <Badge key={tag} variant="default" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-blue-600 font-medium">
                    Try →
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Testing Instructions */}
        <Card className="p-8 mt-12 bg-blue-50 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Testing Instructions</h3>
          <div className="grid md:grid-cols-2 gap-6 text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">What to Test:</h4>
              <ul className="space-y-1 text-sm">
                <li>• User engagement and time spent</li>
                <li>• Completion rates and drop-off points</li>
                <li>• User preferences and feedback</li>
                <li>• Conversion to signup/trial</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Metrics to Track:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Step completion rates</li>
                <li>• Feature interaction patterns</li>
                <li>• CTA click-through rates</li>
                <li>• User satisfaction scores</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;