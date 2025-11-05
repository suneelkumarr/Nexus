// Personalization Utilities
import { UserContext } from '../hooks/usePersonalization';

export const getAccountTypeEmoji = (accountType: string): string => {
  const emojiMap: Record<string, string> = {
    business: '🏢',
    personal: '👤',
    creator: '🎨',
    influencer: '⭐',
    brand: '🏷️',
    default: '📱'
  };
  return emojiMap[accountType] || emojiMap.default;
};

export const getAccountTypeDescription = (accountType: string): string => {
  const descriptions: Record<string, string> = {
    business: 'Business accounts focus on brand growth and customer engagement',
    personal: 'Personal accounts share authentic moments and build connections',
    creator: 'Creator accounts build audience and monetize their content',
    influencer: 'Influencer accounts partner with brands and grow communities',
    brand: 'Brand accounts represent companies and promote products/services'
  };
  return descriptions[accountType] || 'Instagram account focused on growth and engagement';
};

export const getExperienceLevelInfo = (level: string) => {
  const levels = {
    beginner: {
      title: 'Beginner',
      description: 'New to Instagram growth strategies',
      color: 'text-green-600 bg-green-100',
      icon: '🌱',
      suggestions: [
        'Focus on consistent posting',
        'Engage with your community',
        'Learn about Instagram algorithms',
        'Study successful accounts in your niche'
      ]
    },
    intermediate: {
      title: 'Intermediate',
      description: 'Some experience with Instagram marketing',
      color: 'text-yellow-600 bg-yellow-100',
      icon: '📈',
      suggestions: [
        'Optimize your content strategy',
        'Experiment with different post types',
        'Analyze your performance metrics',
        'Build strategic partnerships'
      ]
    },
    advanced: {
      title: 'Advanced',
      description: 'Experienced with growth strategies',
      color: 'text-purple-600 bg-purple-100',
      icon: '🚀',
      suggestions: [
        'Scale your successful strategies',
        'Explore advanced analytics',
        'Consider automation tools',
        'Develop your personal brand'
      ]
    }
  };
  return levels[level as keyof typeof levels] || levels.beginner;
};

export const getPersonalizedGoalSuggestions = (userContext: UserContext): Array<{
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
  impact: 'low' | 'medium' | 'high';
}> => {
  const { accountType, followerCount, experienceLevel } = userContext;
  
  const baseGoals = [
    {
      id: 'increase_engagement',
      title: 'Increase Engagement Rate',
      description: 'Boost likes, comments, and shares on your posts',
      category: 'Engagement',
      difficulty: 'medium' as const,
      timeframe: '2-4 weeks',
      impact: 'high' as const
    },
    {
      id: 'grow_followers',
      title: 'Grow Followers Organically',
      description: 'Attract relevant followers through quality content',
      category: 'Growth',
      difficulty: 'hard' as const,
      timeframe: '1-3 months',
      impact: 'high' as const
    }
  ];

  // Add account-specific goals
  if (accountType === 'business') {
    baseGoals.push(
      {
        id: 'increase_website_clicks',
        title: 'Drive Website Traffic',
        description: 'Increase clicks to your website from Instagram',
        category: 'Business',
        difficulty: 'medium',
        timeframe: '2-6 weeks',
        impact: 'high'
      },
      {
        id: 'build_brand_awareness',
        title: 'Build Brand Awareness',
        description: 'Increase brand recognition and recall',
        category: 'Branding',
        difficulty: 'hard',
        timeframe: '1-3 months',
        impact: 'high'
      }
    );
  } else if (accountType === 'creator') {
    baseGoals.push(
      {
        id: 'monetize_content',
        title: 'Monetize Your Content',
        description: 'Start earning from your Instagram presence',
        category: 'Monetization',
        difficulty: 'hard',
        timeframe: '2-6 months',
        impact: 'high'
      },
      {
        id: 'build_personal_brand',
        title: 'Establish Personal Brand',
        description: 'Create a strong, recognizable personal brand',
        category: 'Branding',
        difficulty: 'hard',
        timeframe: '3-6 months',
        impact: 'high'
      }
    );
  }

  // Add follower-count specific goals
  if (followerCount < 1000) {
    baseGoals.push(
      {
        id: 'reach_1k_followers',
        title: 'Reach 1,000 Followers',
        description: 'Achieve your first major milestone',
        category: 'Milestone',
        difficulty: 'medium',
        timeframe: '2-4 months',
        impact: 'high'
      }
    );
  } else if (followerCount < 10000) {
    baseGoals.push(
      {
        id: 'reach_10k_followers',
        title: 'Reach 10,000 Followers',
        description: 'Scale to a larger audience',
        category: 'Milestone',
        difficulty: 'hard',
        timeframe: '6-12 months',
        impact: 'high'
      }
    );
  } else {
    baseGoals.push(
      {
        id: 'reach_100k_followers',
        title: 'Reach 100,000 Followers',
        description: 'Become an influential account',
        category: 'Milestone',
        difficulty: 'hard',
        timeframe: '1-2 years',
        impact: 'high'
      }
    );
  }

  // Add experience-level specific goals
  if (experienceLevel === 'beginner') {
    baseGoals.push(
      {
        id: 'post_consistently',
        title: 'Post Consistently',
        description: 'Maintain a regular posting schedule',
        category: 'Foundation',
        difficulty: 'easy',
        timeframe: '1 month',
        impact: 'medium'
      }
    );
  }

  return baseGoals;
};

