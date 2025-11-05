Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: userError } = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json());

    if (userError || !user) {
      return new Response(JSON.stringify({ error: { message: 'Unauthorized' } }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, step, completedSteps } = await req.json();

    if (action === 'get') {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/onboarding_progress?user_id=eq.${user.id}&select=*`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const progress = await response.json();
      
      return new Response(JSON.stringify({ 
        data: progress[0] || null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (action === 'update') {
      // Check if progress exists
      const checkResponse = await fetch(
        `${supabaseUrl}/rest/v1/onboarding_progress?user_id=eq.${user.id}&select=id`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const existing = await checkResponse.json();

      const updateData: any = {
        current_step: step,
        completed_steps: JSON.stringify(completedSteps || []),
        updated_at: new Date().toISOString()
      };

      if (existing && existing.length > 0) {
        // Update existing progress
        await fetch(
          `${supabaseUrl}/rest/v1/onboarding_progress?user_id=eq.${user.id}`,
          {
            method: 'PATCH',
            headers: { 
              'apikey': supabaseKey, 
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          }
        );
      } else {
        // Create new progress
        await fetch(
          `${supabaseUrl}/rest/v1/onboarding_progress`,
          {
            method: 'POST',
            headers: { 
              'apikey': supabaseKey, 
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: user.id,
              ...updateData
            })
          }
        );
      }

      return new Response(JSON.stringify({ 
        data: { success: true, message: 'Onboarding progress updated' } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (action === 'complete') {
      await fetch(
        `${supabaseUrl}/rest/v1/onboarding_progress?user_id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: { 
            'apikey': supabaseKey, 
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            is_completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      );

      return new Response(JSON.stringify({ 
        data: { success: true, message: 'Onboarding completed' } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (action === 'skip') {
      await fetch(
        `${supabaseUrl}/rest/v1/onboarding_progress?user_id=eq.${user.id}`,
        {
          method: 'PATCH',
          headers: { 
            'apikey': supabaseKey, 
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            skipped: true,
            is_completed: true,
            updated_at: new Date().toISOString()
          })
        }
      );

      return new Response(JSON.stringify({ 
        data: { success: true, message: 'Onboarding skipped' } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      error: { message: 'Invalid action' } 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: { code: 'FUNCTION_ERROR', message: error.message } 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
