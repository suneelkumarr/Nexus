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
        const { hashtags, accountId } = await req.json();

        if (!hashtags || !Array.isArray(hashtags)) {
            throw new Error('Hashtags array is required');
        }

        const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
        const rapidApiHost = Deno.env.get('RAPIDAPI_HOST');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!rapidApiKey || !rapidApiHost) {
            throw new Error('Instagram API credentials not configured');
        }

        const hashtagAnalytics = [];

        // Analyze each hashtag
        for (const hashtag of hashtags.slice(0, 10)) { // Limit to 10 hashtags per request
            try {
                const cleanHashtag = hashtag.replace('#', '');
                const response = await fetch(`https://${rapidApiHost}/search?query=${encodeURIComponent(cleanHashtag)}&select=hashtags`, {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': rapidApiKey,
                        'x-rapidapi-host': rapidApiHost
                    }
                });

                if (response.ok) {
                    const hashtagData = await response.json();
                    
                    // Get the first matching hashtag from results
                    // Response structure: { hashtags: [{ position: 0, hashtag: { name, media_count, id } }] }
                    const firstResult = hashtagData.hashtags?.[0];
                    const matchingHashtag = firstResult?.hashtag || {};
                    const mediaCount = matchingHashtag.media_count || 0;
                    
                    // Calculate popularity score (logarithmic scale)
                    const popularityScore = mediaCount > 0 
                        ? Math.min(100, Math.floor(Math.log10(mediaCount) * 20))
                        : 0;

                    hashtagAnalytics.push({
                        hashtag: hashtag.startsWith('#') ? hashtag : `#${hashtag}`,
                        media_count: mediaCount,
                        popularity_score: popularityScore,
                        name: matchingHashtag.name || hashtag,
                    });

                    // Store in database if accountId provided
                    if (accountId && supabaseUrl && serviceRoleKey) {
                        await fetch(`${supabaseUrl}/rest/v1/hashtag_performance`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json',
                                'Prefer': 'return=minimal'
                            },
                            body: JSON.stringify({
                                account_id: accountId,
                                hashtag: hashtag.startsWith('#') ? hashtag : `#${hashtag}`,
                                popularity_score: popularityScore,
                                usage_count: 1
                            })
                        });
                    }
                }
            } catch (error) {
                console.error(`Error analyzing hashtag ${hashtag}:`, error);
            }
        }

        return new Response(JSON.stringify({ 
            data: {
                hashtags: hashtagAnalytics,
                total_analyzed: hashtagAnalytics.length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error analyzing hashtags:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'HASHTAG_ANALYSIS_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
