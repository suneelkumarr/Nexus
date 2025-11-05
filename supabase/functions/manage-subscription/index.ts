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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    
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

    const { action, planType, returnUrl } = await req.json();

    // Get current subscription
    const subsResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${user.id}&select=*`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );
    const subscriptions = await subsResponse.json();
    const currentSub = subscriptions[0];

    if (action === 'get') {
      // Return current subscription with plan details
      if (currentSub) {
        const planResponse = await fetch(
          `${supabaseUrl}/rest/v1/plans?plan_type=eq.${currentSub.plan_type}&select=*`,
          { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
        );
        const plans = await planResponse.json();
        
        return new Response(JSON.stringify({ 
          data: { subscription: currentSub, plan: plans[0] } 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // No subscription, return free plan as default
        return new Response(JSON.stringify({ 
          data: { subscription: null, plan: null } 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else if (action === 'create-checkout-session') {
      // Create Stripe checkout session
      if (!stripeSecretKey) {
        return new Response(JSON.stringify({ 
          error: { message: 'Stripe integration not configured' } 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const planResponse = await fetch(
        `${supabaseUrl}/rest/v1/plans?plan_type=eq.${planType}&select=*`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const plans = await planResponse.json();
      const plan = plans[0];

      if (!plan) {
        return new Response(JSON.stringify({ 
          error: { message: 'Invalid plan type' } 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create checkout session
      const checkoutData = {
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.plan_name,
              description: `Instagram Growth Plan - Up to ${plan.monthly_limit} accounts`,
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${returnUrl || req.headers.get('origin')}/subscription?success=true`,
        cancel_url: `${returnUrl || req.headers.get('origin')}/subscription?canceled=true`,
        customer_email: user.email,
        metadata: {
          user_id: user.id,
          plan_type: planType,
          supabase_subscription_id: currentSub?.id?.toString() || ''
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan_type: planType,
            supabase_subscription_id: currentSub?.id?.toString() || ''
          }
        }
      };

      const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'payment_method_types[]': 'card',
          'line_items[0][price_data][currency]': plan.currency,
          'line_items[0][price_data][product_data][name]': plan.plan_name,
          'line_items[0][price_data][product_data][description]': `Instagram Growth Plan - Up to ${plan.monthly_limit} accounts`,
          'line_items[0][price_data][unit_amount]': plan.price.toString(),
          'line_items[0][price_data][recurring][interval]': plan.interval,
          'line_items[0][quantity]': '1',
          'mode': 'subscription',
          'success_url': `${returnUrl || req.headers.get('origin')}/subscription?success=true`,
          'cancel_url': `${returnUrl || req.headers.get('origin')}/subscription?canceled=true`,
          'customer_email': user.email,
          'metadata[user_id]': user.id,
          'metadata[plan_type]': planType,
          'metadata[supabase_subscription_id]': currentSub?.id?.toString() || '',
          'subscription_data[metadata][user_id]': user.id,
          'subscription_data[metadata][plan_type]': planType,
          'subscription_data[metadata][supabase_subscription_id]': currentSub?.id?.toString() || ''
        })
      });

      const session = await stripeResponse.json();

      if (!stripeResponse.ok) {
        throw new Error(session.error?.message || 'Failed to create checkout session');
      }

      return new Response(JSON.stringify({ 
        data: { checkoutUrl: session.url, sessionId: session.id } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (action === 'cancel') {
      if (!currentSub) {
        return new Response(JSON.stringify({ 
          error: { message: 'No active subscription to cancel' } 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Cancel Stripe subscription if exists
      if (currentSub.stripe_subscription_id && stripeSecretKey) {
        const cancelResponse = await fetch(`https://api.stripe.com/v1/subscriptions/${currentSub.stripe_subscription_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${stripeSecretKey}`,
          }
        });

        if (!cancelResponse.ok) {
          const error = await cancelResponse.json();
          throw new Error(error.error?.message || 'Failed to cancel Stripe subscription');
        }
      }

      // Mark subscription for cancellation at period end
      await fetch(
        `${supabaseUrl}/rest/v1/subscriptions?id=eq.${currentSub.id}`,
        {
          method: 'PATCH',
          headers: { 
            'apikey': supabaseKey, 
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          })
        }
      );

      return new Response(JSON.stringify({ 
        data: { success: true, message: 'Subscription will be canceled at period end' } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (action === 'billing-history') {
      // Get billing history
      const billingResponse = await fetch(
        `${supabaseUrl}/rest/v1/billing_history?user_id=eq.${user.id}&select=*&order=created_at.desc`,
        { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
      );
      const billingHistory = await billingResponse.json();

      return new Response(JSON.stringify({ 
        data: billingHistory 
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
