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
      return new Response(
        JSON.stringify({ error: 'Missing accountId parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Supabase URL and service role key from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // First, get the user_id from the instagram_accounts table
    const accountResponse = await fetch(`${supabaseUrl}/rest/v1/instagram_accounts?id=eq.${accountId}&select=user_id`, {
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    });

    console.log('Account fetch response status:', accountResponse.status);

    if (!accountResponse.ok) {
      const errorText = await accountResponse.text();
      console.error('Failed to fetch account:', errorText);
      throw new Error(`Failed to fetch account details: ${errorText}`);
    }

    const accountData = await accountResponse.json();
    console.log('Account data received:', JSON.stringify(accountData));
    
    if (!accountData || accountData.length === 0) {
      throw new Error('Account not found');
    }

    const userId = accountData[0].user_id;
    console.log('Extracted userId:', userId);

    if (!userId) {
      throw new Error('User ID not found for account');
    }

    // AI-generated content ideas with variety (using actual database schema)
    const ideaTemplates = [
      // Educational
      {
        idea_category: 'educational',
        generated_idea: 'Behind-the-Scenes Workflow',
        caption: 'Share your creative process with your audience. Show how you create content, your workspace setup, and the tools you use.',
        post_type: 'reel',
        hashtags: ['behindthescenes', 'workflow', 'creative', 'contentcreator'],
        visual_concept: 'Short video showing your workspace and creative process'
      },
      {
        idea_category: 'educational',
        generated_idea: 'Quick Tips Series',
        caption: 'Create a series of quick, actionable tips related to your niche. Keep them short, valuable, and easy to implement.',
        post_type: 'post',
        hashtags: ['tips', 'tutorial', 'howto', 'quicktips'],
        visual_concept: 'Clean text overlay on branded background'
      },
      {
        idea_category: 'educational',
        generated_idea: 'Step-by-Step Tutorial',
        caption: 'Break down a complex process into simple steps. Use clear visuals and concise instructions to help your audience learn something new.',
        post_type: 'carousel',
        hashtags: ['tutorial', 'learning', 'education', 'stepbystep'],
        visual_concept: 'Multi-slide carousel with numbered steps'
      },
      // Entertaining
      {
        idea_category: 'entertaining',
        generated_idea: 'Interactive Poll or Quiz',
        caption: 'Engage your audience with interactive stories. Ask questions, run polls, or create fun quizzes related to your content.',
        post_type: 'story',
        hashtags: ['interactive', 'poll', 'engagement', 'fun'],
        visual_concept: 'Story with poll stickers and questions'
      },
      {
        idea_category: 'entertaining',
        generated_idea: 'Funny Meme or Relatable Content',
        caption: 'Share humorous content that resonates with your audience. Use trending formats or create original funny moments.',
        post_type: 'post',
        hashtags: ['funny', 'meme', 'relatable', 'humor'],
        visual_concept: 'Meme format with relatable caption'
      },
      {
        idea_category: 'entertaining',
        generated_idea: 'Challenge or Trend Participation',
        caption: 'Join trending challenges or create your own. Encourage followers to participate and share their versions.',
        post_type: 'reel',
        hashtags: ['challenge', 'trending', 'viral', 'participate'],
        visual_concept: 'Trending audio with your unique twist'
      },
      // Promotional
      {
        idea_category: 'promotional',
        generated_idea: 'User-Generated Content Showcase',
        caption: 'Feature your community! Repost content from followers who use your products or services. This builds trust and encourages engagement.',
        post_type: 'carousel',
        hashtags: ['community', 'ugc', 'customerappreciation', 'testimonial'],
        visual_concept: 'Customer photos arranged in attractive grid'
      },
      {
        idea_category: 'promotional',
        generated_idea: 'Product Feature Highlight',
        caption: 'Showcase a specific feature or benefit of your product. Use clear visuals and compelling copy to demonstrate value.',
        post_type: 'post',
        hashtags: ['product', 'feature', 'benefits', 'value'],
        visual_concept: 'Product photo with feature callouts'
      },
      {
        idea_category: 'promotional',
        generated_idea: 'Limited-Time Offer Announcement',
        caption: 'Create urgency with time-sensitive promotions. Use eye-catching graphics and clear call-to-action to drive conversions.',
        post_type: 'story',
        hashtags: ['sale', 'limitedtime', 'offer', 'deal'],
        visual_concept: 'Bold graphics with countdown timer'
      },
      // Inspirational
      {
        idea_category: 'inspirational',
        generated_idea: 'Motivational Monday Post',
        caption: 'Start the week with inspiration! Share quotes, success stories, or motivational content to energize your audience.',
        post_type: 'post',
        hashtags: ['motivation', 'monday', 'inspiration', 'positivevibes'],
        visual_concept: 'Beautiful quote overlaid on inspiring image'
      },
      {
        idea_category: 'inspirational',
        generated_idea: 'Success Story or Transformation',
        caption: 'Share before-and-after stories or testimonials. Inspire your audience by showing real results and journeys.',
        post_type: 'carousel',
        hashtags: ['success', 'transformation', 'journey', 'results'],
        visual_concept: 'Before/after comparison slides'
      },
      {
        idea_category: 'inspirational',
        generated_idea: 'Gratitude or Appreciation Post',
        caption: "Express gratitude to your community, team, or supporters. Share what you're thankful for and celebrate milestones together.",
        post_type: 'post',
        hashtags: ['gratitude', 'thankful', 'appreciation', 'community'],
        visual_concept: 'Heartfelt message with community photos'
      },
      // Trending
      {
        idea_category: 'trending',
        generated_idea: 'Trending Audio or Sound',
        caption: 'Use popular audio tracks in your reels. Add your unique twist to make it relevant to your niche and audience.',
        post_type: 'reel',
        hashtags: ['trending', 'viral', 'audio', 'trendingnow'],
        visual_concept: 'Reel using current trending audio'
      },
      {
        idea_category: 'trending',
        generated_idea: 'Current Events Commentary',
        caption: 'Share your perspective on relevant news or trending topics in your industry. Provide valuable insights and start conversations.',
        post_type: 'post',
        hashtags: ['news', 'trending', 'commentary', 'insights'],
        visual_concept: 'News-style graphic with your commentary'
      },
      {
        idea_category: 'trending',
        generated_idea: 'Seasonal or Holiday Content',
        caption: 'Create content around current seasons, holidays, or special occasions. Make it timely and relevant to your audience.',
        post_type: 'carousel',
        hashtags: ['seasonal', 'holiday', 'celebrate', 'festive'],
        visual_concept: 'Seasonal themed multi-image carousel'
      }
    ];

    // Randomly select 5 ideas from different categories
    const shuffled = [...ideaTemplates].sort(() => Math.random() - 0.5);
    const selectedIdeas = shuffled.slice(0, 5);

    // Prepare ideas for insertion (using actual database schema)
    const ideasToInsert = selectedIdeas.map(idea => ({
      account_id: accountId,
      user_id: userId,
      ...idea,
      ai_model: 'template-based',
      performance_score: Math.floor(Math.random() * 30) + 70,  // Random score 70-100
      used: false
    }));

    console.log('Ideas to insert (first item):', JSON.stringify(ideasToInsert[0]));

    // Insert ideas using service role key
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/ai_content_ideas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(ideasToInsert)
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      throw new Error(`Failed to insert ideas: ${errorText}`);
    }

    const insertedIdeas = await insertResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true, 
        ideas: insertedIdeas,
        count: insertedIdeas.length 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating AI ideas:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate ideas',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
