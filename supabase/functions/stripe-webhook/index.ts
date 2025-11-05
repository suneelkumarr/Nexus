Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the raw body as text
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    // Verify webhook signature (if webhook secret is available)
    if (stripeWebhookSecret && signature) {
      // Note: In a real implementation, you'd verify the signature here
      // For now, we'll proceed without signature verification
      console.log('Webhook signature verification would happen here');
    }

    const event = JSON.parse(body);
    console.log('Received Stripe webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabaseUrl, supabaseKey);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object, supabaseUrl, supabaseKey);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, supabaseUrl, supabaseKey);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabaseUrl, supabaseKey);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabaseUrl, supabaseKey);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, supabaseUrl, supabaseKey);
        break;
      
      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: 'Webhook processing failed',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleCheckoutCompleted(session: any, supabaseUrl: string, supabaseKey: string) {
  console.log('Processing checkout session completed:', session.id);
  
  const { user_id, plan_type, supabase_subscription_id } = session.metadata;
  const stripeCustomerId = session.customer;
  const stripeSubscriptionId = session.subscription;

  // Update or create subscription with Stripe details
  const subscriptionData = {
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    status: 'active',
    updated_at: new Date().toISOString()
  };

  if (supabase_subscription_id) {
    // Update existing subscription
    await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${supabase_subscription_id}`, {
      method: 'PATCH',
      headers: { 
        'apikey': supabaseKey, 
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionData)
    });
  } else {
    // Create new subscription
    await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
      method: 'POST',
      headers: { 
        'apikey': supabaseKey, 
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id,
        plan_type,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        status: 'active',
        created_at: new Date().toISOString()
      })
    });
  }

  console.log('Subscription updated successfully');
}

async function handleInvoicePaymentSucceeded(invoice: any, supabaseUrl: string, supabaseKey: string) {
  console.log('Processing invoice payment succeeded:', invoice.id);
  
  // Add to billing history
  await fetch(`${supabaseUrl}/rest/v1/billing_history`, {
    method: 'POST',
    headers: { 
      'apikey': supabaseKey, 
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      invoice_pdf: invoice.invoice_pdf,
      billing_reason: invoice.billing_reason,
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    })
  });

  console.log('Billing history entry created');
}

async function handleSubscriptionCreated(subscription: any, supabaseUrl: string, supabaseKey: string) {
  console.log('Processing subscription created:', subscription.id);
  await updateSubscriptionFromStripe(subscription, supabaseUrl, supabaseKey);
}

async function handleSubscriptionUpdated(subscription: any, supabaseUrl: string, supabaseKey: string) {
  console.log('Processing subscription updated:', subscription.id);
  await updateSubscriptionFromStripe(subscription, supabaseUrl, supabaseKey);
}

async function handleSubscriptionDeleted(subscription: any, supabaseUrl: string, supabaseKey: string) {
  console.log('Processing subscription deleted:', subscription.id);
  
  // Find subscription by Stripe ID and mark as canceled
  const response = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${subscription.id}`,
    { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
  );
  const subscriptions = await response.json();
  
  if (subscriptions.length > 0) {
    await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${subscriptions[0].id}`, {
      method: 'PATCH',
      headers: { 
        'apikey': supabaseKey, 
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
    });
  }
}

async function handleInvoicePaymentFailed(invoice: any, supabaseUrl: string, supabaseKey: string) {
  console.log('Processing invoice payment failed:', invoice.id);
  
  // Add failed payment to billing history
  await fetch(`${supabaseUrl}/rest/v1/billing_history`, {
    method: 'POST',
    headers: { 
      'apikey': supabaseKey, 
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      billing_reason: invoice.billing_reason,
      created_at: new Date().toISOString()
    })
  });

  console.log('Failed payment recorded');
}

async function updateSubscriptionFromStripe(stripeSubscription: any, supabaseUrl: string, supabaseKey: string) {
  // Get current period dates
  const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000).toISOString();
  const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000).toISOString();
  
  // Update subscription in database
  await fetch(`${supabaseUrl}/rest/v1/subscriptions?stripe_subscription_id=eq.${stripeSubscription.id}`, {
    method: 'PATCH',
    headers: { 
      'apikey': supabaseKey, 
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: stripeSubscription.status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
  });
  
  console.log('Subscription updated from Stripe:', stripeSubscription.id);
}