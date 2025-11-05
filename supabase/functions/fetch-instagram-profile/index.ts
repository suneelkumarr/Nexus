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
        const { username } = await req.json();

        if (!username) {
            throw new Error('Username is required');
        }

        const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
        const rapidApiHost = Deno.env.get('RAPIDAPI_HOST');

        if (!rapidApiKey || !rapidApiHost) {
            throw new Error('Instagram API credentials not configured');
        }

        // Correct endpoint format for Instagram Looter2 API (profile2 works better)
        const response = await fetch(`https://${rapidApiHost}/profile2?username=${encodeURIComponent(username)}`, {
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

        const userData = await response.json();

        // Return the raw Instagram data directly
        return new Response(JSON.stringify({ data: userData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error fetching Instagram profile:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'PROFILE_FETCH_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
