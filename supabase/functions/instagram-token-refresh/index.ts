// Instagram Token Refresh Handler
// Automatically refreshes Instagram Graph API access tokens before expiry (60-day cycle)

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
    const { instagramAccountId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const facebookAppId = Deno.env.get('FACEBOOK_APP_ID');
    const facebookAppSecret = Deno.env.get('FACEBOOK_APP_SECRET');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!facebookAppId || !facebookAppSecret) {
      throw new Error('Missing Facebook App credentials');
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

    // Get current access token
    let tokenQuery = `${supabaseUrl}/rest/v1/instagram_graph_tokens?user_id=eq.${userId}&select=*`;
    
    if (instagramAccountId) {
      tokenQuery += `&instagram_user_id=eq.${instagramAccountId}`;
    }
    tokenQuery += '&limit=1';

    const tokenResponse = await fetch(tokenQuery, {
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
      throw new Error('No access token found');
    }

    const currentToken = tokenData[0];
    const currentAccessToken = currentToken.access_token;
    const tokenId = currentToken.id;

    console.log('Refreshing access token...');

    // Exchange current token for new long-lived token
    const refreshUrl = `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${facebookAppId}&` +
      `client_secret=${facebookAppSecret}&` +
      `fb_exchange_token=${currentAccessToken}`;

    const refreshResponse = await fetch(refreshUrl);

    if (!refreshResponse.ok) {
      const errorData = await refreshResponse.text();
      console.error('Token refresh error:', errorData);
      throw new Error(`Failed to refresh token: ${errorData}`);
    }

    const refreshData = await refreshResponse.json();
    const newAccessToken = refreshData.access_token;
    const expiresIn = refreshData.expires_in || 5184000; // 60 days default

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    console.log('New access token obtained, expires at:', expiresAt);

    // Update token in database
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_graph_tokens?id=eq.${tokenId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        access_token: newAccessToken,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(`Failed to update token: ${errorText}`);
    }

    const updatedToken = await updateResponse.json();

    console.log('Access token refreshed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Access token refreshed successfully',
        expiresAt: expiresAt.toISOString(),
        token: updatedToken[0]
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Token refresh error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to refresh access token',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
