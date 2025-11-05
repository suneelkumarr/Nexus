// Instagram OAuth Callback Handler
// Handles the OAuth 2.0 redirect from Facebook/Instagram and exchanges authorization code for access token

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
    // Get authorization code and user from request
    const { code, redirectUri } = await req.json();

    if (!code || !redirectUri) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: code and redirectUri' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const facebookAppId = Deno.env.get('FACEBOOK_APP_ID');
    const facebookAppSecret = Deno.env.get('FACEBOOK_APP_SECRET');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!facebookAppId || !facebookAppSecret) {
      throw new Error('Missing Facebook App credentials. Please configure FACEBOOK_APP_ID and FACEBOOK_APP_SECRET');
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

    console.log('Exchanging authorization code for access token...');

    // Step 1: Exchange authorization code for access token
    const tokenExchangeUrl = `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `client_id=${facebookAppId}&` +
      `client_secret=${facebookAppSecret}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code=${code}`;

    const tokenResponse = await fetch(tokenExchangeUrl, {
      method: 'GET',
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange error:', errorData);
      throw new Error(`Failed to exchange authorization code: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('Access token obtained successfully');

    // Step 2: Get Instagram Business Account ID
    const igAccountUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`;
    const igAccountResponse = await fetch(igAccountUrl);

    if (!igAccountResponse.ok) {
      const errorData = await igAccountResponse.text();
      console.error('Failed to get Facebook pages:', errorData);
      throw new Error('Failed to retrieve Facebook pages');
    }

    const pagesData = await igAccountResponse.json();
    
    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error('No Facebook pages found. Make sure your Instagram account is connected to a Facebook page.');
    }

    // Get Instagram Business Account from the first page
    const pageId = pagesData.data[0].id;
    const pageAccessToken = pagesData.data[0].access_token;

    const igBusinessAccountUrl = `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`;
    const igBusinessResponse = await fetch(igBusinessAccountUrl);

    if (!igBusinessResponse.ok) {
      throw new Error('Failed to get Instagram Business Account. Make sure your Instagram account is a Business or Creator account.');
    }

    const igBusinessData = await igBusinessResponse.json();
    
    if (!igBusinessData.instagram_business_account) {
      throw new Error('No Instagram Business Account linked to this Facebook page. Please convert to a Business or Creator account.');
    }

    const instagramUserId = igBusinessData.instagram_business_account.id;

    console.log('Instagram Business Account ID:', instagramUserId);

    // Step 3: Get Instagram profile data
    const profileUrl = `https://graph.facebook.com/v19.0/${instagramUserId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website&access_token=${pageAccessToken}`;
    const profileResponse = await fetch(profileUrl);

    if (!profileResponse.ok) {
      const errorData = await profileResponse.text();
      console.error('Failed to get profile data:', errorData);
      throw new Error('Failed to retrieve Instagram profile data');
    }

    const profileData = await profileResponse.json();

    console.log('Profile data retrieved:', profileData.username);

    // Step 4: Exchange for long-lived token (60 days)
    const longLivedTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${facebookAppId}&` +
      `client_secret=${facebookAppSecret}&` +
      `fb_exchange_token=${pageAccessToken}`;

    const longLivedResponse = await fetch(longLivedTokenUrl);
    const longLivedData = await longLivedResponse.json();
    const longLivedToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in || 5184000; // 60 days default

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    console.log('Long-lived token obtained, expires at:', expiresAt);

    // Step 5: Store token in database
    const tokenInsert = {
      user_id: userId,
      instagram_user_id: instagramUserId,
      access_token: longLivedToken,
      token_type: 'Bearer',
      expires_at: expiresAt.toISOString(),
      scope: 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement'
    };

    const tokenInsertResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_graph_tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(tokenInsert)
    });

    if (!tokenInsertResponse.ok) {
      const errorText = await tokenInsertResponse.text();
      console.error('Token insert error:', errorText);
      throw new Error(`Failed to store access token: ${errorText}`);
    }

    // Step 6: Store business account in database
    const accountInsert = {
      user_id: userId,
      instagram_user_id: instagramUserId,
      username: profileData.username,
      name: profileData.name || profileData.username,
      profile_picture_url: profileData.profile_picture_url,
      followers_count: profileData.followers_count || 0,
      follows_count: profileData.follows_count || 0,
      media_count: profileData.media_count || 0,
      biography: profileData.biography || '',
      website: profileData.website || '',
      account_type: 'BUSINESS',
      last_synced_at: new Date().toISOString(),
      sync_status: 'active'
    };

    const accountInsertResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_business_accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(accountInsert)
    });

    if (!accountInsertResponse.ok) {
      const errorText = await accountInsertResponse.text();
      console.error('Account insert error:', errorText);
      throw new Error(`Failed to store business account: ${errorText}`);
    }

    const accountData = await accountInsertResponse.json();

    console.log('Instagram account connected successfully:', profileData.username);

    return new Response(
      JSON.stringify({
        success: true,
        account: accountData[0],
        message: 'Instagram Business Account connected successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to complete OAuth flow',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