export const getPersonalizedContentSuggestions = (userContext: UserContext): Array<{
  type: string;
  title: string;
  description: string;
  example: string;
  category: string;
  bestTime: string;
  frequency: string;
}> => {
  const { accountType, followerCount, experienceLevel } = userContext;
  
  const suggestions = [];

  // Base content types for all accounts
  if (followerCount < 1000) {
    suggestions.push(
      {
        type: 'behind_the_scenes',
        title: 'Behind-the-Scenes Content',
        description: 'Show your authentic daily life and work process',
        example: 'Your morning routine, workspace setup, or creative process',
        category: 'Authentic',
        bestTime: 'Evening (6-8 PM)',
        frequency: '2-3 times per week'
      },
      {
        type: 'tips_and_tutorials',
        title: 'Tips & Tutorials',
        description: 'Share helpful tips in your area of expertise',
        example: 'Quick tutorials, step-by-step guides, or helpful advice',
        category: 'Educational',
        bestTime: 'Morning (8-10 AM)',
        frequency: '1-2 times per week'
      }
    );
  }

  if (accountType === 'business') {
    suggestions.push(
      {
        type: 'product_showcase',
        title: 'Product Showcases',
        description: 'Highlight your products or services',
        example: 'Product features, benefits, customer testimonials',
        category: 'Business',
        bestTime: 'Weekday mornings (9-11 AM)',
        frequency: '2-3 times per week'
      },
      {
        type: 'customer_stories',
        title: 'Customer Success Stories',
        description: 'Share how your product/service helped customers',
        example: 'Before/after stories, testimonials, case studies',
        category: 'Social Proof',
        bestTime: 'Lunch time (12-1 PM)',
        frequency: '1-2 times per week'
      }
    );
  } else if (accountType === 'creator') {
    suggestions.push(
      {
        type: 'creative_process',
        title: 'Creative Process',
        description: 'Show your creative journey and techniques',
        example: 'Time-lapse videos, sketching process, inspiration boards',
        category: 'Creative',
        bestTime: 'Evening (7-9 PM)',
        frequency: '2-3 times per week'
      },
      {
        type: 'collaborations',
        title: 'Collaboration Content',
        description: 'Partner with other creators or brands',
        example: 'Guest posts, joint challenges, shared projects',
        category: 'Partnership',
        bestTime: 'Varies by audience',
        frequency: '1-2 times per month'
      }
    );
  }

  return suggestions;
};

export const getBenchmarkData = (accountType: string, followerCount: number) => {
  // Base benchmarks
  const baseBenchmarks = {
    engagement_rate: {
      business: 1.0,
      personal: 3.5,
      creator: 4.2,
      default: 2.5
    },
    posting_frequency: {
      business: '3-5 per week',
      personal: '1-3 per week',
      creator: '4-7 per week',
      default: '2-4 per week'
    },
    story_frequency: {
      business: '2-3 per day',
      personal: '1-2 per day',
      creator: '3-5 per day',
      default: '2 per day'
    }
  };

  // Adjust benchmarks based on follower count
  let multiplier = 1;
  if (followerCount < 1000) {
    multiplier = 1.3; // Higher engagement expected for smaller accounts
  } else if (followerCount > 100000) {
    multiplier = 0.7; // Lower engagement expected for larger accounts
  }

  const engagementRate = (baseBenchmarks.engagement_rate[accountType as keyof typeof baseBenchmarks.engagement_rate] || 
                        baseBenchmarks.engagement_rate.default) * multiplier;

  return {
    engagement_rate: engagementRate,
    posting_frequency: baseBenchmarks.posting_frequency[accountType as keyof typeof baseBenchmarks.posting_frequency] || 
                      baseBenchmarks.posting_frequency.default,
    story_frequency: baseBenchmarks.story_frequency[accountType as keyof typeof baseBenchmarks.story_frequency] || 
                    baseBenchmarks.story_frequency.default,
    optimal_posting_times: getOptimalPostingTimes(accountType),
    best_hashtag_count: getOptimalHashtagCount(accountType)
  };
};

export const getOptimalPostingTimes = (accountType: string): string[] => {
  const timeMap = {
    business: ['9:00 AM - 11:00 AM', '12:00 PM - 1:00 PM', '5:00 PM - 7:00 PM'],
    personal: ['7:00 AM - 9:00 AM', '12:00 PM - 1:00 PM', '6:00 PM - 8:00 PM'],
    creator: ['8:00 AM - 10:00 AM', '2:00 PM - 4:00 PM', '7:00 PM - 9:00 PM'],
    default: ['9:00 AM - 11:00 AM', '12:00 PM - 1:00 PM', '6:00 PM - 8:00 PM']
  };
  return timeMap[accountType as keyof typeof timeMap] || timeMap.default;
};

export const getOptimalHashtagCount = (accountType: string): number => {
  const countMap = {
    business: 3, // Keep it professional and focused
    personal: 5, // Balance between discoverability and aesthetics
    creator: 8,  // Creators often use more hashtags for reach
    default: 5
  };
  return countMap[accountType as keyof typeof countMap] || countMap.default;
};

export const formatFollowerCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const getEngagementLevel = (rate: number): {
  level: 'low' | 'average' | 'good' | 'excellent';
  description: string;
  color: string;
} => {
  if (rate >= 5) {
    return {
      level: 'excellent',
      description: 'Outstanding engagement rate!',
      color: 'text-green-600'
    };
  } else if (rate >= 3) {
    return {
      level: 'good',
      description: 'Above average engagement',
      color: 'text-blue-600'
    };
  } else if (rate >= 1) {
    return {
      level: 'average',
      description: 'Keep improving your engagement',
      color: 'text-yellow-600'
    };
  } else {
    return {
      level: 'low',
      description: 'Focus on building engagement',
      color: 'text-red-600'
    };
  }
};