/**
 * Realistic Mock Data Generator for Instagram Analytics
 * Generates believable test data that mimics real Instagram account patterns
 */

import { formatNumber, formatPercentage } from './dataFormatting';

// Types for mock data generation
export interface MockAccountData {
  username: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  engagement_rate: number;
  average_likes: number;
  average_comments: number;
  is_verified: boolean;
  is_business: boolean;
  full_name: string;
  biography: string;
  profile_picture_url?: string;
  follower_growth_rate: number;
  post_frequency: number; // posts per month
  top_hashtags: string[];
  audience_demographics: {
    age_groups: Record<string, number>;
    gender_split: Record<string, number>;
    top_countries: Record<string, number>;
  };
}

// Predefined realistic account templates
const ACCOUNT_TEMPLATES = {
  nano: { // 1K - 10K followers
    followers_range: [1000, 10000],
    engagement_rate: [3, 8],
    post_frequency: [4, 12],
    verified_probability: 0.05
  },
  micro: { // 10K - 100K followers
    followers_range: [10000, 100000],
    engagement_rate: [2, 6],
    post_frequency: [8, 20],
    verified_probability: 0.15
  },
  macro: { // 100K - 1M followers
    followers_range: [100000, 1000000],
    engagement_rate: [1.5, 4],
    post_frequency: [12, 30],
    verified_probability: 0.4
  },
  mega: { // 1M+ followers
    followers_range: [1000000, 50000000],
    engagement_rate: [0.8, 3],
    post_frequency: [15, 45],
    verified_probability: 0.8
  }
};

// Realistic usernames and names
const USERNAMES = [
  'alexadventures', 'sarah_travels', 'mike_fitness', 'emily_arts', 'david_cooking',
  'lisa_photography', 'jake_music', 'anna_fashion', 'chris_tech', 'maya_wellness',
  'jordan_sports', 'zoe_lifestyle', 'ryan_foodie', 'nina_design', 'cody_outdoors',
  'kelly_beauty', 'tyler_business', 'ivy_education', 'lucy_fitness', 'ben_startup'
];

const FIRST_NAMES = [
  'Alex', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Jake', 'Anna', 'Chris', 'Maya',
  'Jordan', 'Zoe', 'Ryan', 'Nina', 'Cody', 'Kelly', 'Tyler', 'Ivy', 'Lucy', 'Ben',
  'Emma', 'Jack', 'Sophie', 'Oliver', 'Ava', 'Liam', 'Mia', 'Noah', 'Isabella', 'Ethan'
];

const LAST_NAMES = [
  'Johnson', 'Smith', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson',
  'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis'
];

const BUSINESS_TYPES = [
  'Travel Blogger', 'Fitness Coach', 'Artist', 'Chef', 'Photographer', 'Fashion Influencer',
  'Tech Reviewer', 'Wellness Expert', 'Sports Trainer', 'Lifestyle Creator', 'Business Coach',
  'Designer', 'Educator', 'Entrepreneur', 'Food Blogger', 'Beauty Guru', 'Travel Photographer'
];

const BIOGRAPHIES = [
  '✨ Living life one adventure at a time 📸 Travel | Photography | Inspiration',
  '🏋️‍♂️ Fitness coach helping you achieve your goals 💪 Personal trainer | Nutrition tips',
  '🎨 Creative soul sharing art and inspiration ✏️ Digital Artist | Illustration | Design',
  '👨‍🍳 Sharing delicious recipes and cooking tips 🍳 Chef | Food Enthusiast | Recipe Developer',
  '📷 Capturing moments through my lens 📸 Professional Photographer | Visual Storyteller',
  '👗 Fashion enthusiast sharing style inspiration 💄 Fashion Blogger | Style Advisor',
  '📱 Tech lover reviewing the latest gadgets ⚡ Technology | Innovation | Reviews',
  '🧘‍♀️ Wellness advocate promoting healthy living 🌱 Mindfulness | Yoga | Self-care',
  '⚽ Sports enthusiast and trainer 🏃‍♂️ Athletic Coach | Sports Analysis | Motivation',
  '🌟 Lifestyle blogger sharing daily inspiration ✨ Positive Vibes | Motivation | Growth'
];

const HASHTAGS = {
  travel: ['#travel', '#wanderlust', '#adventure', '#explore', '#travellife', '#vacation', '#trip', '#journey'],
  fitness: ['#fitness', '#workout', '#gym', '#health', '#motivation', '#fitlife', '#training', '#exercise'],
  food: ['#food', '#foodie', '#cooking', '#recipe', '#yum', '#delicious', '#foodporn', '#chef'],
  fashion: ['#fashion', '#style', '#outfit', '#ootd', '#fashionista', '#styleinspo', '#trend', '#look'],
  photography: ['#photography', '#photo', '#picoftheday', '#capture', '#camera', '#lens', '#art', '#visual'],
  business: ['#business', '#entrepreneur', '#success', '#motivation', '#startup', '#hustle', '#leadership', '#growth']
};

