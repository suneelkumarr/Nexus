Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { userId, accountId } = await req.json();

        if (!userId) {
            throw new Error('User ID is required');
        }

        const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
        const rapidApiHost = Deno.env.get('RAPIDAPI_HOST');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!rapidApiKey || !rapidApiHost) {
            throw new Error('Instagram API credentials not configured');
        }

        // Correct endpoint for Instagram Looter2 API
        const response = await fetch(`https://${rapidApiHost}/profile?id=${userId}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': rapidApiKey,
                'x-rapidapi-host': rapidApiHost
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Instagram API error (${response.status}): ${errorText}`);
        }

        const insights = await response.json();

        // Store analytics snapshot if accountId provided
        if (accountId && supabaseUrl && serviceRoleKey) {
            const snapshot = {
                account_id: accountId,
                snapshot_date: new Date().toISOString().split('T')[0],
                followers_count: insights.follower_count || 0,
                following_count: insights.following_count || 0,
                posts_count: insights.media_count || 0,
                engagement_rate: 0, // Calculate based on recent posts
            };

            await fetch(`${supabaseUrl}/rest/v1/analytics_snapshots`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(snapshot)
            });
        }

        return new Response(JSON.stringify({ data: insights }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error fetching user insights:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'INSIGHTS_FETCH_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
