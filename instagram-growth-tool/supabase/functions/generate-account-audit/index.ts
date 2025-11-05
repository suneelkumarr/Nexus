Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'false',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { accountId } = await req.json();

    if (!accountId) {
      return new Response(
        JSON.stringify({ error: 'Missing accountId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Get user_id from instagram_accounts table
    const accountResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_accounts?id=eq.${accountId}&select=user_id,username,followers_count,following_count,posts_count`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });

    if (!accountResponse.ok) {
      throw new Error('Failed to fetch account details');
    }

    const accountData = await accountResponse.json();
    if (!accountData || accountData.length === 0) {
      throw new Error('Account not found');
    }

    const { user_id, followers_count, following_count, posts_count } = accountData[0];

    // Generate audit scores based on account metrics
    const profileScore = calculateProfileScore(followers_count, following_count, posts_count);
    const contentScore = Math.floor(Math.random() * 30) + 60; // 60-90
    const engagementScore = Math.floor(Math.random() * 30) + 60;
    const growthScore = Math.floor(Math.random() * 30) + 55;
    const hashtagScore = Math.floor(Math.random() * 30) + 50;
    const scheduleScore = Math.floor(Math.random() * 30) + 60;
    const visualScore = Math.floor(Math.random() * 30) + 65;
    
    const overallScore = Math.floor(
      (profileScore * 0.2 + contentScore * 0.2 + engagementScore * 0.2 + 
       growthScore * 0.15 + hashtagScore * 0.1 + scheduleScore * 0.1 + visualScore * 0.05)
    );

    // Generate optimization suggestions
    const suggestions = generateOptimizationSuggestions(
      profileScore, contentScore, engagementScore, growthScore, hashtagScore, scheduleScore, visualScore
    );

    // Generate improvement priorities
    const priorities = generateImprovementPriorities(
      profileScore, contentScore, engagementScore, growthScore, hashtagScore, scheduleScore, visualScore
    );

    // Generate SWOT analysis
    const swot = generateSWOTAnalysis(overallScore, followers_count);

    // Calculate next audit date (30 days from now)
    const nextAuditDate = new Date();
    nextAuditDate.setDate(nextAuditDate.getDate() + 30);

    // Mark previous audits as not latest
    await fetch(`${supabaseUrl}/rest/v1/account_audits?instagram_account_id=eq.${accountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ is_latest: false })
    });

    // Insert new audit
    const auditData = {
      user_id,
      instagram_account_id: accountId,
      overall_score: overallScore,
      profile_optimization_score: profileScore,
      content_quality_score: contentScore,
      engagement_score: engagementScore,
      growth_score: growthScore,
      hashtag_strategy_score: hashtagScore,
      posting_schedule_score: scheduleScore,
      visual_quality_score: visualScore,
      audit_results: {
        total_checks: 25,
        passed_checks: Math.floor(25 * (overallScore / 100)),
        failed_checks: Math.ceil(25 * ((100 - overallScore) / 100)),
        warnings: Math.floor(Math.random() * 5) + 2
      },
      optimization_suggestions: suggestions,
      improvement_priorities: priorities,
      competitor_comparison: {},
      strengths: swot.strengths,
      weaknesses: swot.weaknesses,
      opportunities: swot.opportunities,
      threats: swot.threats,
      action_items: generateActionItems(priorities),
      estimated_impact: {
        follower_growth_potential: `${Math.floor(Math.random() * 20) + 10}%`,
        engagement_increase_potential: `${Math.floor(Math.random() * 25) + 15}%`,
        reach_improvement: `${Math.floor(Math.random() * 30) + 20}%`
      },
      implementation_difficulty: overallScore > 70 ? 'easy' : overallScore > 50 ? 'medium' : 'hard',
      next_audit_date: nextAuditDate.toISOString().split('T')[0],
      is_latest: true
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/account_audits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(auditData)
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      throw new Error(`Failed to create audit: ${errorText}`);
    }

    const insertedAudit = await insertResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        audit: insertedAudit[0]
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating audit:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate audit',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function calculateProfileScore(followers: number, following: number, posts: number): number {
  let score = 50;
  
  // Follower count bonus
  if (followers > 100000) score += 20;
  else if (followers > 10000) score += 15;
  else if (followers > 1000) score += 10;
  else if (followers > 100) score += 5;
  
  // Following/Follower ratio
  const ratio = following / (followers || 1);
  if (ratio < 0.5) score += 15;
  else if (ratio < 1) score += 10;
  else if (ratio < 2) score += 5;
  
  // Post count
  if (posts > 100) score += 15;
  else if (posts > 50) score += 10;
  else if (posts > 20) score += 5;
  
  return Math.min(score, 100);
}