// Generate realistic follower count with natural variation
function generateRealisticFollowers(template: keyof typeof ACCOUNT_TEMPLATES): number {
  const config = ACCOUNT_TEMPLATES[template];
  const [min, max] = config.followers_range;
  
  // Use log distribution for more realistic follower counts
  const logMin = Math.log(min);
  const logMax = Math.log(max);
  const randomLog = logMin + (logMax - logMin) * Math.random();
  const followers = Math.exp(randomLog);
  
  // Add some natural variance
  const variance = 0.8 + (Math.random() - 0.5) * 0.4; // ±20% variance
  return Math.round(followers * variance);
}

// Generate realistic engagement rate based on follower count
function generateRealisticEngagementRate(template: keyof typeof ACCOUNT_TEMPLATES): number {
  const config = ACCOUNT_TEMPLATES[template];
  const [min, max] = config.engagement_rate;
  
  // Engagement typically decreases with follower count, add some randomness
  const random = min + (max - min) * Math.random();
  const variance = 0.9 + (Math.random() - 0.5) * 0.2; // ±10% variance
  return Math.round(random * variance * 100) / 100;
}

// Generate realistic post frequency
function generateRealisticPostFrequency(template: keyof typeof ACCOUNT_TEMPLATES): number {
  const config = ACCOUNT_TEMPLATES[template];
  const [min, max] = config.post_frequency;
  
  // Most accounts have consistent posting patterns with some variation
  const base = min + (max - min) * Math.random();
  const weeklyPattern = Math.sin(Date.now() / (1000 * 60 * 60 * 24 * 7)) * 2; // Weekly variation
  const result = Math.max(1, base + weeklyPattern);
  
  return Math.round(result * 10) / 10;
}

// Generate realistic audience demographics
function generateAudienceDemographics(): MockAccountData['audience_demographics'] {
  // Age groups with realistic distributions
  const ageGroups = {
    '13-17': Math.random() * 15 + 5,      // 5-20%
    '18-24': Math.random() * 25 + 25,     // 25-50%
    '25-34': Math.random() * 20 + 20,     // 20-40%
    '35-44': Math.random() * 15 + 10,     // 10-25%
    '45-54': Math.random() * 10 + 5,      // 5-15%
    '55+': Math.random() * 8 + 2          // 2-10%
  };

  // Normalize age groups to 100%
  const totalAge = Object.values(ageGroups).reduce((sum, val) => sum + val, 0);
  Object.keys(ageGroups).forEach(key => {
    ageGroups[key] = Math.round((ageGroups[key] / totalAge) * 100);
  });

  // Gender split with slight female bias (typical for Instagram)
  const femalePercent = 55 + Math.random() * 10; // 55-65%
  const malePercent = 100 - femalePercent;

  // Top countries (Instagram is global but US-heavy)
  const countries = {
    'United States': 30 + Math.random() * 20,      // 30-50%
    'United Kingdom': 8 + Math.random() * 7,       // 8-15%
    'Canada': 5 + Math.random() * 8,               // 5-13%
    'Australia': 4 + Math.random() * 6,            // 4-10%
    'Germany': 3 + Math.random() * 5,              // 3-8%
    'France': 3 + Math.random() * 4,               // 3-7%
    'Other': 15 + Math.random() * 15               // 15-30%
  };

  // Normalize to 100%
  const totalCountries = Object.values(countries).reduce((sum, val) => sum + val, 0);
  Object.keys(countries).forEach(key => {
    countries[key] = Math.round((countries[key] / totalCountries) * 100);
  });

  return {
    age_groups: ageGroups,
    gender_split: {
      female: Math.round(femalePercent),
      male: Math.round(malePercent)
    },
    top_countries: countries
  };
}

