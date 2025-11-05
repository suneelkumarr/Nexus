// Instagram Profile Data Fetcher (Graph API)
// Fetches Instagram Business Account profile data with caching and rate limiting

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
    const { instagramAccountId, forceRefresh } = await req.json();

    if (!instagramAccountId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: instagramAccountId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Verify token and get user
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

    // Check cache first (24 hour TTL for profile data)
    if (!forceRefresh) {
      const cacheKey = `profile_${instagramAccountId}`;
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
            console.log('Returning cached profile data');
            return new Response(
              JSON.stringify({
                data: cache.data,
                cached: true,
                cachedAt: cache.fetched_at,
                expiresAt: cache.expires_at
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

    // Check rate limit (200 requests/hour)
    const rateLimitCheckUrl = `${supabaseUrl}/rest/v1/api_rate_limits?user_id=eq.${userId}&instagram_account_id=eq.${instagramAccountId}&endpoint_type=eq.profile&select=*&order=window_start.desc&limit=1`;
    
    const rateLimitResponse = await fetch(rateLimitCheckUrl, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });

    if (rateLimitResponse.ok) {
      const rateLimitData = await rateLimitResponse.json();
      if (rateLimitData && rateLimitData.length > 0) {
        const limit = rateLimitData[0];
        const windowEnd = new Date(limit.window_end);
        const now = new Date();

        if (now < windowEnd && limit.request_count >= 200) {
          const resetIn = Math.ceil((windowEnd.getTime() - now.getTime()) / 1000 / 60);
          return new Response(
            JSON.stringify({
              error: 'Rate limit exceeded',
              message: `API rate limit exceeded. Resets in ${resetIn} minutes.`,
              resetAt: windowEnd.toISOString()
            }),
            {
              status: 429,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
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
    const expiresAt = new Date(tokenData[0].expires_at);
    const now = new Date();

    // Check if token is expired
    if (now >= expiresAt) {
      throw new Error('Access token expired. Please reconnect your Instagram account.');
    }

    console.log('Fetching profile data from Instagram Graph API...');

    // Fetch profile data from Instagram Graph API
    const fields = 'id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website';
    const profileApiUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}?fields=${fields}&access_token=${accessToken}`;

    const profileApiResponse = await fetch(profileApiUrl);

    if (!profileApiResponse.ok) {
      const errorData = await profileApiResponse.text();
      console.error('Instagram API error:', errorData);
      throw new Error(`Instagram API error: ${errorData}`);
    }

    const profileData = await profileApiResponse.json();

    console.log('Profile data retrieved:', profileData.username);

    // Update rate limit
    const windowStart = new Date();
    const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000); // 1 hour window

    const rateLimitUpdate = {
      user_id: userId,
      instagram_account_id: instagramAccountId,
      endpoint_type: 'profile',
      request_count: 1,
      window_start: windowStart.toISOString(),
      window_end: windowEnd.toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/api_rate_limits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(rateLimitUpdate)
    });

    // Store in cache (24 hour TTL)
    const cacheExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const cacheInsert = {
      user_id: userId,
      instagram_account_id: instagramAccountId,
      cache_key: `profile_${instagramAccountId}`,
      data_type: 'profile',
      data: profileData,
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

    // Update business account table
    const accountUpdate = {
      username: profileData.username,
      name: profileData.name || profileData.username,
      profile_picture_url: profileData.profile_picture_url,
      followers_count: profileData.followers_count || 0,
      follows_count: profileData.follows_count || 0,
      media_count: profileData.media_count || 0,
      biography: profileData.biography || '',
      website: profileData.website || '',
      last_synced_at: new Date().toISOString()
    };

    await fetch(`${supabaseUrl}/rest/v1/instagram_business_accounts?instagram_user_id=eq.${instagramAccountId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify(accountUpdate)
    });

    return new Response(
      JSON.stringify({
        data: profileData,
        cached: false,
        fetchedAt: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Profile fetch error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to fetch profile data',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
