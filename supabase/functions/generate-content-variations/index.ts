import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { accountId, baseTheme, variationCount = 5 } = await req.json();

    if (!accountId || !baseTheme) {
      return new Response(
        JSON.stringify({ error: 'accountId and baseTheme are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user_id from account
    const { data: account, error: accountError } = await supabase
      .from('instagram_accounts')
      .select('user_id, username, bio')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: 'Account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get top performing content for insights
    const { data: topContent } = await supabase
      .from('media_insights')
      .select('*')
      .eq('account_id', accountId)
      .order('engagement_rate', { ascending: false })
      .limit(10);

    // Generate content variations
    const variations = generateContentVariations(
      baseTheme,
      account.bio || 'general',
      topContent || [],
      variationCount
    );

    // Insert variations into database
    const { data: inserted, error: insertError } = await supabase
      .from('ai_content_variations')
      .insert(
        variations.map(v => ({
          user_id: account.user_id,
          account_id: accountId,
          base_content_theme: baseTheme,
          ...v
        }))
      )
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        variations: inserted,
        count: inserted.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateContentVariations(
  baseTheme: string,
  category: string,
  topContent: any[],
  count: number
) {
  const variations = [];

  // Variation Type 1: Different Formats
  variations.push({
    variation_type: 'Format Variation',
    variation_title: `${baseTheme} - Carousel Deep Dive`,
    variation_description: `Transform your ${baseTheme} concept into a comprehensive 7-slide carousel that educates and engages. Each slide builds on the previous, creating a story arc that keeps users swiping.`,
    caption_variations: [
      {
        style: 'Educational',
        text: `📚 Everything you need to know about ${baseTheme}!\n\nSwipe through to discover:\n→ Key concepts\n→ Common mistakes\n→ Pro tips\n→ Real examples\n\nSave this for later! 🔖`
      },
      {
        style: 'Conversational',
        text: `Let's talk ${baseTheme} 💬\n\nI broke it down into 7 simple slides because honestly? This changed everything for me.\n\nWhich slide hit different for you? Drop the number 👇`
      },
      {
        style: 'Direct Value',
        text: `Your complete ${baseTheme} guide 👉\n\n7 slides. Zero fluff. Pure value.\n\nSlide 7 is where most people have their "aha!" moment.\n\nSave + Share with someone who needs this ✨`
      }
    ],
    visual_concepts: [
      { concept: 'Minimalist Design', description: 'Clean white background, bold typography, single accent color per slide' },
      { concept: 'Progress Indicators', description: 'Show slide numbers (1/7, 2/7) to encourage completion' },
      { concept: 'Visual Hierarchy', description: 'Large main point, supporting details in smaller text, relevant icon/illustration' }
    ],
    target_demographics: [
      { segment: 'Learners', characteristics: 'Seeking comprehensive information, saves valuable content' },
      { segment: 'Sharers', characteristics: 'Enjoys distributing helpful resources to their network' }
    ],
    expected_performance_score: 88,
    a_b_testing_suggestions: 'Test different slide counts (5 vs 7 vs 10). Test text-heavy vs image-heavy slides. Test ending with CTA vs question.',
    unique_angle: 'Educational value packaged in digestible, swipeable format that encourages completion'
  });

  // Variation Type 2: Emotional Angle
  variations.push({
    variation_type: 'Emotional Storytelling',
    variation_title: `${baseTheme} - Personal Journey Story`,
    variation_description: `Share your authentic experience with ${baseTheme} through storytelling that creates emotional resonance. Vulnerability + value = connection.`,
    caption_variations: [
      {
        style: 'Vulnerable',
        text: `Real talk about ${baseTheme} that nobody prepared me for 💭\n\nThe wins were great. The failures taught me more.\n\nHere's what I wish I knew 1 year ago...\n\n[Share your story with specific struggles and breakthroughs]`
      },
      {
        style: 'Inspirational',
        text: `This time last year, ${baseTheme} felt impossible.\n\nToday? It's my superpower.\n\nWhat changed:\n• [Mindset shift]\n• [Action step]\n• [Support system]\n\nYour turn is coming. Keep going. 🌟`
      },
      {
        style: 'Reflective',
        text: `Lessons from ${baseTheme} I'll carry forever:\n\n1. [Deep insight]\n2. [Unexpected truth]\n3. [Game-changer]\n\nWhich one do you need to hear today?`
      }
    ],
    visual_concepts: [
      { concept: 'Before/After', description: 'Visual representation of transformation journey' },
      { concept: 'Candid Moments', description: 'Behind-the-scenes shots showing real work process' },
      { concept: 'Timeline Format', description: 'Show progression over time with milestone markers' }
    ],
    target_demographics: [
      { segment: 'Aspirational', characteristics: 'Looking for inspiration and proof of possibility' },
      { segment: 'Community-oriented', characteristics: 'Values authentic connection and shared experiences' }
    ],
    expected_performance_score: 92,
    a_b_testing_suggestions: 'Test video vs static post. Test specific dates/numbers vs general timeframes. Test ending with question vs call-to-action.',
    unique_angle: 'Emotional authenticity that builds trust and deeper audience connection'
  });

  // Variation Type 3: Data-Driven Approach
  variations.push({
    variation_type: 'Data & Statistics',
    variation_title: `${baseTheme} - Research-Backed Insights`,
    variation_description: `Present ${baseTheme} through compelling data, statistics, and research findings. Numbers tell stories that build credibility and authority.`,
    caption_variations: [
      {
        style: 'Authority',
        text: `The data on ${baseTheme} is fascinating 📊\n\nAfter analyzing [X studies/cases], here's what the numbers reveal:\n\n✓ [Statistic 1]\n✓ [Statistic 2]\n✓ [Statistic 3]\n\nSource: [Credible source]\n\nWhat surprises you most?`
      },
      {
        style: 'Eye-Opening',
        text: `${baseTheme} by the numbers:\n\n→ 73% experience [result]\n→ 5x increase in [metric]\n→ Only 12% actually [action]\n\nThese stats changed how I approach everything.\n\nWhich one makes you rethink your strategy? 🤔`
      }
    ],
    visual_concepts: [
      { concept: 'Infographic Style', description: 'Charts, graphs, and visual data representation' },
      { concept: 'Stat Highlights', description: 'Large numbers with supporting context' },
      { concept: 'Comparison Charts', description: 'Before/after or this vs that data comparisons' }
    ],
    target_demographics: [
      { segment: 'Decision-makers', characteristics: 'Values data-driven insights for strategic planning' },
      { segment: 'Researchers', characteristics: 'Appreciates credible sources and detailed information' }
    ],
    expected_performance_score: 85,
    a_b_testing_suggestions: 'Test percentage vs raw numbers. Test single stat spotlight vs multiple stats. Test source inclusion vs omission.',
    unique_angle: 'Authority-building through credible data and research-backed claims'
  });

  // Variation Type 4: Interactive/Question-Based
  variations.push({
    variation_type: 'Interactive Engagement',
    variation_title: `${baseTheme} - Quiz & Poll Format`,
    variation_description: `Turn ${baseTheme} into an interactive experience that drives comments, polls, and direct engagement. Make your audience active participants.`,
    caption_variations: [
      {
        style: 'Quiz Format',
        text: `Quick ${baseTheme} check! ✅\n\nWhich describes you?\n\nA) [Option A description]\nB) [Option B description]\nC) [Option C description]\n\nDrop your letter and I'll tell you what it means 👇`
      },
      {
        style: 'Would You Rather',
        text: `${baseTheme} edition: Would you rather...\n\n🅰️ [Option A with benefit]\n🅱️ [Option B with different benefit]\n\nVote in the poll! Results might surprise you 👀`
      },
      {
        style: 'Challenge',
        text: `The ${baseTheme} Challenge:\n\n✨ Try this for 7 days:\n→ [Action step 1]\n→ [Action step 2]\n→ [Action step 3]\n\nComment "IN" if you're joining!\n\nLet's do this together 💪`
      }
    ],
    visual_concepts: [
      { concept: 'Clear Options', description: 'Visual separation of choices with distinct colors/sections' },
      { concept: 'Poll Stickers', description: 'Use Instagram poll/quiz stickers for Stories' },
      { concept: 'Results Preview', description: 'Tease interesting poll results to drive engagement' }
    ],
    target_demographics: [
      { segment: 'Engaged Community', characteristics: 'Active participants who enjoy interactive content' },
      { segment: 'Social Connectors', characteristics: 'Likes to share opinions and see others\' responses' }
    ],
    expected_performance_score: 94,
    a_b_testing_suggestions: 'Test open-ended questions vs multiple choice. Test 2 options vs 3-4 options. Test promise of results reveal vs no follow-up.',
    unique_angle: 'Transforms passive scrolling into active participation and community building'
  });

  // Variation Type 5: Listicle/Quick Tips
  variations.push({
    variation_type: 'Quick Value List',
    variation_title: `${baseTheme} - Essential Tips Checklist`,
    variation_description: `Package ${baseTheme} into scannable, actionable tips that provide immediate value. Easy to consume, easy to implement, easy to save.`,
    caption_variations: [
      {
        style: 'Listicle',
        text: `5 ${baseTheme} tips that actually work:\n\n1️⃣ [Tip with specific action]\n2️⃣ [Tip with specific action]\n3️⃣ [Tip with specific action]\n4️⃣ [Tip with specific action]\n5️⃣ [Tip with specific action]\n\nWhich are you implementing today? 👇`
      },
      {
        style: 'Checklist',
        text: `Your ${baseTheme} checklist ✓\n\n□ [Essential action 1]\n□ [Essential action 2]\n□ [Essential action 3]\n□ [Essential action 4]\n□ [Essential action 5]\n\nSave this! Check them off as you complete each one 📌`
      },
      {
        style: 'Do This Not That',
        text: `${baseTheme} Do's & Don'ts:\n\n✅ DO: [Best practice]\n❌ DON'T: [Common mistake]\n\n✅ DO: [Best practice]\n❌ DON'T: [Common mistake]\n\nWhich mistake have you been making? (No judgment!) 💭`
      }
    ],
    visual_concepts: [
      { concept: 'Numbered Lists', description: 'Clear numbering with icons or emojis for each point' },
      { concept: 'Checkboxes', description: 'Visual checklist format users can mentally tick off' },
      { concept: 'Color Coding', description: 'Green for dos, red for don\'ts, or color per category' }
    ],
    target_demographics: [
      { segment: 'Action-takers', characteristics: 'Wants practical, implementable advice immediately' },
      { segment: 'Savers', characteristics: 'Creates collections of valuable reference content' }
    ],
    expected_performance_score: 90,
    a_b_testing_suggestions: 'Test 3 tips vs 5 vs 7. Test numbered vs bullet points. Test actionable steps vs conceptual ideas.',
    unique_angle: 'Immediate actionable value in an easily digestible format that encourages saves'
  });

  return variations.slice(0, Math.min(count, 5));
}
