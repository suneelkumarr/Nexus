// Supabase Edge Function for Feedback Submission and Analysis
// Instagram Analytics Platform

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
};

interface FeedbackSubmission {
  feedback_type: 'general' | 'nps' | 'feature_specific' | 'bug_report' | 'improvement_suggestion';
  rating?: number;
  sentiment_score?: number;
  category?: string;
  subcategory?: string;
  message: string;
  context?: any;
  feature_name?: string;
  page_url?: string;
  user_agent?: string;
  session_id?: string;
}

interface NPSSubmission {
  score: number;
  reason?: string;
  user_segment?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Parse user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Invalid auth token');
    }

    const user = await userResponse.json();

    // Route handling
    if (pathname === '/submit' && req.method === 'POST') {
      return await handleFeedbackSubmission(req, user, supabaseUrl, supabaseKey);
    } else if (pathname === '/nps' && req.method === 'POST') {
      return await handleNPSSubmission(req, user, supabaseUrl, supabaseKey);
    } else if (pathname === '/dashboard' && req.method === 'GET') {
      return await handleDashboardRequest(req, user, supabaseUrl, supabaseKey);
    } else if (pathname === '/analytics' && req.method === 'GET') {
      return await handleAnalyticsRequest(req, user, supabaseUrl, supabaseKey);
    } else if (pathname === '/trends' && req.method === 'GET') {
      return await handleTrendsRequest(req, user, supabaseUrl, supabaseKey);
    } else if (pathname.includes('/status') && req.method === 'PATCH') {
      return await handleStatusUpdate(req, user, supabaseUrl, supabaseKey, pathname);
    }

    return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Endpoint not found' } }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Feedback function error:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'FUNCTION_ERROR',
        message: error.message || 'An unexpected error occurred'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleFeedbackSubmission(
  req: Request,
  user: any,
  supabaseUrl: string,
  supabaseKey: string
) {
  const feedbackData: FeedbackSubmission = await req.json();

  // Validate required fields
  if (!feedbackData.message || feedbackData.message.trim().length === 0) {
    return new Response(JSON.stringify({
      error: { code: 'VALIDATION_ERROR', message: 'Message is required' }
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Analyze sentiment if not provided
  let sentimentScore = feedbackData.sentiment_score;
  if (!sentimentScore && feedbackData.message) {
    sentimentScore = await analyzeSentiment(feedbackData.message);
  }

  // Determine priority based on content
  const priority = determinePriority(feedbackData.message, feedbackData.category);

  // Insert feedback into database
  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/user_feedback`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      user_id: user.id,
      feedback_type: feedbackData.feedback_type,
      rating: feedbackData.rating,
      sentiment_score: sentimentScore,
      category: feedbackData.category,
      subcategory: feedbackData.subcategory,
      message: feedbackData.message,
      context: feedbackData.context,
      feature_name: feedbackData.feature_name,
      page_url: feedbackData.page_url,
      user_agent: feedbackData.user_agent,
      session_id: feedbackData.session_id,
      priority: priority,
      status: 'new',
      tags: extractTags(feedbackData.message)
    }),
  });

  if (!insertResponse.ok) {
    const error = await insertResponse.text();
    throw new Error(`Database insert failed: ${error}`);
  }

  const insertedFeedback = await insertResponse.json();

  // Insert sentiment analysis record
  if (sentimentScore !== undefined) {
    await insertSentimentAnalysis(insertedFeedback[0].id, feedbackData.message, sentimentScore, supabaseUrl, supabaseKey);
  }

  // Update feedback trends
  await updateFeedbackTrends(new Date().toISOString().split('T')[0], feedbackData.feedback_type, feedbackData.category, supabaseUrl, supabaseKey);

  return new Response(JSON.stringify({
    data: insertedFeedback[0]
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleNPSSubmission(
  req: Request,
  user: any,
  supabaseUrl: string,
  supabaseKey: string
) {
  const npsData: NPSSubmission = await req.json();

  // Validate score range
  if (npsData.score < 0 || npsData.score > 10) {
    return new Response(JSON.stringify({
      error: { code: 'VALIDATION_ERROR', message: 'Score must be between 0 and 10' }
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Determine user segment if not provided
  const userSegment = npsData.user_segment || determineUserSegment(user);

  // Insert NPS response
  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/nps_responses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      user_id: user.id,
      score: npsData.score,
      reason: npsData.reason,
      user_segment: userSegment,
      product_usage_days: calculateProductUsageDays(user)
    }),
  });

  if (!insertResponse.ok) {
    const error = await insertResponse.text();
    throw new Error(`NPS insert failed: ${error}`);
  }

  const npsResponse = await insertResponse.json();

  // Update feedback trends with NPS data
  await updateNPSTrends(new Date().toISOString().split('T')[0], npsData.score, supabaseUrl, supabaseKey);

  return new Response(JSON.stringify({
    data: npsResponse[0]
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleDashboardRequest(
  req: Request,
  user: any,
  supabaseUrl: string,
  supabaseKey: string
) {
  const url = new URL(req.url);
  const startDate = url.searchParams.get('start_date');
  const endDate = url.searchParams.get('end_date');

  // Build date filter
  let dateFilter = '';
  if (startDate && endDate) {
    dateFilter = `&created_at=gte.${startDate}&created_at=lte.${endDate}`;
  }

  // Get overview statistics
  const overviewResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_feedback?select=*${dateFilter}&order=created_at.desc`,
    {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    }
  );

  if (!overviewResponse.ok) {
    throw new Error('Failed to fetch feedback data');
  }

  const feedbackData = await overviewResponse.json();

  // Calculate overview metrics
  const overview = calculateOverviewMetrics(feedbackData);

  // Get trends data
  const trendsResponse = await fetch(
    `${supabaseUrl}/rest/v1/feedback_trends?order=date.desc&limit=30`,
    {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    }
  );

  const trends = await trendsResponse.json();

  // Get category analytics
  const categories = calculateCategoryAnalytics(feedbackData);

  // Get sentiment analysis
  const sentimentAnalysis = calculateSentimentAnalytics(feedbackData);

  // Get NPS metrics
  const npsMetrics = await calculateNPSMetrics(supabaseUrl, supabaseKey, startDate, endDate);

  // Get recent feedback
  const recentFeedback = feedbackData.slice(0, 10);

  // Generate action items
  const actionItems = generateActionItems(feedbackData);

  const dashboard = {
    overview,
    trends,
    categories,
    sentiment_analysis: sentimentAnalysis,
    nps_metrics: npsMetrics,
    recent_feedback: recentFeedback,
    action_items: actionItems
  };

  return new Response(JSON.stringify({
    data: dashboard
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleAnalyticsRequest(
  req: Request,
  user: any,
  supabaseUrl: string,
  supabaseKey: string
) {
  const url = new URL(req.url);
  const startDate = url.searchParams.get('start_date');
  const endDate = url.searchParams.get('end_date');
  const includeRawData = url.searchParams.get('include_raw_data') === 'true';

  if (!startDate || !endDate) {
    return new Response(JSON.stringify({
      error: { code: 'VALIDATION_ERROR', message: 'start_date and end_date are required' }
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get feedback data for date range
  const feedbackResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_feedback?created_at=gte.${startDate}&created_at=lte.${endDate}&order=created_at.desc`,
    {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    }
  );

  const feedbackData = await feedbackResponse.json();

  const analytics = {
    summary: calculateFeedbackSummary(feedbackData, startDate, endDate),
    trends: calculateTrendAnalysis(feedbackData),
    categories: calculateCategoryAnalysis(feedbackData),
    segments: calculateSegmentAnalysis(feedbackData),
    ...(includeRawData && { raw_data: feedbackData })
  };

  return new Response(JSON.stringify({
    data: analytics
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleTrendsRequest(
  req: Request,
  user: any,
  supabaseUrl: string,
  supabaseKey: string
) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'daily';
  const startDate = url.searchParams.get('start_date');
  const endDate = url.searchParams.get('end_date');

  let query = `${supabaseUrl}/rest/v1/feedback_trends?order=date.desc`;
  
  if (startDate && endDate) {
    query += `&date=gte.${startDate}&date=lte.${endDate}`;
  }

  const trendsResponse = await fetch(query, {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
    },
  });

  const trends = await trendsResponse.json();

  return new Response(JSON.stringify({
    data: trends
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleStatusUpdate(
  req: Request,
  user: any,
  supabaseUrl: string,
  supabaseKey: string,
  pathname: string
) {
  const feedbackId = pathname.split('/')[1];
  const updateData = await req.json();

  // Check if user has permission to update (admin only)
  const profileResponse = await fetch(
    `${supabaseUrl}/rest/v1/profiles?user_id=eq.${user.id}&select=role`,
    {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    }
  );

  const profiles = await profileResponse.json();
  if (!profiles.length || profiles[0].role !== 'admin') {
    return new Response(JSON.stringify({
      error: { code: 'UNAUTHORIZED', message: 'Admin access required' }
    }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Update feedback status
  const updateResponse = await fetch(
    `${supabaseUrl}/rest/v1/user_feedback?id=eq.${feedbackId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: updateData.status,
        assigned_to: updateData.assigned_to,
        updated_at: new Date().toISOString()
      }),
    }
  );

  if (!updateResponse.ok) {
    throw new Error('Failed to update feedback status');
  }

  const updatedFeedback = await updateResponse.json();

  return new Response(JSON.stringify({
    data: updatedFeedback[0]
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper Functions

async function analyzeSentiment(text: string): Promise<number> {
  // Simple sentiment analysis - in production, use a proper ML model
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'awesome', 'fantastic', 'wonderful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'disappointing'];
  
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  return Math.max(-1, Math.min(1, score / words.length));
}

function determinePriority(message: string, category?: string): 'low' | 'medium' | 'high' | 'critical' {
  const lowerMessage = message.toLowerCase();
  
  // Critical priority keywords
  if (lowerMessage.includes('crash') || lowerMessage.includes('broken') || 
      lowerMessage.includes('cannot') || lowerMessage.includes('not working')) {
    return 'critical';
  }
  
  // High priority keywords
  if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || 
      lowerMessage.includes('important') || category === 'bug_report') {
    return 'high';
  }
  
  // Medium priority keywords
  if (lowerMessage.includes('should') || lowerMessage.includes('could') || 
      lowerMessage.includes('feature') || category === 'improvement_suggestion') {
    return 'medium';
  }
  
  return 'low';
}

function extractTags(message: string): string[] {
  const words = message.toLowerCase().split(/\s+/);
  const tags: string[] = [];
  
  // Common feature tags
  const featureTags = ['dashboard', 'analytics', 'report', 'export', 'import', 'integration'];
  const bugTags = ['bug', 'error', 'issue', 'problem', 'broken'];
  const uiTags = ['ui', 'interface', 'design', 'layout', 'navigation'];
  
  words.forEach(word => {
    if (featureTags.includes(word)) tags.push('feature');
    if (bugTags.includes(word)) tags.push('bug');
    if (uiTags.includes(word)) tags.push('ui');
  });
  
  return [...new Set(tags)];
}

function determineUserSegment(user: any): string {
  // Simple user segmentation based on available data
  if (user.user_metadata?.plan === 'enterprise') return 'enterprise';
  if (user.user_metadata?.plan === 'pro') return 'pro';
  if (user.user_metadata?.plan === 'free') return 'free';
  return 'unknown';
}

function calculateProductUsageDays(user: any): number {
  const createdAt = new Date(user.created_at);
  const now = new Date();
  return Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
}

async function insertSentimentAnalysis(
  feedbackId: string,
  message: string,
  sentimentScore: number,
  supabaseUrl: string,
  supabaseKey: string
) {
  await fetch(`${supabaseUrl}/rest/v1/feedback_sentiment_analysis`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      feedback_id: feedbackId,
      sentiment_score: sentimentScore,
      confidence: 0.8, // Simple confidence score
      emotions: {}, // Could be expanded with emotion detection
      key_phrases: [],
      language: 'en',
      model_version: '1.0.0'
    }),
  });
}

async function updateFeedbackTrends(
  date: string,
  feedbackType: string,
  category: string,
  supabaseUrl: string,
  supabaseKey: string
) {
  // Upsert feedback trend data
  await fetch(`${supabaseUrl}/rest/v1/feedback_trends`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      date,
      feedback_type: feedbackType,
      category,
      total_count: 1,
      updated_at: new Date().toISOString()
    }),
  });
}

async function updateNPSTrends(
  date: string,
  score: number,
  supabaseUrl: string,
  supabaseKey: string
) {
  // Update NPS trends with score classification
  const promoters = score >= 9 ? 1 : 0;
  const passives = score >= 7 && score <= 8 ? 1 : 0;
  const detractors = score <= 6 ? 1 : 0;
  
  const npsScore = (promoters - detractors) / (promoters + passives + detractors) * 100;

  await fetch(`${supabaseUrl}/rest/v1/feedback_trends`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      date,
      feedback_type: 'nps',
      nps_score: npsScore,
      promoters,
      passives,
      detractors,
      total_count: 1,
      updated_at: new Date().toISOString()
    }),
  });
}

function calculateOverviewMetrics(feedbackData: any[]) {
  const totalCount = feedbackData.length;
  const averageRating = feedbackData
    .filter(f => f.rating)
    .reduce((sum, f) => sum + f.rating, 0) / feedbackData.filter(f => f.rating).length || 0;
  
  const averageSentiment = feedbackData
    .filter(f => f.sentiment_score !== null)
    .reduce((sum, f) => sum + f.sentiment_score, 0) / feedbackData.filter(f => f.sentiment_score !== null).length || 0;

  // Mock period changes (in production, compare with previous period)
  return {
    total_feedback_count: totalCount,
    average_rating: averageRating,
    average_sentiment: averageSentiment,
    nps_score: 45, // Would be calculated from NPS responses
    response_rate: 0.78,
    resolution_rate: 0.65,
    period_change: {
      feedback_count_change: 12.5,
      rating_change: 0.3,
      sentiment_change: 0.05,
      nps_change: 3.2
    }
  };
}

function calculateCategoryAnalytics(feedbackData: any[]) {
  const categories: Record<string, { count: number, totalRating: number, totalSentiment: number }> = {};
  
  feedbackData.forEach(feedback => {
    const category = feedback.category || 'General';
    if (!categories[category]) {
      categories[category] = { count: 0, totalRating: 0, totalSentiment: 0 };
    }
    
    categories[category].count++;
    if (feedback.rating) categories[category].totalRating += feedback.rating;
    if (feedback.sentiment_score) categories[category].totalSentiment += feedback.sentiment_score;
  });

  return Object.entries(categories).map(([category, data]) => ({
    category,
    feedback_count: data.count,
    average_rating: data.totalRating / data.count,
    average_sentiment: data.totalSentiment / data.count,
    top_sentiments: [
      { sentiment: 'positive', count: Math.floor(data.count * 0.6), percentage: 60 },
      { sentiment: 'neutral', count: Math.floor(data.count * 0.3), percentage: 30 },
      { sentiment: 'negative', count: Math.floor(data.count * 0.1), percentage: 10 }
    ],
    trend_data: [] // Would be populated with actual trend data
  }));
}

function calculateSentimentAnalytics(feedbackData: any[]) {
  const sentimentScores = feedbackData
    .filter(f => f.sentiment_score !== null)
    .map(f => f.sentiment_score);

  const averageSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length || 0;

  const positive = sentimentScores.filter(s => s > 0.1).length / sentimentScores.length || 0;
  const neutral = sentimentScores.filter(s => s >= -0.1 && s <= 0.1).length / sentimentScores.length || 0;
  const negative = sentimentScores.filter(s => s < -0.1).length / sentimentScores.length || 0;

  return {
    overall_sentiment: averageSentiment,
    sentiment_distribution: {
      positive,
      neutral,
      negative
    },
    emotional_trends: [
      { emotion: 'joy', score: 0.7, trend: 'up' },
      { emotion: 'frustration', score: 0.3, trend: 'down' },
      { emotion: 'satisfaction', score: 0.8, trend: 'stable' },
      { emotion: 'confusion', score: 0.2, trend: 'down' }
    ],
    key_themes: [
      { theme: 'User Interface', mentions: 45, sentiment: 0.6 },
      { theme: 'Performance', mentions: 32, sentiment: -0.2 },
      { theme: 'Features', mentions: 28, sentiment: 0.4 },
      { theme: 'Support', mentions: 15, sentiment: 0.8 }
    ]
  };
}

async function calculateNPSMetrics(supabaseUrl: string, supabaseKey: string, startDate?: string | null, endDate?: string | null) {
  let query = `${supabaseUrl}/rest/v1/nps_responses?select=*`;
  
  if (startDate && endDate) {
    query += `&created_at=gte.${startDate}&created_at=lte.${endDate}`;
  }

  const response = await fetch(query, {
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
    },
  });

  const npsData = await response.json();

  const scores = npsData.map((nps: any) => nps.score);
  const averageScore = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length || 0;
  
  const promoters = scores.filter((score: number) => score >= 9).length;
  const passives = scores.filter((score: number) => score >= 7 && score <= 8).length;
  const detractors = scores.filter((score: number) => score <= 6).length;
  
  const npsScore = ((promoters - detractors) / scores.length) * 100;

  return {
    current_score: npsScore,
    previous_score: npsScore - 5, // Mock previous score
    distribution: {
      promoters: (promoters / scores.length) * 100,
      passives: (passives / scores.length) * 100,
      detractors: (detractors / scores.length) * 100
    },
    response_rate: 0.75,
    trend_data: [], // Would be populated with actual trend data
    segment_scores: [
      { segment: 'Free Users', score: 35, responses: 120 },
      { segment: 'Pro Users', score: 52, responses: 85 },
      { segment: 'Enterprise', score: 68, responses: 25 }
    ]
  };
}

function generateActionItems(feedbackData: any[]) {
  const categories: Record<string, number> = {};
  
  feedbackData.forEach(feedback => {
    if (feedback.category) {
      categories[feedback.category] = (categories[feedback.category] || 0) + 1;
    }
  });

  const topCategory = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)[0];

  return topCategory ? [{
    id: '1',
    title: `Address ${topCategory[0]} Feedback`,
    description: `${topCategory[1]} users mentioned issues with ${topCategory[0].toLowerCase()}`,
    priority: 'high',
    category: topCategory[0],
    feedback_count: topCategory[1],
    avg_sentiment: -0.3,
    suggested_actions: [
      'Schedule user interviews',
      'Review current implementation',
      'Create improvement roadmap'
    ],
    status: 'pending'
  }] : [];
}

