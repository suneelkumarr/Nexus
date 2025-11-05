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
        const { accountId } = await req.json();

        if (!accountId) {
            throw new Error('Account ID is required');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        const metrics = [];

        // Fetch historical analytics data
        const analyticsResponse = await fetch(
            `${supabaseUrl}/rest/v1/analytics_snapshots?account_id=eq.${accountId}&order=created_at.desc&limit=30`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const analyticsData = await analyticsResponse.json();

        if (analyticsData.length >= 2) {
            // Calculate Growth Velocity
            const latest = analyticsData[0];
            const previous = analyticsData[1];
            
            const followerGrowth = latest.followers_count - previous.followers_count;
            const daysElapsed = Math.max(1, Math.floor((new Date(latest.created_at).getTime() - new Date(previous.created_at).getTime()) / (1000 * 60 * 60 * 24)));
            const dailyGrowthRate = followerGrowth / daysElapsed;

            // Calculate 7-day rolling average if we have enough data
            let weeklyMomentum = dailyGrowthRate;
            if (analyticsData.length >= 7) {
                const last7Days = analyticsData.slice(0, 7);
                const totalGrowth = last7Days[0].followers_count - last7Days[6].followers_count;
                weeklyMomentum = totalGrowth / 7;
            }

            metrics.push({
                account_id: accountId,
                metric_type: 'growth_velocity',
                value: Math.round(dailyGrowthRate * 100) / 100,
                details: {
                    daily_growth_rate: dailyGrowthRate,
                    weekly_momentum: weeklyMomentum,
                    follower_growth: followerGrowth,
                    acceleration: weeklyMomentum > dailyGrowthRate ? 'positive' : 'negative'
                }
            });

            // Calculate Engagement Quality Score (0-100 scale)
            const engagementRate = latest.engagement_rate || 0;
            const postsCount = latest.posts_count || 1;
            const followingRatio = latest.followers_count / Math.max(1, latest.following_count);
            
            // Weighted scoring
            const engagementScore = Math.min(engagementRate * 20, 40); // Max 40 points
            const activityScore = Math.min(postsCount * 0.5, 30); // Max 30 points
            const ratioScore = Math.min(followingRatio * 5, 30); // Max 30 points
            
            const qualityScore = Math.round(engagementScore + activityScore + ratioScore);

            metrics.push({
                account_id: accountId,
                metric_type: 'engagement_quality',
                value: qualityScore,
                details: {
                    engagement_rate: engagementRate,
                    posts_count: postsCount,
                    following_ratio: Math.round(followingRatio * 100) / 100,
                    breakdown: {
                        engagement: engagementScore,
                        activity: activityScore,
                        ratio: ratioScore
                    }
                }
            });

            // Calculate Audience Health Score (0-100 scale)
            const consistencyScore = analyticsData.length >= 7 ? 30 : (analyticsData.length / 7) * 30;
            const growthHealthScore = dailyGrowthRate > 0 ? 30 : 10;
            const engagementHealthScore = engagementRate > 2 ? 40 : (engagementRate / 2) * 40;
            
            const audienceHealth = Math.round(consistencyScore + growthHealthScore + engagementHealthScore);

            metrics.push({
                account_id: accountId,
                metric_type: 'audience_health',
                value: audienceHealth,
                details: {
                    consistency: Math.round(consistencyScore),
                    growth: Math.round(growthHealthScore),
                    engagement: Math.round(engagementHealthScore),
                    overall_status: audienceHealth > 70 ? 'excellent' : audienceHealth > 50 ? 'good' : 'needs_improvement'
                }
            });
        }

        // Save metrics to database
        for (const metric of metrics) {
            await fetch(`${supabaseUrl}/rest/v1/enhanced_metrics`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(metric)
            });
        }

        return new Response(JSON.stringify({ 
            data: {
                metrics,
                total: metrics.length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error calculating enhanced metrics:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'METRICS_CALCULATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
