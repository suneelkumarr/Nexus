// Mock AI Analysis Logic for Instagram Insights
export interface InsightData {
  id: string;
  type: 'alert' | 'recommendation' | 'opportunity' | 'performance' | 'timing';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number; // 0-100
  impact: 'positive' | 'negative' | 'neutral';
  category: string;
  actionable: boolean;
  actionItems?: string[];
  metrics?: {
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
    benchmark?: number;
  };
  estimatedValue?: string;
  implementationTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: Date;
  isRead: boolean;
}

export interface PerformanceMetrics {
  engagementRate: number;
  followers: number;
  impressions: number;
  reach: number;
  saves: number;
  comments: number;
  likes: number;
  shares: number;
  profileVisits: number;
  websiteClicks: number;
  storyCompletionRate: number;
  reelViews: number;
  postFrequency: number;
  avgLikesPerPost: number;
  avgCommentsPerPost: number;
}

export interface AccountProfile {
  accountType: 'personal' | 'business' | 'creator';
  niche: string;
  followerCount: number;
  postingFrequency: number;
  lastPostTime: Date;
  contentMix: {
    photos: number;
    videos: number;
    reels: number;
    stories: number;
  };
}

class InsightGenerator {
  private generateInsights(accountProfile: AccountProfile, metrics: PerformanceMetrics): InsightData[] {
    const insights: InsightData[] = [];

    // Engagement Analysis
    if (metrics.engagementRate < 2) {
      insights.push({
        id: `engagement-${Date.now()}-1`,
        type: 'alert',
        title: 'Low Engagement Rate Detected',
        description: `Your engagement rate of ${metrics.engagementRate.toFixed(1)}% is below the industry average of 2.5% for accounts in your niche.`,
        severity: 'high',
        confidence: 92,
        impact: 'negative',
        category: 'Engagement',
        actionable: true,
        actionItems: [
          'Post more engaging content with questions or polls',
          'Use trending audio and effects in Reels',
          'Respond to comments within the first hour',
          'Post during peak hours (6-8 PM weekdays)'
        ],
        metrics: {
          current: metrics.engagementRate,
          previous: metrics.engagementRate * 1.12,
          change: metrics.engagementRate * 1.12 - metrics.engagementRate,
          changePercentage: -12,
          benchmark: 2.5
        },
        estimatedValue: 'Potential +45% engagement increase',
        implementationTime: '1-2 weeks',
        difficulty: 'medium',
        tags: ['engagement', 'content', 'timing'],
        createdAt: new Date(),
        isRead: false
      });
    }

    // Posting Frequency Optimization
    if (metrics.postFrequency < 3) {
      insights.push({
        id: `frequency-${Date.now()}-2`,
        type: 'recommendation',
        title: 'Increase Posting Frequency',
        description: `You're posting ${metrics.postFrequency.toFixed(1)} times per week. Most successful accounts in your niche post 4-7 times per week.`,
        severity: 'medium',
        confidence: 88,
        impact: 'positive',
        category: 'Content Strategy',
        actionable: true,
        actionItems: [
          'Plan content calendar for next week',
          'Create batch content to maintain consistency',
          'Use scheduling tools to automate posting',
          'Repurpose high-performing content'
        ],
        metrics: {
          current: metrics.postFrequency,
          previous: metrics.postFrequency,
          change: 0,
          changePercentage: 0,
          benchmark: 5.5
        },
        estimatedValue: 'Potential +25% follower growth',
        implementationTime: '3-4 weeks',
        difficulty: 'easy',
        tags: ['frequency', 'planning', 'automation'],
        createdAt: new Date(),
        isRead: false
      });
    }

    // Reel Performance Opportunity
    const reelPercentage = (metrics.reelViews / metrics.impressions) * 100;
    if (reelPercentage < 20) {
      insights.push({
        id: `reel-${Date.now()}-3`,
        type: 'opportunity',
        title: 'Reel Performance Opportunity',
        description: 'Reels are getting 3x more engagement than static posts. Your current Reel production could be optimized.',
        severity: 'medium',
        confidence: 94,
        impact: 'positive',
        category: 'Content Type',
        actionable: true,
        actionItems: [
          'Create 3 Reels per week focusing on trending topics',
          'Use trending audio and effects',
          'Keep Reels between 15-30 seconds',
          'Add captions for accessibility',
          'Post Reels during peak hours'
        ],
        metrics: {
          current: reelPercentage,
          previous: reelPercentage * 1.05,
          change: reelPercentage * 1.05 - reelPercentage,
          changePercentage: -5,
          benchmark: 35
        },
        estimatedValue: 'Potential +65% engagement boost',
        implementationTime: '2-3 weeks',
        difficulty: 'medium',
        tags: ['reels', 'trending', 'engagement'],
        createdAt: new Date(),
        isRead: false
      });
    }

    // Optimal Timing Analysis
    const currentHour = new Date().getHours();
    const isOptimalTime = currentHour >= 18 && currentHour <= 20;
    if (!isOptimalTime) {
      insights.push({
        id: `timing-${Date.now()}-4`,
        type: 'performance',
        title: 'Optimal Posting Time',
        description: 'Your audience is most active between 6-8 PM on weekdays. Schedule posts for this time window.',
        severity: 'low',
        confidence: 91,
        impact: 'positive',
        category: 'Timing',
        actionable: true,
        actionItems: [
          'Schedule next 5 posts for 6-8 PM weekdays',
          'Use Instagram\'s scheduling feature',
          'Set reminders for manual posting',
          'Analyze follower demographics for personalized timing'
        ],
        metrics: {
          current: currentHour,
          previous: currentHour - 2,
          change: -2,
          changePercentage: -8.3,
          benchmark: 19
        },
        estimatedValue: 'Potential +30% reach increase',
        implementationTime: '1 week',
        difficulty: 'easy',
        tags: ['timing', 'scheduling', 'reach'],
        createdAt: new Date(),
        isRead: false
      });
    }

    // Growth Prediction
    const monthlyGrowthPotential = Math.floor(metrics.followers * 0.12);
    insights.push({
      id: `growth-${Date.now()}-5`,
      type: 'opportunity',
      title: 'Growth Potential Identified',
      description: `Based on your current engagement trends, you could gain ${monthlyGrowthPotential}+ new followers this month.`,
      severity: 'low',
      confidence: 76,
      impact: 'positive',
      category: 'Growth',
      actionable: true,
      actionItems: [
        'Implement consistent posting schedule',
        'Engage with accounts in your niche',
        'Use relevant hashtags (30 per post)',
        'Cross-promote on other platforms',
        'Collaborate with similar accounts'
      ],
      metrics: {
        current: metrics.followers,
        previous: metrics.followers - monthlyGrowthPotential * 0.8,
        change: monthlyGrowthPotential * 0.8,
        changePercentage: 12,
        benchmark: monthlyGrowthPotential
      },
      estimatedValue: `${monthlyGrowthPotential}+ new followers`,
      implementationTime: '4 weeks',
      difficulty: 'medium',
      tags: ['growth', 'followers', 'strategy'],
      createdAt: new Date(),
      isRead: false
    });

    // Hashtag Optimization
    insights.push({
      id: `hashtag-${Date.now()}-6`,
      type: 'recommendation',
      title: 'Trending Hashtag Opportunity',
      description: 'Several trending hashtags in your niche (#growthtips #socialmediastrategy) could boost your reach by 40%.',
      severity: 'medium',
      confidence: 83,
      impact: 'positive',
      category: 'Hashtags',
      actionable: true,
      actionItems: [
        'Add #growthtips to next 3 posts',
        'Research competitor hashtag strategies',
        'Use mix of 10 trending + 15 niche + 5 branded hashtags',
        'Monitor hashtag performance weekly'
      ],
      estimatedValue: 'Potential +40% reach increase',
      implementationTime: '1 week',
      difficulty: 'easy',
      tags: ['hashtags', 'trending', 'reach'],
      createdAt: new Date(),
      isRead: false
    });

    // Content Mix Analysis
    const photoPercentage = (metrics.postFrequency * 0.7) * 100;
    if (photoPercentage > 70) {
      insights.push({
        id: `content-${Date.now()}-7`,
        type: 'recommendation',
        title: 'Diversify Content Format',
        description: 'Your content is 80% photos. Consider adding more Reels (35% recommended) for better engagement.',
        severity: 'medium',
        confidence: 89,
        impact: 'positive',
        category: 'Content Strategy',
        actionable: true,
        actionItems: [
          'Plan 2-3 Reels per week',
          'Create behind-the-scenes content',
          'Share user-generated content',
          'Experiment with carousel posts',
          'Try Instagram Live sessions'
        ],
        metrics: {
          current: photoPercentage,
          previous: photoPercentage,
          change: 0,
          changePercentage: 0,
          benchmark: 35
        },
        estimatedValue: 'Potential +50% engagement increase',
        implementationTime: '3 weeks',
        difficulty: 'medium',
        tags: ['content', 'diversification', 'format'],
        createdAt: new Date(),
        isRead: false
      });
    }

    // Story Completion Rate Alert
    if (metrics.storyCompletionRate < 60) {
      insights.push({
        id: `story-${Date.now()}-8`,
        type: 'alert',
        title: 'Low Story Completion Rate',
        description: `Your story completion rate of ${metrics.storyCompletionRate.toFixed(1)}% is below the 70% industry average.`,
        severity: 'high',
        confidence: 86,
        impact: 'negative',
        category: 'Stories',
        actionable: true,
        actionItems: [
          'Keep stories between 5-7 frames',
          'Use polls and questions to increase engagement',
          'Create compelling hooks in first frame',
          'Use trending stickers and music',
          'Post during peak story hours'
        ],
        metrics: {
          current: metrics.storyCompletionRate,
          previous: metrics.storyCompletionRate * 1.08,
          change: metrics.storyCompletionRate * 1.08 - metrics.storyCompletionRate,
          changePercentage: -8,
          benchmark: 70
        },
        estimatedValue: 'Potential +35% engagement increase',
        implementationTime: '2 weeks',
        difficulty: 'medium',
        tags: ['stories', 'completion', 'engagement'],
        createdAt: new Date(),
        isRead: false
      });
    }

    return insights.sort((a, b) => {
      // Sort by severity and confidence
      const severityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (severityOrder[b.severity] - severityOrder[a.severity]) || (b.confidence - a.confidence);
    });
  }