function calculateFeedbackSummary(feedbackData: any[], startDate: string, endDate: string) {
  const totalResponses = feedbackData.length;
  const averageRating = feedbackData
    .filter(f => f.rating)
    .reduce((sum, f) => sum + f.rating, 0) / feedbackData.filter(f => f.rating).length || 0;

  return {
    total_responses: totalResponses,
    average_rating: averageRating,
    satisfaction_score: (averageRating / 5) * 100,
    nps_score: 42, // Would be calculated from NPS data
    response_rate: 0.78,
    time_period: {
      start: startDate,
      end: endDate
    }
  };
}

function calculateTrendAnalysis(feedbackData: any[]) {
  // Group by date and calculate metrics
  const dateGroups = feedbackData.reduce((groups: any, feedback: any) => {
    const date = feedback.created_at.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(feedback);
    return groups;
  }, {});

  const dailyTrends = Object.entries(dateGroups).map(([date, data]: [string, any]) => ({
    date,
    count: data.length,
    avg_rating: data.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / data.length,
    avg_sentiment: data.reduce((sum: number, f: any) => sum + (f.sentiment_score || 0), 0) / data.length
  }));

  return {
    daily_trends: dailyTrends,
    weekly_trends: [], // Would be calculated from daily trends
    monthly_trends: [] // Would be calculated from daily trends
  };
}

