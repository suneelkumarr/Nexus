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
        const { userId, mediaId, accountId } = await req.json();

        if (!userId && !mediaId) {
            throw new Error('Either userId or mediaId is required');
        }

        const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
        const rapidApiHost = Deno.env.get('RAPIDAPI_HOST');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!rapidApiKey || !rapidApiHost) {
            throw new Error('Instagram API credentials not configured');
        }

        let mediaData = [];

        // Fetch user media or specific media using correct endpoints
        const apiEndpoint = mediaId 
            ? `https://${rapidApiHost}/media-info?id=${mediaId}`
            : `https://${rapidApiHost}/user-feeds?id=${userId}&count=20&allow_restricted_media=false`;

        const response = await fetch(apiEndpoint, {
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

        const data = await response.json();
        // Handle both single media and media list responses
        if (mediaId) {
            mediaData = [data];
        } else {
            mediaData = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [data];
        }

        // Store media insights if accountId provided
        if (accountId && supabaseUrl && serviceRoleKey) {
            for (const media of mediaData.slice(0, 20)) { // Limit to 20 media items
                const insight = {
                    account_id: accountId,
                    media_id: media.id || media.pk,
                    media_type: media.media_type === 1 ? 'photo' : media.media_type === 2 ? 'video' : 'carousel',
                    shortcode: media.code,
                    caption: media.caption?.text || '',
                    thumbnail_url: media.thumbnail_url || media.image_versions2?.candidates?.[0]?.url,
                    permalink: `https://www.instagram.com/p/${media.code}/`,
                    likes_count: media.like_count || 0,
                    comments_count: media.comment_count || 0,
                    shares_count: media.share_count || 0,
                    saves_count: media.save_count || 0,
                    engagement_rate: media.like_count && media.view_count 
                        ? ((media.like_count + media.comment_count) / media.view_count * 100).toFixed(2)
                        : 0,
                    posted_at: media.taken_at ? new Date(media.taken_at * 1000).toISOString() : null
                };

                try {
                    await fetch(`${supabaseUrl}/rest/v1/media_insights`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(insight)
                    });
                } catch (error) {
                    console.error('Error storing media insight:', error);
                }
            }
        }

        return new Response(JSON.stringify({ 
            data: {
                media: mediaData,
                total: mediaData.length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error fetching media insights:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'MEDIA_INSIGHTS_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
