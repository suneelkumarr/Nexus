#!/usr/bin/env node

/**
 * Test Data Generation Script
 * Generates realistic test data for Instagram Analytics Platform testing
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Ensure test-data directory exists
const testDataDir = join(process.cwd(), 'test-data');
if (!existsSync(testDataDir)) {
  mkdirSync(testDataDir, { recursive: true });
}

/**
 * Generate mock user data
 */
function generateUsers(count = 100) {
  const users = [];
  const industries = ['fitness', 'business', 'lifestyle', 'food', 'travel', 'fashion', 'technology'];
  const goals = ['growth', 'engagement', 'analytics', 'content-strategy'];
  const experienceLevels = ['beginner', 'intermediate', 'advanced'];
  const subscriptionTiers = ['free', 'basic', 'pro', 'enterprise'];

  for (let i = 1; i <= count; i++) {
    users.push({
      id: `user-${i.toString().padStart(3, '0')}`,
      email: `user${i}@example.com`,
      name: `Test User ${i}`,
      avatar: `https://example.com/avatars/user${i}.jpg`,
      subscriptionTier: subscriptionTiers[Math.floor(Math.random() * subscriptionTiers.length)],
      onboardingCompleted: Math.random() > 0.2, // 80% completed
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastLoginAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      preferences: {
        industry: industries[Math.floor(Math.random() * industries.length)],
        goals: goals.slice(0, Math.floor(Math.random() * 3) + 1),
        experienceLevel: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
        contentTypes: ['video', 'carousel', 'image'].slice(0, Math.floor(Math.random() * 3) + 1),
        frequency: Math.floor(Math.random() * 7) + 1 // posts per week
      },
      analytics: {
        followerCount: Math.floor(Math.random() * 50000) + 1000,
        followingCount: Math.floor(Math.random() * 1000) + 100,
        postCount: Math.floor(Math.random() * 1000) + 50,
        totalLikes: Math.floor(Math.random() * 100000) + 1000,
        totalComments: Math.floor(Math.random() * 10000) + 100,
        engagementRate: (Math.random() * 8 + 1).toFixed(2),
        averageLikes: Math.floor(Math.random() * 1000) + 50,
        averageComments: Math.floor(Math.random() * 100) + 5,
        growthRate: (Math.random() * 20 - 5).toFixed(2), // -5% to +15%
        bestPostingTimes: [
          `${Math.floor(Math.random() * 12) + 6}:00`,
          `${Math.floor(Math.random() * 12) + 6}:00`,
          `${Math.floor(Math.random() * 12) + 6}:00`
        ]
      },
      conversionEvents: {
        signupDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        onboardingCompletedDate: Math.random() > 0.2 
          ? new Date(Date.now() - Math.random() * 80 * 24 * 60 * 60 * 1000).toISOString() 
          : null,
        firstAnalyticsViewed: Math.random() > 0.3 
          ? new Date(Date.now() - Math.random() * 70 * 24 * 60 * 60 * 1000).toISOString() 
          : null,
        upgradeDate: Math.random() > 0.8 
          ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() 
          : null,
        churnDate: Math.random() > 0.9 
          ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() 
          : null
      }
    });
  }

  return users;
}

/**
 * Generate mock analytics insights
 */
function generateInsights(count = 500) {
  const insightTypes = ['performance', 'engagement', 'growth', 'content', 'timing', 'audience', 'trending'];
  const impacts = ['low', 'medium', 'high'];
  const statuses = ['active', 'resolved', 'ignored'];
  
  const insights = [];

  for (let i = 1; i <= count; i++) {
    const type = insightTypes[Math.floor(Math.random() * insightTypes.length)];
    const impact = impacts[Math.floor(Math.random() * impacts.length)];
    
    insights.push({
      id: `insight-${i.toString().padStart(4, '0')}`,
      type,
      title: generateInsightTitle(type),
      description: generateInsightDescription(type),
      value: generateInsightValue(type),
      confidence: Math.floor(Math.random() * 25) + 75, // 75-100%
      impact,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: impact === 'high' ? 3 : impact === 'medium' ? 2 : 1,
      category: type,
      tags: generateTags(type),
      actionItems: generateActionItems(type),
      dataPoints: generateDataPoints(type),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      userId: `user-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`,
      metadata: {
        source: 'ai-analysis',
        algorithm: 'v2.1',
        dataRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      }
    });
  }

  return insights;
}

/**
 * Generate mock conversion funnel data
 */
