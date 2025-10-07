import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('Test email function called');
    
    const { email = 'test@example.com', fullName = 'Test User' } = await req.json();
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log('Resend API key exists:', !!resendApiKey);
    
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not found in environment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Helper function to determine from email
    function getFromEmail() {
      const domain = Deno.env.get('RESEND_DOMAIN');
      console.log('Resend domain:', domain);
      if (domain) {
        return `FTG designmatch <noreply@${domain}>`;
      }
      return 'FTG designmatch <onboarding@resend.dev>';
    }

    const fromEmail = getFromEmail();
    console.log('From email:', fromEmail);

    const emailData = {
      from: fromEmail,
      to: [email],
      subject: 'Welcome to FTG designmatch - Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 30px; text-align: center;">
            <div style="color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 8px;">FTG designmatch</div>
            <div style="color: #0f172a; font-size: 12px; opacity: 0.8;">you dream, we design</div>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #f59e0b; margin-bottom: 20px;">Test Email - Welcome ${fullName}! 🎨</h2>
            
            <p>This is a test email to verify the branded email system is working correctly.</p>
            
            <p>If you receive this email, the FTG designmatch email system is functioning properly!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://9mxnnhrcre.skywork.website/" style="display: inline-block; background: #f59e0b; color: #0f172a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Visit FTG designmatch
              </a>
            </div>
          </div>
          
          <div style="padding: 30px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #334155;">
            <p>© 2024 FTG designmatch. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Welcome to FTG designmatch, ${fullName}!

This is a test email to verify the branded email system is working correctly.

If you receive this email, the FTG designmatch email system is functioning properly!

Visit: https://9mxnnhrcre.skywork.website/

© 2024 FTG designmatch. All rights reserved.`
    };

    console.log('Sending email to:', email);
    console.log('Email data:', JSON.stringify(emailData, null, 2));

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    const responseText = await response.text();
    console.log('Resend response status:', response.status);
    console.log('Resend response:', responseText);

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status} - ${responseText}`);
    }

    const result = JSON.parse(responseText);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: result.id,
        message: 'Test email sent successfully',
        debug: {
          fromEmail,
          toEmail: email,
          resendResponse: result
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending test email:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send test email',
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});