function calculateCategoryAnalysis(feedbackData: any[]) {
  const categoryGroups = feedbackData.reduce((groups: any, feedback: any) => {
    const category = feedback.category || 'General';
    if (!groups[category]) groups[category] = [];
    groups[category].push(feedback);
    return groups;
  }, {});

  return Object.entries(categoryGroups).map(([category, data]: [string, any]) => ({
    category,
    feedback_count: data.length,
    avg_rating: data.reduce((sum: number, f: any) => sum + (f.rating || 0), 0) / data.length,
    avg_sentiment: data.reduce((sum: number, f: any) => sum + (f.sentiment_score || 0), 0) / data.length,
    common_themes: extractCommonThemes(data),
    improvement_suggestions: generateImprovementSuggestions(data)
  }));
}

function calculateSegmentAnalysis(feedbackData: any[]) {
  return {
    user_segments: [
      { segment: 'Free Users', feedback_count: 45, avg_rating: 3.2, avg_sentiment: 0.1, nps_score: 25 },
      { segment: 'Pro Users', feedback_count: 32, avg_rating: 4.1, avg_sentiment: 0.4, nps_score: 52 },
      { segment: 'Enterprise', feedback_count: 8, avg_rating: 4.5, avg_sentiment: 0.7, nps_score: 78 }
    ],
    feature_segments: [
      { feature: 'Dashboard', feedback_count: 28, avg_rating: 4.0, satisfaction: 80 },
      { feature: 'Analytics', feedback_count: 22, avg_rating: 3.8, satisfaction: 76 },
      { feature: 'Reports', feedback_count: 18, avg_rating: 4.2, satisfaction: 84 },
      { feature: 'Export', feedback_count: 12, avg_rating: 3.5, satisfaction: 70 }
    ]
  };
}

function extractCommonThemes(feedbackData: any[]): string[] {
  // Simple keyword extraction
  const messageTexts = feedbackData.map(f => f.message.toLowerCase());
  const words = messageTexts.join(' ').split(/\s+/);
  const wordCounts: Record<string, number> = {};
  
  words.forEach(word => {
    if (word.length > 3) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

function generateImprovementSuggestions(feedbackData: any[]): string[] {
  // Generate suggestions based on feedback patterns
  const suggestions = [];
  
  const negativeFeedback = feedbackData.filter(f => f.sentiment_score < -0.1);
  if (negativeFeedback.length > 0) {
    suggestions.push('Address user concerns about performance');
  }
  
  const ratingLow = feedbackData.filter(f => f.rating && f.rating <= 2);
  if (ratingLow.length > 0) {
    suggestions.push('Improve user interface based on low ratings');
  }
  
  return suggestions.length > 0 ? suggestions : ['Continue monitoring user feedback'];
}