// Main function to generate realistic mock account data
export function generateRealisticMockData(
  template: keyof typeof ACCOUNT_TEMPLATES = 'micro',
  username?: string
): MockAccountData {
  const config = ACCOUNT_TEMPLATES[template];
  const followers = generateRealisticFollowers(template);
  const following = Math.round(followers * (0.1 + Math.random() * 0.3)); // 10-40% of followers
  const engagement_rate = generateRealisticEngagementRate(template);
  const post_frequency = generateRealisticPostFrequency(template);
  const posts_count = Math.round(post_frequency * (12 + Math.random() * 24)); // 12-36 months of posting
  
  // Generate realistic average engagement numbers
  const average_engagement = Math.round(followers * (engagement_rate / 100));
  const likes_ratio = 0.85 + Math.random() * 0.1; // 85-95% likes vs total engagement
  const comments_ratio = 1 - likes_ratio;
  
  const average_likes = Math.round(average_engagement * likes_ratio);
  const average_comments = Math.round(average_engagement * comments_ratio);

  // Generate realistic hashtags based on follower count
  const hashtagCategory = Object.keys(HASHTAGS)[Math.floor(Math.random() * Object.keys(HASHTAGS).length)] as keyof typeof HASHTAGS;
  const top_hashtags = HASHTAGS[hashtagCategory].slice(0, 5);

  // Select realistic name and bio
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const businessType = BUSINESS_TYPES[Math.floor(Math.random() * BUSINESS_TYPES.length)];
  const biography = BIOGRAPHIES[Math.floor(Math.random() * BIOGRAPHIES.length)];
  
  // Determine if account is verified based on template and randomness
  const is_verified = Math.random() < config.verified_probability;
  
  // Business accounts are more likely at higher follower counts
  const is_business = Math.random() < (template === 'mega' ? 0.8 : template === 'macro' ? 0.6 : 0.3);

  return {
    username: username || USERNAMES[Math.floor(Math.random() * USERNAMES.length)],
    followers_count: followers,
    following_count: Math.min(following, 7500), // Instagram's following limit
    posts_count: posts_count,
    engagement_rate: Math.round(engagement_rate * 100) / 100,
    average_likes,
    average_comments,
    is_verified,
    is_business,
    full_name: `${firstName} ${lastName}`,
    biography: `${biography} ${is_verified ? '✅' : ''} ${is_business ? '💼' : ''}`,
    profile_picture_url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&h=150&fit=crop&crop=face`,
    follower_growth_rate: Math.round((Math.random() - 0.3) * 20 * 100) / 100, // -6% to +14% growth
    post_frequency,
    top_hashtags,
    audience_demographics: generateAudienceDemographics()
  };
}

// Generate time series data for charts
export function generateTimeSeriesData(
  baseValue: number,
  days: number = 30,
  growthRate: number = 0.02, // 2% daily growth
  volatility: number = 0.1   // 10% daily volatility
): Array<{ date: string; value: number }> {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Calculate value with growth and random volatility
    const growth = Math.pow(1 + growthRate, days - i);
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    const value = Math.round(baseValue * growth * randomFactor);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(0, value)
    });
  }
  
  return data;
}

// Generate realistic engagement patterns for posts
export function generateEngagementPattern(
  followerCount: number,
  baseEngagementRate: number,
  postCount: number = 10
): Array<{
  likes: number;
  comments: number;
  shares?: number;
  saves?: number;
  engagement_rate: number;
  posted_at: string;
}> {
  const patterns = [];
  const today = new Date();
  
  for (let i = 0; i < postCount; i++) {
    const postDate = new Date(today);
    postDate.setDate(postDate.getDate() - i * (Math.random() * 3 + 1)); // Random posting interval
    
    // Posts typically get less engagement as they get older
    const ageMultiplier = Math.pow(0.95, i); // 5% decay per day
    const randomMultiplier = 0.7 + Math.random() * 0.6; // 70-130% of base engagement
    
    const totalEngagement = Math.round(
      followerCount * (baseEngagementRate / 100) * ageMultiplier * randomMultiplier
    );
    
    const likes = Math.round(totalEngagement * (0.85 + Math.random() * 0.1));
    const comments = Math.round(totalEngagement * (0.1 + Math.random() * 0.05));
    const shares = Math.round(totalEngagement * (0.03 + Math.random() * 0.02));
    const saves = Math.round(totalEngagement * (0.02 + Math.random() * 0.03));
    
    const actualEngagementRate = ((likes + comments + shares + saves) / followerCount) * 100;
    
    patterns.push({
      likes,
      comments,
      shares,
      saves,
      engagement_rate: Math.round(actualEngagementRate * 100) / 100,
      posted_at: postDate.toISOString()
    });
  }
  
  return patterns.reverse(); // Most recent first
}

// Generate realistic competitor data for benchmarking
export function generateCompetitorData(
  template: keyof typeof ACCOUNT_TEMPLATES,
  count: number = 5
): MockAccountData[] {
  const competitors = [];
  
  for (let i = 0; i < count; i++) {
    // Add some variation between competitors
    const variation = 0.8 + Math.random() * 0.4; // 80-120% of template values
    const competitorTemplate = Math.random() < 0.3 ? 
      (Math.random() < 0.5 ? 'micro' : 'macro') : template;
    
    const data = generateRealisticMockData(competitorTemplate);
    
    // Apply variation
    data.followers_count = Math.round(data.followers_count * variation);
    data.following_count = Math.round(data.following_count * variation);
    data.engagement_rate = Math.round(data.engagement_rate * variation * 100) / 100;
    data.average_likes = Math.round(data.average_likes * variation);
    data.average_comments = Math.round(data.average_comments * variation);
    
    // Add competitor suffix
    data.username += `_comp${i + 1}`;
    data.full_name += ` (Competitor ${i + 1})`;
    
    competitors.push(data);
  }
  
  return competitors;
}

// Export utility to format data for UI consumption
export function formatMockDataForDisplay(data: MockAccountData) {
  return {
    ...data,
    followers_formatted: formatNumber(data.followers_count),
    following_formatted: formatNumber(data.following_count),
    posts_formatted: formatNumber(data.posts_count),
    engagement_rate_formatted: formatPercentage(data.engagement_rate),
    growth_rate_formatted: `${data.follower_growth_rate > 0 ? '+' : ''}${data.follower_growth_rate}%`,
    post_frequency_formatted: `${data.post_frequency.toFixed(1)}/month`
  };
}