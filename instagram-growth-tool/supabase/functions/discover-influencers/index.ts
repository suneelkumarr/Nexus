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
    const { keyword, accountId } = await req.json();

    if (!keyword || !accountId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: keyword and accountId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    const rapidApiHost = Deno.env.get('RAPIDAPI_HOST');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Get user_id from instagram_accounts table
    const accountResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_accounts?id=eq.${accountId}&select=user_id`, {
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

    const userId = accountData[0].user_id;

    // Search for influencers using Instagram API
    let influencers = [];
    
    if (rapidApiKey && rapidApiHost) {
      try {
        const searchResponse = await fetch(`https://${rapidApiHost}/user/search?keyword=${encodeURIComponent(keyword)}`, {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': rapidApiHost
          }
        });

        if (searchResponse.ok) {
          const searchResults = await searchResponse.json();
          const users = searchResults.users || searchResults || [];
          
          // Process and score influencers
          influencers = users.slice(0, 20).map((user: any) => {
            const followers = user.follower_count || user.followers || 0;
            const following = user.following_count || user.following || 0;
            const posts = user.media_count || user.posts || 0;
            
            // Calculate engagement rate estimate
            const engagementRate = followers > 0 ? ((posts * 50) / followers) * 100 : 0;
            
            // Calculate influencer scores
            const influencerScore = calculateInfluencerScore(followers, engagementRate);
            const relevanceScore = Math.floor(Math.random() * 30) + 60; // 60-90
            const qualityScore = Math.floor(Math.random() * 30) + 65; // 65-95
            
            return {
              user_id: userId,
              instagram_account_id: accountId,
              username: user.username,
              display_name: user.full_name || user.name,
              profile_pic_url: user.profile_pic_url || user.profile_picture,
              bio: user.biography || '',
              followers_count: followers,
              following_count: following,
              posts_count: posts,
              engagement_rate: parseFloat(engagementRate.toFixed(2)),
              avg_likes: Math.floor(followers * 0.05),
              avg_comments: Math.floor(followers * 0.005),
              niche: keyword,
              is_verified: user.is_verified || false,
              influencer_score: influencerScore,
              relevance_score: relevanceScore,
              quality_score: qualityScore,
              collaboration_status: 'discovered'
            };
          }).filter(inf => inf.followers_count >= 1000); // Only influencers with 1k+ followers
          
        }
      } catch (error) {
        console.error('Error fetching from Instagram API:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        influencers,
        count: influencers.length,
        message: influencers.length === 0 ? 'No influencers found for this keyword. Try a different search term or check API configuration.' : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error discovering influencers:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to discover influencers',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function calculateInfluencerScore(followers: number, engagementRate: number): number {
  let score = 0;
  
  // Follower count scoring (0-40 points)
  if (followers > 1000000) score += 40;
  else if (followers > 100000) score += 35;
  else if (followers > 50000) score += 30;
  else if (followers > 10000) score += 25;
  else if (followers > 5000) score += 20;
  else if (followers > 1000) score += 15;
  
  // Engagement rate scoring (0-60 points)
  if (engagementRate > 10) score += 60;
  else if (engagementRate > 5) score += 50;
  else if (engagementRate > 3) score += 40;
  else if (engagementRate > 1) score += 30;
  else if (engagementRate > 0.5) score += 20;
  else score += 10;
  
  return Math.min(score, 100);
}
