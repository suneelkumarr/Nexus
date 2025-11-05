// Instagram Media Insights Fetcher (Graph API)
// Fetches Instagram posts and their insights (likes, comments, reach, impressions)

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
    const { instagramAccountId, limit, forceRefresh } = await req.json();

    if (!instagramAccountId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: instagramAccountId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mediaLimit = limit || 25; // Default to 25 posts

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

    // Check cache first (1 hour TTL for media data)
    if (!forceRefresh) {
      const cacheKey = `media_${instagramAccountId}_${mediaLimit}`;
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
            console.log('Returning cached media data');
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

    console.log('Fetching media from Instagram Graph API...');

    // Fetch media from Instagram Graph API
    const mediaFields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username';
    const mediaApiUrl = `https://graph.facebook.com/v19.0/${instagramAccountId}/media?fields=${mediaFields}&limit=${mediaLimit}&access_token=${accessToken}`;

    const mediaApiResponse = await fetch(mediaApiUrl);

    if (!mediaApiResponse.ok) {
      const errorData = await mediaApiResponse.text();
      console.error('Instagram API error:', errorData);
      throw new Error(`Instagram API error: ${errorData}`);
    }

    const mediaData = await mediaApiResponse.json();
    const posts = mediaData.data || [];

    console.log(`Retrieved ${posts.length} media posts`);

    // Fetch insights for each media item
    const postsWithInsights = [];
    
    for (const post of posts) {
      try {
        // Get insights for this media
        const insightMetrics = post.media_type === 'VIDEO' 
          ? 'engagement,impressions,reach,saved,video_views'
          : 'engagement,impressions,reach,saved';

        const insightsUrl = `https://graph.facebook.com/v19.0/${post.id}/insights?metric=${insightMetrics}&access_token=${accessToken}`;
        
        const insightsResponse = await fetch(insightsUrl);
        
        let insights = {};
        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json();
          
          // Parse insights into a simpler format
          if (insightsData.data) {
            insightsData.data.forEach((metric) => {
              insights[metric.name] = metric.values && metric.values[0] ? metric.values[0].value : 0;
            });
          }
        }

        postsWithInsights.push({
          ...post,
          insights: insights
        });

      } catch (insightError) {
        console.error(`Failed to fetch insights for post ${post.id}:`, insightError);
        // Add post without insights
        postsWithInsights.push({
          ...post,
          insights: {}
        });
      }
    }

    // Store in cache (1 hour TTL)
    const cacheExpires = new Date(Date.now() + 60 * 60 * 1000);
    const cacheInsert = {
      user_id: userId,
      instagram_account_id: instagramAccountId,
      cache_key: `media_${instagramAccountId}_${mediaLimit}`,
      data_type: 'media',
      data: {
        posts: postsWithInsights,
        count: postsWithInsights.length
      },
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
        data: {
          posts: postsWithInsights,
          count: postsWithInsights.length
        },
        cached: false,
        fetchedAt: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Media fetch error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to fetch media data',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
