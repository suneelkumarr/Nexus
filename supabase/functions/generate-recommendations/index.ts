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
        const { accountId, analyticsData } = await req.json();

        if (!accountId) {
            throw new Error('Account ID is required');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        const recommendations = [];

        // Analyze engagement rate
        if (analyticsData?.engagement_rate < 2) {
            recommendations.push({
                account_id: accountId,
                recommendation_type: 'engagement',
                title: 'Improve Engagement Rate',
                description: 'Your engagement rate is below 2%. Focus on creating more interactive content, using Stories with polls and questions, and responding to comments quickly.',
                priority: 'high',
                data: {
                    current_rate: analyticsData.engagement_rate,
                    target_rate: 3.5,
                    actions: [
                        'Post Stories with interactive stickers daily',
                        'Ask questions in your captions',
                        'Respond to all comments within 1 hour',
                        'Use carousel posts for higher engagement'
                    ]
                }
            });
        }

        // Posting frequency recommendation
        if (analyticsData?.posts_count < 3) {
            recommendations.push({
                account_id: accountId,
                recommendation_type: 'posting_frequency',
                title: 'Increase Posting Frequency',
                description: 'Post 3-5 times per week to maintain visibility and engagement. Consider a mix of Reels, carousels, and static posts.',
                priority: 'medium',
                data: {
                    current_frequency: analyticsData.posts_count || 0,
                    recommended_frequency: '3-5 posts per week',
                    best_times: ['Monday 3pm', 'Wednesday 2pm', 'Friday 4pm']
                }
            });
        }

        // Hashtag optimization
        recommendations.push({
            account_id: accountId,
            recommendation_type: 'hashtags',
            title: 'Optimize Hashtag Strategy',
            description: 'Use a mix of 5-10 relevant hashtags combining popular and niche tags. Research hashtags with 10K-200K posts for best reach.',
            priority: 'medium',
            data: {
                recommended_count: '5-10 hashtags',
                strategy: 'Mix of broad, niche, and branded',
                tips: [
                    'Research competitors hashtags',
                    'Rotate hashtag sets monthly',
                    'Track performance per hashtag'
                ]
            }
        });

        // Reels recommendation
        recommendations.push({
            account_id: accountId,
            recommendation_type: 'content_format',
            title: 'Leverage Reels for Growth',
            description: 'Reels get 3x more reach than regular posts. Create 2-3 Reels per week with trending audio and strong hooks in the first 3 seconds.',
            priority: 'high',
            data: {
                target: '2-3 Reels per week',
                tips: [
                    'Use trending audio',
                    'Hook viewers in first 3 seconds',
                    'Keep under 90 seconds',
                    'Add captions for accessibility'
                ]
            }
        });

        // Save recommendations to database
        for (const rec of recommendations) {
            await fetch(`${supabaseUrl}/rest/v1/growth_recommendations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(rec)
            });
        }

        return new Response(JSON.stringify({ 
            data: {
                recommendations,
                total: recommendations.length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'RECOMMENDATION_GENERATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
