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
    const { email, fullName, type = 'verification' } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Helper function to determine from email
    function getFromEmail() {
      const domain = Deno.env.get('RESEND_DOMAIN');
      if (domain) {
        return `FTG designmatch <noreply@${domain}>`;
      }
      return 'FTG designmatch <onboarding@resend.dev>'; // Default fallback
    }

    let subject, htmlContent, textContent;

    if (type === 'verification') {
      subject = 'Welcome to FTG designmatch - Verify Your Designer Account';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to FTG designmatch</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #0f172a; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b, #334155); border-radius: 12px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 30px; text-align: center; }
            .logo { color: #0f172a; font-size: 24px; font-weight: bold; margin-bottom: 8px; }
            .tagline { color: #0f172a; font-size: 12px; opacity: 0.8; }
            .content { padding: 40px 30px; color: #e2e8f0; }
            .welcome { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #f59e0b; }
            .button { display: inline-block; background: #f59e0b; color: #0f172a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .footer { padding: 30px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #334155; }
            .features { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 30px 0; }
            .feature { text-align: center; padding: 20px; background: #1e293b; border-radius: 8px; }
            .feature-icon { font-size: 24px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">FTG designmatch</div>
              <div class="tagline">you dream, we design</div>
            </div>
            
            <div class="content">
              <div class="welcome">Welcome to designmatch, ${fullName || 'Designer'}! 🎨</div>
              
              <p>Thank you for joining our creative community! You're now part of a platform that connects talented designers with clients who value quality work.</p>
              
              <div class="features">
                <div class="feature">
                  <div class="feature-icon">💰</div>
                  <strong>Keep 90%</strong><br>
                  <small>Low 10% commission</small>
                </div>
                <div class="feature">
                  <div class="feature-icon">🛡️</div>
                  <strong>Secure Payments</strong><br>
                  <small>Escrow protection</small>
                </div>
                <div class="feature">
                  <div class="feature-icon">⚡</div>
                  <strong>Quality Clients</strong><br>
                  <small>Verified projects</small>
                </div>
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Complete your profile with portfolio samples</li>
                <li>Set your availability and rates</li>
                <li>Start receiving project invitations</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=VERIFICATION_TOKEN&type=signup&redirect_to=${encodeURIComponent('https://butsjuhwge.skywork.website/')}" class="button">
                  Complete Your Registration
                </a>
              </div>
              
              <p><small>If the button doesn't work, copy and paste this link into your browser:<br>
              ${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=VERIFICATION_TOKEN&type=signup</small></p>
            </div>
            
            <div class="footer">
              <p>© 2024 FTG designmatch. All rights reserved.</p>
              <p>This email was sent to ${email}. If you didn't create an account, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      textContent = `Welcome to FTG designmatch, ${fullName || 'Designer'}!

Thank you for joining our creative community! You're now part of a platform that connects talented designers with clients who value quality work.

What you get:
• Keep 90% of your earnings (only 10% commission)
• Secure payments with escrow protection  
• Access to quality, verified clients

Next Steps:
1. Complete your profile with portfolio samples
2. Set your availability and rates
3. Start receiving project invitations

Complete your registration: ${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=VERIFICATION_TOKEN&type=signup

© 2024 FTG designmatch. All rights reserved.
This email was sent to ${email}. If you didn't create an account, please ignore this email.`;
    }

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(),
        to: [email],
        subject: subject,
        html: htmlContent,
        text: textContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Resend API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: result.id,
        message: 'Branded verification email sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});