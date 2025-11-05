// Instagram Account Insights Fetcher (Graph API)
// Fetches Instagram Business Account insights (impressions, reach, profile views, follower demographics)

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
    const { instagramAccountId, period, forceRefresh } = await req.json();

    if (!instagramAccountId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: instagramAccountId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Period can be 'day' (default) or 'week' or 'days_28'
    const insightPeriod = period || 'day';

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseServiceKey
      }
    });

    if (!userResponse.ok) {
      throw new Error('Invalid token');
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Check cache first (1 hour TTL for insights data)
    if (!forceRefresh) {
      const cacheKey = `insights_${instagramAccountId}_${insightPeriod}`;
      const cacheCheckUrl = `${supabaseUrl}/rest/v1/instagram_data_cache?cache_key=eq.${cacheKey}&select=*&limit=1`;
      
      const cacheResponse = await fetch(cacheCheckUrl, {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      });

      if (cacheResponse.ok) {
        const cacheData = await cacheResponse.json();
        if (cacheData && cacheData.length > 0) {
          const cache = cacheData[0];
          const expiresAt = new Date(cache.expires_at);
          const now = new Date();

          if (now < expiresAt) {
            console.log('Returning cached insights data');
            return new Response(
              JSON.stringify({
                data: cache.data,
                cached: true,
                cachedAt: cache.fetched_at
              }),
              {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
        }
      }
    }

    // Get access token
    const tokenUrl = `${supabaseUrl}/rest/v1/instagram_graph_tokens?instagram_user_id=eq.${instagramAccountId}&user_id=eq.${userId}&select=*&limit=1`;
    
    const tokenResponse = await fetch(tokenUrl, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to retrieve access token');
    }

    const tokenData = await tokenResponse.json();
    
    if (!tokenData || tokenData.length === 0) {
      throw new Error('No access token found for this Instagram account');
    }

    const accessToken = tokenData[0].access_token;

    console.log('Fetching account insights from Instagram Graph API...');

    // Define metrics based on period
    const metrics = [
      'impressions',
      'reach',
      'profile_views',
      'website_clicks',
      'email_contacts',
      'phone_call_clicks',
      'get_directions_clicks',
      'text_message_clicks'
    ];

    const metricString = metrics.join(',');

    // Fetch account insights
    const insightsUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}/insights?metric=${metricString}&period=${insightPeriod}&access_token=${accessToken}`;

    const insightsResponse = await fetch(insightsUrl);

    if (!insightsResponse.ok) {
      const errorData = await insightsResponse.text();
      console.error('Instagram API error:', errorData);
      
      // Check if error is due to insufficient followers
      if (errorData.includes('minimum of 100 followers')) {
        return new Response(
          JSON.stringify({
            error: 'Insufficient followers',
            message: 'Your Instagram account needs at least 100 followers to access insights',
            data: {
              impressions: 0,
              reach: 0,
              profile_views: 0,
              follower_requirement_not_met: true
            }
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`Instagram API error: ${errorData}`);
    }

    const insightsData = await insightsResponse.json();

    // Parse insights into a simpler format
    const parsedInsights = {};
    
    if (insightsData.data) {
      insightsData.data.forEach((metric) => {
        const value = metric.values && metric.values.length > 0 ? metric.values[metric.values.length - 1].value : 0;
        parsedInsights[metric.name] = value;
      });
    }

    console.log('Account insights retrieved successfully');

    // Fetch audience demographics (if available - requires 100+ followers)
    let audienceDemographics = {};
    
    try {
      const audienceMetrics = [
        'audience_city',
        'audience_country',
        'audience_gender_age',
        'audience_locale'
      ];

      const audienceUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}/insights?metric=${audienceMetrics.join(',')}&period=lifetime&access_token=${accessToken}`;
      const audienceResponse = await fetch(audienceUrl);

      if (audienceResponse.ok) {
        const audienceData = await audienceResponse.json();
        
        if (audienceData.data) {
          audienceData.data.forEach((metric) => {
            audienceDemographics[metric.name] = metric.values && metric.values.length > 0 ? metric.values[metric.values.length - 1].value : {};
          });
        }
      }
    } catch (audienceError) {
      console.log('Audience demographics not available (likely < 100 followers)');
    }

    const insightsResult = {
      account_insights: parsedInsights,
      audience_demographics: audienceDemographics,
      period: insightPeriod,
      timestamp: new Date().toISOString()
    };

    // Store in cache (1 hour TTL)
    const cacheExpires = new Date(Date.now() + 60 * 60 * 1000);
    const cacheInsert = {
      user_id: userId,
      instagram_account_id: instagramAccountId,
      cache_key: `insights_${instagramAccountId}_${insightPeriod}`,
      data_type: 'insights',
      data: insightsResult,
      expires_at: cacheExpires.toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/instagram_data_cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(cacheInsert)
    });

    return new Response(
      JSON.stringify({
        data: insightsResult,
        cached: false,
        fetchedAt: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Insights fetch error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to fetch insights data',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
