import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId, amount, paymentType = 'deposit' } = await req.json();
    
    if (!projectId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get project details
    const { data: project, error: projectError } = await supabaseClient
      .from('projects_2025_09_30_12_43')
      .select(`
        *,
        client:client_id(id, user_id, full_name, email),
        designer:designer_id(id, user_id, full_name, email)
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate commission (10%)
    const commissionRate = 10.00;
    const commissionAmount = (amount * commissionRate) / 100;
    const designerAmount = amount - commissionAmount;

    // Create payment intent with Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(), // Convert to cents
        currency: 'usd',
        'metadata[project_id]': projectId,
        'metadata[payment_type]': paymentType,
        'metadata[commission_rate]': commissionRate.toString(),
        'automatic_payment_methods[enabled]': 'true',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stripe API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Payment processing failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const paymentIntent = await response.json();

    // Store payment record in database
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments_2025_09_30_12_43')
      .insert({
        project_id: projectId,
        client_id: project.client.id,
        designer_id: project.designer?.id,
        amount: amount,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        designer_amount: designerAmount,
        stripe_payment_intent_id: paymentIntent.id,
        payment_type: paymentType,
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Database error:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to record payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
        commissionAmount,
        designerAmount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});