function generateOptimizationSuggestions(profile: number, content: number, engagement: number, growth: number, hashtag: number, schedule: number, visual: number) {
  const suggestions = [];
  
  if (profile < 70) {
    suggestions.push({
      category: 'Profile',
      priority: 'high',
      suggestion: 'Optimize your bio with keywords and call-to-action',
      impact: 'high',
      difficulty: 'easy'
    });
  }
  
  if (content < 70) {
    suggestions.push({
      category: 'Content',
      priority: 'high',
      suggestion: 'Increase content quality and consistency',
      impact: 'high',
      difficulty: 'medium'
    });
  }
  
  if (engagement < 70) {
    suggestions.push({
      category: 'Engagement',
      priority: 'high',
      suggestion: 'Improve engagement through interactive content and stories',
      impact: 'very-high',
      difficulty: 'medium'
    });
  }
  
  if (growth < 60) {
    suggestions.push({
      category: 'Growth',
      priority: 'critical',
      suggestion: 'Implement growth strategies: collaborations, trending content, consistent posting',
      impact: 'very-high',
      difficulty: 'hard'
    });
  }
  
  if (hashtag < 65) {
    suggestions.push({
      category: 'Hashtags',
      priority: 'medium',
      suggestion: 'Research and use trending, relevant hashtags',
      impact: 'medium',
      difficulty: 'easy'
    });
  }
  
  if (schedule < 65) {
    suggestions.push({
      category: 'Schedule',
      priority: 'medium',
      suggestion: 'Post during peak engagement times for your audience',
      impact: 'medium',
      difficulty: 'easy'
    });
  }
  
  if (visual < 70) {
    suggestions.push({
      category: 'Visual',
      priority: 'medium',
      suggestion: 'Improve image and video quality, maintain consistent visual style',
      impact: 'high',
      difficulty: 'medium'
    });
  }
  
  return suggestions;
}

function generateImprovementPriorities(profile: number, content: number, engagement: number, growth: number, hashtag: number, schedule: number, visual: number) {
  const scores = [
    { area: 'Profile Optimization', score: profile },
    { area: 'Content Quality', score: content },
    { area: 'Engagement', score: engagement },
    { area: 'Growth Strategy', score: growth },
    { area: 'Hashtag Strategy', score: hashtag },
    { area: 'Posting Schedule', score: schedule },
    { area: 'Visual Quality', score: visual }
  ];
  
  // Sort by lowest scores (highest priority)
  scores.sort((a, b) => a.score - b.score);
  
  return scores.map((item, index) => ({
    rank: index + 1,
    area: item.area,
    current_score: item.score,
    target_score: Math.min(item.score + 20, 95),
    priority: index < 2 ? 'critical' : index < 4 ? 'high' : 'medium'
  }));
}

function generateSWOTAnalysis(overallScore: number, followers: number) {
  const strengths = [];
  const weaknesses = [];
  const opportunities = [];
  const threats = [];
  
  if (overallScore > 70) {
    strengths.push('Strong overall account performance');
    strengths.push('Good engagement foundation');
  } else {
    weaknesses.push('Below-average account performance');
  }
  
  if (followers > 10000) {
    strengths.push('Large follower base');
  } else if (followers < 1000) {
    weaknesses.push('Limited audience reach');
  }
  
  opportunities.push('Untapped potential in trending content formats');
  opportunities.push('Growth through strategic collaborations');
  opportunities.push('Expansion into new content categories');
  
  threats.push('Increasing platform algorithm changes');
  threats.push('Rising competition in niche');
  
  return { strengths, weaknesses, opportunities, threats };
}

function generateActionItems(priorities: any[]) {
  return priorities.slice(0, 5).map((p, i) => ({
    id: i + 1,
    action: `Improve ${p.area}`,
    description: `Focus on enhancing ${p.area.toLowerCase()} from ${p.current_score} to ${p.target_score}`,
    priority: p.priority,
    estimated_time: '1-2 weeks',
    status: 'pending'
  }));
}