  private generateMockMetrics(): PerformanceMetrics {
    return {
      engagementRate: Math.random() * 4 + 1, // 1-5%
      followers: Math.floor(Math.random() * 50000) + 1000,
      impressions: Math.floor(Math.random() * 100000) + 10000,
      reach: Math.floor(Math.random() * 80000) + 8000,
      saves: Math.floor(Math.random() * 500) + 50,
      comments: Math.floor(Math.random() * 200) + 20,
      likes: Math.floor(Math.random() * 2000) + 200,
      shares: Math.floor(Math.random() * 100) + 10,
      profileVisits: Math.floor(Math.random() * 2000) + 200,
      websiteClicks: Math.floor(Math.random() * 300) + 30,
      storyCompletionRate: Math.random() * 40 + 40, // 40-80%
      reelViews: Math.floor(Math.random() * 15000) + 1000,
      postFrequency: Math.random() * 6 + 2, // 2-8 posts per week
      avgLikesPerPost: Math.floor(Math.random() * 300) + 50,
      avgCommentsPerPost: Math.floor(Math.random() * 30) + 5
    };
  }

  private generateMockProfile(): AccountProfile {
    const accountTypes = ['personal', 'business', 'creator'] as const;
    const niches = ['lifestyle', 'fitness', 'food', 'travel', 'business', 'technology', 'fashion', 'beauty'];
    
    return {
      accountType: accountTypes[Math.floor(Math.random() * accountTypes.length)],
      niche: niches[Math.floor(Math.random() * niches.length)],
      followerCount: Math.floor(Math.random() * 50000) + 1000,
      postingFrequency: Math.random() * 6 + 2,
      lastPostTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      contentMix: {
        photos: Math.floor(Math.random() * 7) + 3,
        videos: Math.floor(Math.random() * 3) + 1,
        reels: Math.floor(Math.random() * 4) + 1,
        stories: Math.floor(Math.random() * 10) + 5
      }
    };
  }

  generateAllInsights(): { insights: InsightData[], profile: AccountProfile, metrics: PerformanceMetrics } {
    const profile = this.generateMockProfile();
    const metrics = this.generateMockMetrics();
    const insights = this.generateInsights(profile, metrics);
    
    return {
      insights,
      profile,
      metrics
    };
  }

  markInsightAsRead(insightId: string): void {
    // In a real app, this would update the backend
    console.log(`Marking insight ${insightId} as read`);
  }

  markAllAsRead(): void {
    // In a real app, this would update the backend
    console.log('Marking all insights as read');
  }
}

export const insightGenerator = new InsightGenerator();