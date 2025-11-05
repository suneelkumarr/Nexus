export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  features: string[];
  benefits: string[];
  socialProof?: {
    text: string;
    author: string;
    company: string;
  };
}

export interface OnboardingVariant {
  id: string;
  name: string;
  description: string;
  type: 'guided-tour' | 'self-exploration' | 'feature-focused' | 'benefit-focused' | 'progressive' | 'full-showcase';
  steps: OnboardingStep[];
  socialProof?: {
    position: 'top' | 'middle' | 'bottom' | 'none';
    content?: {
      text: string;
      author: string;
      company: string;
      avatar?: string;
    };
  };
  cta?: {
    position: 'center' | 'right' | 'bottom-right' | 'bottom-center';
    text: string;
    variant: 'primary' | 'secondary';
  };
}

export const DEFAULT_STEPS: OnboardingStep[] = [
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: 'Track your Instagram performance with detailed insights',
    features: [
      'Real-time engagement metrics',
      'Audience demographics breakdown',
      'Best posting times analysis',
      'Competitor benchmarking'
    ],
    benefits: [
      'Make data-driven decisions',
      'Increase engagement rates',
      'Understand your audience better'
    ],
    socialProof: {
      text: "Increased my engagement by 340% in just 2 months!",
      author: "Sarah Chen",
      company: "Influencer & Content Creator"
    }
  },
  {
    id: 'automation',
    title: 'Smart Automation',
    description: 'Automate repetitive tasks and focus on content creation',
    features: [
      'Auto-post at optimal times',
      'Smart hashtag suggestions',
      'Automated engagement workflows',
      'Bulk content management'
    ],
    benefits: [
      'Save 15+ hours per week',
      'Never miss optimal posting times',
      'Scale your content strategy'
    ],
    socialProof: {
      text: "Game-changer! I save 20 hours weekly and my reach doubled.",
      author: "Mike Rodriguez",
      company: "Digital Marketing Agency"
    }
  },
  {
    id: 'growth',
    title: 'Growth Tools',
    description: 'Grow your followers organically with proven strategies',
    features: [
      'Hashtag research & optimization',
      'Audience targeting insights',
      'Growth tracking & analytics',
      'Viral content detection'
    ],
    benefits: [
      '10x faster follower growth',
      'Higher quality audience',
      'Sustainable growth methods'
    ],
    socialProof: {
      text: "Grew from 5K to 50K followers organically in 3 months!",
      author: "Emily Johnson",
      company: "Fashion Blogger"
    }
  }
];