function generateConversionFunnels(count = 10) {
  const funnels = [];

  for (let i = 1; i <= count; i++) {
    const totalVisitors = Math.floor(Math.random() * 10000) + 1000;
    
    funnels.push({
      id: `funnel-${i}`,
      name: `Conversion Funnel ${i}`,
      description: `User conversion journey for ${['signup', 'engagement', 'upgrade'][i % 3]}`,
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      steps: [
        {
          name: 'Visit',
          count: totalVisitors,
          rate: 100,
          dropoffRate: 0,
          conversionRate: 100,
          averageTime: 0,
          description: 'Landing page visitors'
        },
        {
          name: 'Signup',
          count: Math.floor(totalVisitors * (0.15 + Math.random() * 0.15)),
          rate: Math.floor((0.15 + Math.random() * 0.15) * 100),
          dropoffRate: Math.floor((0.70 + Math.random() * 0.10) * 100),
          conversionRate: Math.floor((0.15 + Math.random() * 0.15) * 100),
          averageTime: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
          description: 'Users who completed signup'
        },
        {
          name: 'Onboarding',
          count: Math.floor(totalVisitors * (0.08 + Math.random() * 0.10)),
          rate: Math.floor((0.08 + Math.random() * 0.10) * 100),
          dropoffRate: Math.floor((0.15 + Math.random() * 0.10) * 100),
          conversionRate: Math.floor((0.50 + Math.random() * 0.30) * 100),
          averageTime: Math.floor(Math.random() * 600) + 180, // 3-13 minutes
          description: 'Users who completed onboarding'
        },
        {
          name: 'First Analytics',
          count: Math.floor(totalVisitors * (0.05 + Math.random() * 0.07)),
          rate: Math.floor((0.05 + Math.random() * 0.07) * 100),
          dropoffRate: Math.floor((0.15 + Math.random() * 0.10) * 100),
          conversionRate: Math.floor((0.60 + Math.random() * 0.25) * 100),
          averageTime: Math.floor(Math.random() * 1200) + 300, // 5-25 minutes
          description: 'Users who viewed their first analytics'
        },
        {
          name: 'Conversion',
          count: Math.floor(totalVisitors * (0.02 + Math.random() * 0.04)),
          rate: Math.floor((0.02 + Math.random() * 0.04) * 100),
          dropoffRate: Math.floor((0.30 + Math.random() * 0.20) * 100),
          conversionRate: Math.floor((0.35 + Math.random() * 0.30) * 100),
          averageTime: Math.floor(Math.random() * 2400) + 600, // 10-50 minutes
          description: 'Users who converted (upgraded/purchased)'
        }
      ],
      overallConversionRate: Math.floor((totalVisitors * 0.03) / totalVisitors * 10000) / 100,
      averageConversionTime: Math.floor(Math.random() * 7200) + 1800, // 30min - 2.5hr
      segments: {
        newUsers: {
          conversionRate: 2.5,
          count: Math.floor(totalVisitors * 0.7)
        },
        returningUsers: {
          conversionRate: 4.8,
          count: Math.floor(totalVisitors * 0.3)
        }
      },
      abTests: generateABTests(),
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return funnels;
}

/**
 * Generate A/B test data
 */
function generateABTests(count = 20) {
  const tests = [];
  const statuses = ['draft', 'running', 'paused', 'completed', 'cancelled'];
  const testTypes = ['ui-change', 'content-variant', 'feature-toggle', 'pricing', 'onboarding'];
  const metrics = ['conversion-rate', 'signup-rate', 'engagement-rate', 'retention-rate', 'revenue'];

  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const variantsCount = Math.random() > 0.3 ? 2 : 3;
    
    tests.push({
      id: `ab-test-${i.toString().padStart(3, '0')}`,
      name: generateABTestName(),
      description: generateABTestDescription(),
      type: testTypes[Math.floor(Math.random() * testTypes.length)],
      status,
      hypothesis: generateHypothesis(),
      variants: generateVariants(variantsCount),
      primaryMetric: metrics[Math.floor(Math.random() * metrics.length)],
      secondaryMetrics: metrics.slice(0, Math.floor(Math.random() * 3) + 1),
      trafficSplit: Array.from({ length: variantsCount }, (_, i) => ({
        variant: String.fromCharCode(65 + i), // A, B, C
        percentage: Math.floor(100 / variantsCount)
      })),
      sampleSize: {
        required: Math.floor(Math.random() * 10000) + 1000,
        current: Math.floor(Math.random() * 8000) + 500
      },
      confidence: status === 'completed' ? Math.floor(Math.random() * 30) + 70 : null,
      winner: status === 'completed' ? String.fromCharCode(65 + Math.floor(Math.random() * variantsCount)) : null,
      statisticalSignificance: status === 'completed' ? Math.random() > 0.5 : false,
      startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: ['completed', 'cancelled'].includes(status) 
        ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString() 
        : null,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        platform: 'instagram-analytics',
        version: '1.0.0',
        tags: generateTags('ab-test')
      }
    });
  }

  return tests;
}

// Helper functions for generating realistic data
function generateInsightTitle(type) {
  const titles = {
    performance: ['Peak Performance Window', 'Engagement Spike Detected', 'Optimal Posting Schedule'],
    engagement: ['High Engagement Pattern', 'Comment Response Opportunity', 'Engagement Rate Alert'],
    growth: ['Follower Growth Acceleration', 'Audience Expansion Opportunity', 'Growth Trend Analysis'],
    content: ['Content Performance Leader', 'Viral Content Pattern', 'Content Mix Optimization'],
    timing: ['Best Posting Times', 'Weekly Performance Pattern', 'Seasonal Trend Alert'],
    audience: ['Audience Behavior Shift', 'Demographic Insight', 'Follower Engagement Patterns'],
    trending: ['Trending Hashtag Opportunity', 'Viral Trend Alert', 'Industry Trend Analysis']
  };
  
  const typeTitles = titles[type] || titles.performance;
  return typeTitles[Math.floor(Math.random() * typeTitles.length)];
}

function generateInsightDescription(type) {
  return `Based on analysis of your recent activity, we've identified a significant pattern in your ${type} metrics. This insight is generated from ${Math.floor(Math.random() * 1000) + 500} data points and represents an ${Math.floor(Math.random() * 20) + 80}% confidence level in the recommendation.`;
}

function generateInsightValue(type) {
  const values = {
    performance: `${(Math.random() * 5 + 2).toFixed(1)}% engagement boost`,
    engagement: `${Math.floor(Math.random() * 50) + 10} more comments per post`,
    growth: `${Math.floor(Math.random() * 500) + 100} additional followers`,
    content: `${(Math.random() * 3 + 1).toFixed(1)}x better performance`,
    timing: `2:00 PM - 4:00 PM peak hours`,
    audience: `${Math.floor(Math.random() * 30) + 20}% more active audience`,
    trending: `${Math.floor(Math.random() * 10) + 5} trending hashtags`
  };
  
  return values[type] || values.performance;
}

function generateTags(type) {
  const allTags = ['automated', 'ai-generated', 'high-priority', 'actionable', 'trending', 'seasonal', 'performance'];
  return allTags.slice(0, Math.floor(Math.random() * 4) + 2);
}

function generateActionItems(type) {
  const actions = [
    'Schedule posts during peak hours',
    'Increase video content ratio',
    'Engage with comments within 1 hour',
    'Use trending hashtags in posts',
    'Post during weekdays for higher engagement',
    'Create more carousel content',
    'Optimize bio for better discoverability'
  ];
  
  return actions.slice(0, Math.floor(Math.random() * 3) + 1);
}

function generateDataPoints(type) {
  return Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
    timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    value: Math.random() * 100,
    metric: type
  }));
}

