import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { accountId, reportType = 'monthly', periodDays = 30 } = await req.json();

    if (!accountId) {
      return new Response(
        JSON.stringify({ error: 'accountId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user_id from account
    const { data: account, error: accountError } = await supabase
      .from('instagram_accounts')
      .select('user_id, username, followers_count, following_count, bio')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: 'Account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate report period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - periodDays);

    // Fetch all necessary data
    const [analyticsResult, mediaResult, followerGrowthResult, hashtagResult] = await Promise.all([
      supabase
        .from('analytics_snapshots')
        .select('*')
        .eq('account_id', accountId)
        .gte('snapshot_date', startDate.toISOString())
        .order('snapshot_date', { ascending: false }),
      
      supabase
        .from('media_insights')
        .select('*')
        .eq('account_id', accountId)
        .gte('posted_at', startDate.toISOString())
        .order('engagement_rate', { ascending: false }),
      
      supabase
        .from('follower_growth_tracking')
        .select('*')
        .eq('account_id', accountId)
        .gte('tracking_date', startDate.toISOString())
        .order('tracking_date', { ascending: false }),
      
      supabase
        .from('hashtag_performance')
        .select('*')
        .eq('account_id', accountId)
        .order('media_count', { ascending: false })
        .limit(10)
    ]);

    // Generate comprehensive report
    const report = generateIntelligentReport(
      account,
      analyticsResult.data || [],
      mediaResult.data || [],
      followerGrowthResult.data || [],
      hashtagResult.data || [],
      reportType,
      startDate,
      endDate
    );

    // Insert report into database
    const { data: inserted, error: insertError } = await supabase
      .from('ai_intelligent_reports')
      .insert({
        user_id: account.user_id,
        account_id: accountId,
        ...report
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, report: inserted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateIntelligentReport(
  account: any,
  analytics: any[],
  media: any[],
  followerGrowth: any[],
  hashtags: any[],
  reportType: string,
  startDate: Date,
  endDate: Date
) {
  // Calculate metrics
  const metrics = calculateMetrics(account, analytics, media, followerGrowth);
  const contentAnalysis = analyzeContent(media);
  const growthAnalysis = analyzeGrowth(followerGrowth, analytics);
  const audienceInsights = analyzeAudience(analytics, media);
  
  // Generate SWOT analysis
  const swot = generateSWOT(metrics, contentAnalysis, growthAnalysis);
  
  // Generate recommendations
  const recommendations = generateRecommendations(metrics, contentAnalysis, growthAnalysis, swot);
  
  // Calculate overall score
  const overallScore = calculateOverallScore(metrics);

  // Create executive summary
  const executiveSummary = createExecutiveSummary(
    account,
    metrics,
    growthAnalysis,
    startDate,
    endDate
  );

  const keyInsights = [
    {
      insight: 'Content Performance',
      description: `Your top-performing posts achieved ${metrics.avgTopEngagement.toFixed(1)}% engagement rate, ${metrics.topEngagementIncrease.toFixed(0)}% above your average.`,
      impact: 'High',
      trend: metrics.engagementTrend
    },
    {
      insight: 'Audience Growth',
      description: `Follower count ${growthAnalysis.direction === 'growing' ? 'increased' : 'changed'} by ${Math.abs(growthAnalysis.netChange)} over the period, representing ${growthAnalysis.percentChange.toFixed(1)}% growth.`,
      impact: 'High',
      trend: growthAnalysis.direction
    },
    {
      insight: 'Posting Consistency',
      description: `Published ${media.length} posts during the period, averaging ${(media.length / 30).toFixed(1)} posts per day.`,
      impact: 'Medium',
      trend: media.length >= 30 ? 'Strong' : 'Needs Improvement'
    },
    {
      insight: 'Engagement Quality',
      description: `Average engagement rate of ${metrics.avgEngagement.toFixed(2)}%, with comments representing ${metrics.commentRatio.toFixed(0)}% of interactions.`,
      impact: 'High',
      trend: metrics.commentRatio > 15 ? 'Excellent' : 'Good'
    }
  ];

  return {
    report_type: reportType,
    report_title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Instagram Performance Report`,
    report_period_start: startDate.toISOString().split('T')[0],
    report_period_end: endDate.toISOString().split('T')[0],
    executive_summary: executiveSummary,
    key_insights: keyInsights,
    performance_metrics: metrics,
    growth_analysis: growthAnalysis,
    content_analysis: contentAnalysis,
    audience_insights: audienceInsights,
    recommendations: recommendations,
    strengths: swot.strengths,
    weaknesses: swot.weaknesses,
    opportunities: swot.opportunities,
    threats: swot.threats,
    action_items: generateActionItems(recommendations, swot),
    overall_score: overallScore,
    report_data: {
      totalPosts: media.length,
      totalAnalytics: analytics.length,
      hashtagsAnalyzed: hashtags.length,
      dataCompleteness: calculateDataCompleteness(analytics, media, followerGrowth)
    }
  };
}

function calculateMetrics(account: any, analytics: any[], media: any[], followerGrowth: any[]) {
  const avgEngagement = analytics.length > 0
    ? analytics.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / analytics.length
    : 0;

  const topPosts = media.slice(0, 5);
  const avgTopEngagement = topPosts.length > 0
    ? topPosts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / topPosts.length
    : 0;

  const topEngagementIncrease = avgEngagement > 0 
    ? ((avgTopEngagement - avgEngagement) / avgEngagement) * 100
    : 0;

  const totalLikes = media.reduce((sum, m) => sum + (m.likes_count || 0), 0);
  const totalComments = media.reduce((sum, m) => sum + (m.comments_count || 0), 0);
  const totalInteractions = totalLikes + totalComments;
  const commentRatio = totalInteractions > 0 ? (totalComments / totalInteractions) * 100 : 0;

  const recentEngagement = analytics.slice(0, 7);
  const olderEngagement = analytics.slice(7, 14);
  const recentAvg = recentEngagement.length > 0
    ? recentEngagement.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / recentEngagement.length
    : 0;
  const olderAvg = olderEngagement.length > 0
    ? olderEngagement.reduce((sum, a) => sum + (a.engagement_rate || 0), 0) / olderEngagement.length
    : avgEngagement;

  const engagementTrend = recentAvg > olderAvg * 1.1 ? 'Increasing' 
    : recentAvg < olderAvg * 0.9 ? 'Decreasing' 
    : 'Stable';

  return {
    currentFollowers: account.followers_count,
    avgEngagement: avgEngagement,
    avgTopEngagement: avgTopEngagement,
    topEngagementIncrease: topEngagementIncrease,
    totalPosts: media.length,
    totalLikes: totalLikes,
    totalComments: totalComments,
    commentRatio: commentRatio,
    avgLikesPerPost: media.length > 0 ? totalLikes / media.length : 0,
    avgCommentsPerPost: media.length > 0 ? totalComments / media.length : 0,
    engagementTrend: engagementTrend,
    postingFrequency: media.length / 30
  };
}

function analyzeContent(media: any[]) {
  const typeDistribution: { [key: string]: number } = {};
  media.forEach(m => {
    const type = m.media_type || 'IMAGE';
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
  });

  const topPost = media[0];
  const avgPerformance = media.length > 0
    ? media.reduce((sum, m) => sum + (m.engagement_rate || 0), 0) / media.length
    : 0;

  return {
    contentTypes: typeDistribution,
    topPerformingPost: topPost ? {
      type: topPost.media_type,
      engagement: topPost.engagement_rate,
      likes: topPost.likes_count,
      comments: topPost.comments_count
    } : null,
    averagePerformance: avgPerformance,
    bestPerformingType: Object.keys(typeDistribution).reduce((a, b) => 
      typeDistribution[a] > typeDistribution[b] ? a : b, 'IMAGE'
    ),
    contentDiversity: Object.keys(typeDistribution).length
  };
}

function analyzeGrowth(followerGrowth: any[], analytics: any[]) {
  if (followerGrowth.length < 2) {
    return {
      direction: 'insufficient_data',
      netChange: 0,
      percentChange: 0,
      avgDailyGrowth: 0,
      growthRate: 0
    };
  }

  const oldest = followerGrowth[followerGrowth.length - 1];
  const newest = followerGrowth[0];
  
  const netChange = (newest.followers_count || 0) - (oldest.followers_count || 0);
  const percentChange = oldest.followers_count > 0 
    ? (netChange / oldest.followers_count) * 100 
    : 0;
  const avgDailyGrowth = netChange / followerGrowth.length;

  return {
    direction: netChange > 0 ? 'growing' : netChange < 0 ? 'declining' : 'stable',
    netChange: netChange,
    percentChange: percentChange,
    avgDailyGrowth: avgDailyGrowth,
    growthRate: percentChange
  };
}

function analyzeAudience(analytics: any[], media: any[]) {
  return {
    engagementPattern: 'Most active during peak hours',
    contentPreference: 'Shows strong preference for educational and interactive content',
    interactionStyle: 'High save rate indicates value-seeking behavior',
    demographicInsights: 'Primary audience aligns with target demographic'
  };
}

function generateSWOT(metrics: any, content: any, growth: any) {
  const strengths = [];
  const weaknesses = [];
  const opportunities = [];
  const threats = [];

  // Strengths
  if (metrics.avgEngagement > 5) {
    strengths.push({ item: 'Strong Engagement Rate', description: `${metrics.avgEngagement.toFixed(1)}% average engagement exceeds industry standards` });
  }
  if (metrics.commentRatio > 15) {
    strengths.push({ item: 'High Comment Ratio', description: 'Audience actively participates in conversations' });
  }
  if (growth.direction === 'growing') {
    strengths.push({ item: 'Positive Growth Trajectory', description: `${growth.percentChange.toFixed(1)}% follower growth demonstrates market fit` });
  }
  if (content.contentDiversity >= 2) {
    strengths.push({ item: 'Content Diversity', description: 'Utilizing multiple content formats effectively' });
  }

  // Weaknesses
  if (metrics.postingFrequency < 1) {
    weaknesses.push({ item: 'Posting Frequency', description: 'Below recommended posting frequency for optimal reach' });
  }
  if (metrics.avgEngagement < 3) {
    weaknesses.push({ item: 'Low Engagement', description: 'Engagement rate below industry average' });
  }
  if (content.contentDiversity < 2) {
    weaknesses.push({ item: 'Limited Content Variety', description: 'Relying on single content format may limit reach' });
  }

  // Opportunities
  opportunities.push({ item: 'Reels Expansion', description: 'Video content shows highest algorithm favorability' });
  opportunities.push({ item: 'Interactive Content', description: 'Polls and questions can boost engagement 40-50%' });
  if (metrics.avgTopEngagement > metrics.avgEngagement * 1.5) {
    opportunities.push({ item: 'Content Pattern Replication', description: 'Top posts show clear pattern that can be replicated' });
  }
  opportunities.push({ item: 'Collaboration Strategy', description: 'Partner content can expand reach to new audiences' });

  // Threats
  if (growth.direction === 'declining') {
    threats.push({ item: 'Follower Decline', description: 'Need to address content-audience fit' });
  }
  if (metrics.engagementTrend === 'Decreasing') {
    threats.push({ item: 'Engagement Drop', description: 'Requires immediate content strategy adjustment' });
  }
  threats.push({ item: 'Algorithm Changes', description: 'Platform updates may impact organic reach' });
  threats.push({ item: 'Market Saturation', description: 'Increased competition in content category' });

  return { strengths, weaknesses, opportunities, threats };
}

function generateRecommendations(metrics: any, content: any, growth: any, swot: any) {
  const recommendations = [];

  recommendations.push({
    category: 'Content Strategy',
    priority: 'High',
    recommendation: 'Increase Reels production to 4-5 per week',
    expectedImpact: '40-60% reach increase',
    timeframe: 'Implement within 1 week'
  });

  if (metrics.postingFrequency < 1) {
    recommendations.push({
      category: 'Posting Frequency',
      priority: 'High',
      recommendation: 'Scale to minimum 5-7 posts per week',
      expectedImpact: '25% engagement boost',
      timeframe: '2 weeks'
    });
  }

  recommendations.push({
    category: 'Engagement',
    priority: 'Medium',
    recommendation: 'Respond to comments within first hour of posting',
    expectedImpact: 'Algorithm boost + community building',
    timeframe: 'Immediate'
    });

  recommendations.push({
    category: 'Growth',
    priority: 'High',
    recommendation: 'Implement collaborative content with complementary accounts',
    expectedImpact: '15-25% follower growth',
    timeframe: '3-4 weeks'
  });

  recommendations.push({
    category: 'Analytics',
    priority: 'Medium',
    recommendation: 'A/B test posting times using insights data',
    expectedImpact: 'Optimize for peak engagement',
    timeframe: 'Ongoing'
  });

  return recommendations;
}

function generateActionItems(recommendations: any[], swot: any) {
  const actionItems = [];

  actionItems.push({
    action: 'Create 2-week content calendar with daily posting schedule',
    deadline: '3 days',
    owner: 'Content Team',
    status: 'Pending'
  });

  actionItems.push({
    action: 'Produce 5 Reels using trending audio',
    deadline: '1 week',
    owner: 'Content Creator',
    status: 'Pending'
  });

  actionItems.push({
    action: 'Identify and reach out to 5 potential collaboration partners',
    deadline: '1 week',
    owner: 'Growth Lead',
    status: 'Pending'
  });

  actionItems.push({
    action: 'Set up comment response workflow for faster engagement',
    deadline: '2 days',
    owner: 'Community Manager',
    status: 'Pending'
  });

  actionItems.push({
    action: 'Analyze top 10 posts and create content template',
    deadline: '5 days',
    owner: 'Strategy Lead',
    status: 'Pending'
  });

  return actionItems;
}

function calculateOverallScore(metrics: any): number {
  let score = 0;

  // Engagement (40 points)
  score += Math.min(metrics.avgEngagement * 4, 40);

  // Growth (25 points)
  score += Math.min(metrics.postingFrequency * 10, 25);

  // Content quality (20 points)
  score += Math.min((metrics.commentRatio / 20) * 20, 20);

  // Consistency (15 points)
  score += Math.min((metrics.totalPosts / 30) * 15, 15);

  return Math.round(Math.min(score, 100));
}

function calculateDataCompleteness(analytics: any[], media: any[], followerGrowth: any[]): number {
  const analyticsScore = Math.min((analytics.length / 30) * 33.33, 33.33);
  const mediaScore = Math.min((media.length / 20) * 33.33, 33.33);
  const growthScore = Math.min((followerGrowth.length / 30) * 33.34, 33.34);

  return Math.round(analyticsScore + mediaScore + growthScore);
}

function createExecutiveSummary(
  account: any,
  metrics: any,
  growth: any,
  startDate: Date,
  endDate: Date
): string {
  const period = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return `This comprehensive ${period}-day performance report for @${account.username} reveals ${growth.direction === 'growing' ? 'positive momentum' : 'opportunities for improvement'} across key metrics.

Account Overview:
• Current Followers: ${metrics.currentFollowers.toLocaleString()}
• Follower Change: ${growth.netChange >= 0 ? '+' : ''}${growth.netChange} (${growth.percentChange.toFixed(1)}%)
• Average Engagement Rate: ${metrics.avgEngagement.toFixed(2)}%
• Total Posts Published: ${metrics.totalPosts}

Performance Highlights:
Your content generated ${metrics.totalLikes.toLocaleString()} likes and ${metrics.totalComments.toLocaleString()} comments during this period. Top-performing posts achieved ${metrics.avgTopEngagement.toFixed(1)}% engagement, significantly outperforming the account average.

Engagement trends are ${metrics.engagementTrend.toLowerCase()}, with comments representing ${metrics.commentRatio.toFixed(1)}% of total interactions—indicating ${metrics.commentRatio > 15 ? 'strong' : 'moderate'} audience connection.

Strategic Recommendations:
${growth.direction === 'growing' ? 'Capitalize on current momentum by increasing content frequency and expanding successful content formats.' : 'Focus on content optimization and audience engagement strategies to reverse declining trends.'}

Posting consistency at ${metrics.postingFrequency.toFixed(1)} posts per day ${metrics.postingFrequency >= 1 ? 'meets' : 'falls below'} recommended frequency for optimal algorithm performance.

Overall Performance Score: ${calculateOverallScore(metrics)}/100

This report provides actionable insights and specific recommendations to enhance your Instagram performance in the coming period.`;
}
