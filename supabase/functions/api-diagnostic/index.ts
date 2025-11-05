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
        const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
        const rapidApiHost = Deno.env.get('RAPIDAPI_HOST');

        if (!rapidApiKey || !rapidApiHost) {
            throw new Error('Instagram API credentials not configured');
        }

        // Test various common Instagram API endpoints
        const testEndpoints = [
            `/user/info_by_username?username=instagram`,
            `/user/by/username/instagram`,
            `/v1/user/by/username/instagram`,
            `/getUserByUsername?username=instagram`,
            `/api/user?username=instagram`,
        ];

        const results = [];

        for (const endpoint of testEndpoints) {
            try {
                const response = await fetch(`https://${rapidApiHost}${endpoint}`, {
                    method: 'GET',
                    headers: {
                        'X-RapidAPI-Key': rapidApiKey,
                        'X-RapidAPI-Host': rapidApiHost
                    }
                });

                results.push({
                    endpoint,
                    status: response.status,
                    ok: response.ok,
                    statusText: response.statusText
                });
            } catch (error) {
                results.push({
                    endpoint,
                    error: error.message
                });
            }
        }

        return new Response(JSON.stringify({ 
            host: rapidApiHost,
            results,
            note: "Check which endpoints return 200 or 400 (bad params) vs 404 (not found)"
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: {
                code: 'DIAGNOSTIC_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
