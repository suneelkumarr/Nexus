// Cron job to automatically track competitor metrics daily
Deno.serve(async () => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY');
    const rapidApiHost = Deno.env.get('RAPIDAPI_HOST');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    console.log('Starting automated competitor metrics tracking...');

    // Get all tracked competitors
    const competitorsResponse = await fetch(
      `${supabaseUrl}/rest/v1/competitor_accounts?tracking_enabled=eq.true&select=*`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      }
    );

    if (!competitorsResponse.ok) {
      throw new Error('Failed to fetch competitors');
    }

    const competitors = await competitorsResponse.json();
    console.log(`Found ${competitors.length} competitors to track`);

    let processedCount = 0;
    let errorCount = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const competitor of competitors) {
      try {
        let metrics: any = {
          competitor_account_id: competitor.id,
          user_id: competitor.user_id,
          metric_date: today,
          followers_count: competitor.followers_count,
          following_count: competitor.following_count,
          posts_count: competitor.posts_count,
          engagement_rate: competitor.engagement_rate,
          avg_likes: competitor.avg_likes,
          avg_comments: competitor.avg_comments
        };

        // Try to fetch updated data from Instagram API if available
        if (rapidApiKey && rapidApiHost && competitor.competitor_username) {
          try {
            const profileResponse = await fetch(
              `https://${rapidApiHost}/user/${competitor.competitor_username}`,
              {
                headers: {
                  'X-RapidAPI-Key': rapidApiKey,
                  'X-RapidAPI-Host': rapidApiHost
                }
              }
            );

            if (profileResponse.ok) {
              const apiData = await profileResponse.json();
              
              const newFollowers = apiData.follower_count || apiData.followers || competitor.followers_count;
              const followerGrowth = newFollowers - (competitor.followers_count || 0);
              
              metrics = {
                ...metrics,
                followers_count: newFollowers,
                following_count: apiData.following_count || apiData.following || competitor.following_count,
                posts_count: apiData.media_count || apiData.posts || competitor.posts_count,
                follower_growth: followerGrowth
              };

              // Update competitor_accounts table with latest data
              await fetch(
                `${supabaseUrl}/rest/v1/competitor_accounts?id=eq.${competitor.id}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                  },
                  body: JSON.stringify({
                    followers_count: metrics.followers_count,
                    following_count: metrics.following_count,
                    posts_count: metrics.posts_count,
                    last_updated: new Date().toISOString()
                  })
                }
              );
            }
          } catch (apiError) {
            console.log(`API fetch failed for ${competitor.competitor_username}, using cached data`);
          }
        }

        // Insert metrics snapshot
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/competitor_metrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(metrics)
        });

        if (insertResponse.ok) {
          processedCount++;
          console.log(`Tracked metrics for: ${competitor.competitor_username}`);
        } else {
          errorCount++;
          console.error(`Failed to insert metrics for ${competitor.competitor_username}`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        errorCount++;
        console.error(`Error processing competitor ${competitor.competitor_username}:`, error);
      }
    }

    console.log(`Completed: ${processedCount} successful, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Competitor metrics tracked for ${processedCount} accounts`,
        processed: processedCount,
        errors: errorCount
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Cron job error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to run cron job'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
});
