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
        const { accountId, reportType = 'weekly' } = await req.json();

        if (!accountId) {
            throw new Error('Account ID is required');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        const daysToAnalyze = reportType === 'monthly' ? 30 : 7;

        // Fetch account data
        const accountResponse = await fetch(
            `${supabaseUrl}/rest/v1/instagram_accounts?id=eq.${accountId}`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        const accountData = await accountResponse.json();
        const account = accountData[0];

        // Fetch analytics data for the period
        const analyticsResponse = await fetch(
            `${supabaseUrl}/rest/v1/analytics_snapshots?account_id=eq.${accountId}&order=created_at.desc&limit=${daysToAnalyze + 5}`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        const analytics = await analyticsResponse.json();

        // Fetch enhanced metrics
        const metricsResponse = await fetch(
            `${supabaseUrl}/rest/v1/enhanced_metrics?account_id=eq.${accountId}&order=calculation_date.desc&limit=${daysToAnalyze}`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        const enhancedMetrics = await metricsResponse.json();

        // Fetch media insights
        const mediaResponse = await fetch(
            `${supabaseUrl}/rest/v1/media_insights?account_id=eq.${accountId}&order=created_at.desc&limit=50`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );
        const mediaInsights = await mediaResponse.json();

        // Generate report data
        const reportData = {
            account_username: account.username,
            report_period: reportType,
            generated_at: new Date().toISOString(),
            
            // Summary section
            summary: {
                current_followers: analytics[0]?.followers_count || 0,
                follower_growth: analytics.length >= 2 ? analytics[0].followers_count - analytics[analytics.length - 1].followers_count : 0,
                current_engagement_rate: Math.round((analytics[0]?.engagement_rate || 0) * 100) / 100,
                total_posts_period: analytics[0]?.posts_count - (analytics[analytics.length - 1]?.posts_count || 0),
                posts_analyzed: mediaInsights.length
            },

            // Key metrics
            key_metrics: {
                growth_velocity: enhancedMetrics.find(m => m.metric_type === 'growth_velocity')?.value || 0,
                engagement_quality: enhancedMetrics.find(m => m.metric_type === 'engagement_quality')?.value || 0,
                audience_health: enhancedMetrics.find(m => m.metric_type === 'audience_health')?.value || 0
            },

            // Top performing content
            top_content: mediaInsights
                .sort((a, b) => {
                    const engagementA = (a.likes_count || 0) + (a.comments_count || 0) * 2;
                    const engagementB = (b.likes_count || 0) + (b.comments_count || 0) * 2;
                    return engagementB - engagementA;
                })
                .slice(0, 5)
                .map(media => ({
                    media_type: media.media_type,
                    likes: media.likes_count,
                    comments: media.comments_count,
                    engagement_rate: media.engagement_rate,
                    created_at: media.created_at
                })),

            // Insights and recommendations
            insights: [],
            recommendations: []
        };

        // Generate insights based on data patterns
        if (reportData.summary.follower_growth > 0) {
            reportData.insights.push({
                type: 'positive',
                message: `Your account grew by ${reportData.summary.follower_growth} followers this ${reportType}, representing a ${Math.round((reportData.summary.follower_growth / Math.max(1, analytics[analytics.length - 1]?.followers_count || 1)) * 10000) / 100}% increase.`
            });
        } else if (reportData.summary.follower_growth < 0) {
            reportData.insights.push({
                type: 'warning',
                message: `Your account lost ${Math.abs(reportData.summary.follower_growth)} followers this ${reportType}. Review content quality and posting consistency.`
            });
        }

        if (reportData.key_metrics.engagement_quality > 70) {
            reportData.insights.push({
                type: 'positive',
                message: `Excellent engagement quality score of ${reportData.key_metrics.engagement_quality}/100. Your audience is highly engaged with your content.`
            });
        } else if (reportData.key_metrics.engagement_quality < 50) {
            reportData.insights.push({
                type: 'warning',
                message: `Engagement quality score is ${reportData.key_metrics.engagement_quality}/100. Focus on creating more interactive content.`
            });
        }

        // Generate recommendations
        if (reportData.top_content.length > 0) {
            const topType = reportData.top_content[0].media_type;
            reportData.recommendations.push({
                priority: 'high',
                action: `Post more ${topType} content`,
                reason: `Your ${topType} posts are generating the highest engagement. Consider increasing this content type in your strategy.`
            });
        }

        if (reportData.key_metrics.audience_health < 60) {
            reportData.recommendations.push({
                priority: 'high',
                action: 'Improve posting consistency',
                reason: 'Your audience health score indicates inconsistent activity. Maintain a regular posting schedule to improve audience retention.'
            });
        }

        if (reportData.summary.current_engagement_rate < 2) {
            reportData.recommendations.push({
                priority: 'medium',
                action: 'Increase engagement tactics',
                reason: 'Your engagement rate is below industry average. Use Stories with polls, ask questions in captions, and respond to comments quickly.'
            });
        }

        // Save report to database
        await fetch(`${supabaseUrl}/rest/v1/automated_reports`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                account_id: accountId,
                report_type: reportType,
                report_data: reportData,
                delivered: false
            })
        });

        return new Response(JSON.stringify({ 
            data: {
                report: reportData,
                message: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error generating automated report:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'REPORT_GENERATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
