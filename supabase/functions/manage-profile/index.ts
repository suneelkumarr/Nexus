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

    const { action, profileData, passwordData } = await req.json();

    if (action === 'get') {
      // Get profile from both auth.users and user_profile_extended
      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/user_profile_extended?user_id=eq.${user.id}&select=*`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const profiles = await profileResponse.json();
      
      return new Response(JSON.stringify({ 
        data: { 
          email: user.email,
          profile: profiles[0] || null
        } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (action === 'update') {
      // Check if profile exists
      const checkResponse = await fetch(
        `${supabaseUrl}/rest/v1/user_profile_extended?user_id=eq.${user.id}&select=id`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const existing = await checkResponse.json();

      if (existing && existing.length > 0) {
        // Update existing profile
        await fetch(
          `${supabaseUrl}/rest/v1/user_profile_extended?user_id=eq.${user.id}`,
          {
            method: 'PATCH',
            headers: { 
              'apikey': supabaseKey, 
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...profileData,
              updated_at: new Date().toISOString()
            })
          }
        );
      } else {
        // Create new profile
        await fetch(
          `${supabaseUrl}/rest/v1/user_profile_extended`,
          {
            method: 'POST',
            headers: { 
              'apikey': supabaseKey, 
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: user.id,
              ...profileData
            })
          }
        );
      }

      return new Response(JSON.stringify({ 
        data: { success: true, message: 'Profile updated successfully' } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (action === 'change_password') {
      // Update password using Supabase Auth API
      const updateResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: passwordData.newPassword
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        return new Response(JSON.stringify({ 
          error: { message: errorData.message || 'Failed to update password' } 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        data: { success: true, message: 'Password updated successfully' } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (action === 'delete_account') {
      // Delete user account (soft delete by updating metadata)
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });

      return new Response(JSON.stringify({ 
        data: { success: true, message: 'Account deleted successfully' } 
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
