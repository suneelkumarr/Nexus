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
    const { username, accountId } = await req.json();

    if (!username || !accountId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: username and accountId' }),
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

    // Fetch competitor profile from Instagram API
    let competitorData: any = {};
    
    if (rapidApiKey && rapidApiHost) {
      try {
        const profileResponse = await fetch(`https://${rapidApiHost}/user/${username}`, {
          headers: {
            'X-RapidAPI-Key': rapidApiKey,
            'X-RapidAPI-Host': rapidApiHost
          }
        });

        if (profileResponse.ok) {
          const apiData = await profileResponse.json();
          competitorData = {
            competitor_user_id: apiData.id || apiData.pk,
            display_name: apiData.full_name || apiData.name,
            profile_pic_url: apiData.profile_pic_url || apiData.profile_picture,
            bio: apiData.biography,
            followers_count: apiData.follower_count || apiData.followers,
            following_count: apiData.following_count || apiData.following,
            posts_count: apiData.media_count || apiData.posts,
            is_verified: apiData.is_verified,
            is_business: apiData.is_business,
            website_url: apiData.external_url,
            email: apiData.public_email,
            phone: apiData.public_phone_number
          };
        }
      } catch (error) {
        console.error('Error fetching from Instagram API:', error);
        // Continue with manual entry if API fails
      }
    }

    // Insert competitor into database
    const competitorInsert = {
      user_id: userId,
      instagram_account_id: accountId,
      competitor_username: username,
      ...competitorData,
      tracking_enabled: true
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/competitor_accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(competitorInsert)
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      throw new Error(`Failed to add competitor: ${errorText}`);
    }

    const insertedCompetitor = await insertResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        competitor: insertedCompetitor[0]
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error adding competitor:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to add competitor',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
