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
        const { type, query, accountId } = await req.json();

        if (!type || !query) {
            throw new Error('Discovery type and query are required');
        }

        const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
        const rapidApiHost = Deno.env.get('RAPIDAPI_HOST');

        if (!rapidApiKey || !rapidApiHost) {
            throw new Error('Instagram API credentials not configured');
        }

        let apiEndpoint = '';
        let select = '';
        
        // Determine API endpoint based on discovery type
        // Using the /search endpoint with appropriate select parameter
        switch (type) {
            case 'hashtag':
                apiEndpoint = `https://${rapidApiHost}/search?query=${encodeURIComponent(query)}&select=hashtags`;
                select = 'hashtags';
                break;
            case 'location':
                apiEndpoint = `https://${rapidApiHost}/search?query=${encodeURIComponent(query)}&select=places`;
                select = 'places';
                break;
            case 'user':
                apiEndpoint = `https://${rapidApiHost}/search?query=${encodeURIComponent(query)}&select=users`;
                select = 'users';
                break;
            case 'explore':
                // For explore, search users by query
                apiEndpoint = `https://${rapidApiHost}/search?query=${encodeURIComponent(query)}&select=users`;
                select = 'users';
                break;
            default:
                throw new Error('Invalid discovery type');
        }

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

        const content = await response.json();

        // Process the response based on type
        let processedContent = [];
        if (content.users) {
            processedContent = content.users;
        } else if (content.hashtags) {
            processedContent = content.hashtags;
        } else if (content.places) {
            processedContent = content.places;
        } else if (Array.isArray(content)) {
            processedContent = content;
        }

        return new Response(JSON.stringify({ 
            data: {
                type,
                query,
                items: processedContent,
                total: processedContent.length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error discovering content:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'CONTENT_DISCOVERY_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