function generateABTestName() {
  const names = [
    'CTA Button Color Test',
    'Onboarding Flow Simplification',
    'Dashboard Layout Optimization',
    'Email Subject Line A/B Test',
    'Landing Page Hero Section',
    'Pricing Page Design Test',
    'Feature Discovery Enhancement',
    'User Onboarding Journey'
  ];
  
  return names[Math.floor(Math.random() * names.length)];
}

function generateABTestDescription() {
  return 'This test aims to improve user engagement and conversion rates by testing different variations of our user interface and content.';
}

function generateHypothesis() {
  return 'By changing the user interface element, we expect to see an increase in conversion rate and user engagement.';
}

function generateVariants(count) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Variant ${String.fromCharCode(65 + i)}`,
    description: `Description of variation ${String.fromCharCode(65 + i)}`,
    conversionRate: (Math.random() * 5 + 2).toFixed(2),
    traffic: Math.floor(Math.random() * 5000) + 1000,
    users: Math.floor(Math.random() * 4500) + 800,
    confidence: Math.floor(Math.random() * 30) + 70,
    isControl: i === 0
  }));
}

// Generate all test data
console.log('Generating test data...');

const users = generateUsers(100);
const insights = generateInsights(500);
const conversionFunnels = generateConversionFunnels(10);
const abTests = generateABTests(20);

// Save to files
writeFileSync(join(testDataDir, 'users.json'), JSON.stringify(users, null, 2));
writeFileSync(join(testDataDir, 'insights.json'), JSON.stringify(insights, null, 2));
writeFileSync(join(testDataDir, 'conversion-funnels.json'), JSON.stringify(conversionFunnels, null, 2));
writeFileSync(join(testDataDir, 'ab-tests.json'), JSON.stringify(abTests, null, 2));

// Generate summary
const summary = {
  generatedAt: new Date().toISOString(),
  counts: {
    users: users.length,
    insights: insights.length,
    conversionFunnels: conversionFunnels.length,
    abTests: abTests.length
  },
  statistics: {
    totalUsers: users.length,
    completedOnboarding: users.filter(u => u.onboardingCompleted).length,
    activeUsers: users.filter(u => new Date(u.lastLoginAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    averageEngagementRate: (users.reduce((sum, u) => sum + parseFloat(u.analytics.engagementRate), 0) / users.length).toFixed(2)
  }
};

writeFileSync(join(testDataDir, 'summary.json'), JSON.stringify(summary, null, 2));

console.log('\n✅ Test data generated successfully!');
console.log(`📊 Generated: ${users.length} users, ${insights.length} insights, ${conversionFunnels.length} funnels, ${abTests.length} A/B tests`);
console.log(`📁 Files saved to: ${testDataDir}`);
console.log(`📄 Summary: ${testDataDir}/summary.json`);