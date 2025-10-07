-- Create function to send branded welcome email via edge function
CREATE OR REPLACE FUNCTION public.send_welcome_email()
RETURNS trigger AS $$
DECLARE
  user_type_val text;
  full_name_val text;
BEGIN
  -- Get user metadata
  user_type_val := COALESCE(NEW.raw_user_meta_data->>'user_type', 'client');
  full_name_val := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  
  -- Only send branded email for designers
  IF user_type_val = 'designer' THEN
    -- Call the edge function to send branded email
    -- Note: This is a simplified approach. In production, you might want to use a queue
    PERFORM net.http_post(
      url := 'https://huiotujxbfycfmpucpdf.supabase.co/functions/v1/send_branded_email_2025_09_30_12_43',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'fullName', full_name_val,
        'type', 'verification'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for sending welcome emails
DROP TRIGGER IF EXISTS on_auth_user_welcome_email ON auth.users;
CREATE TRIGGER on_auth_user_welcome_email
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  WHEN (NEW.email_confirmed_at IS NULL) -- Only for unconfirmed emails
  EXECUTE PROCEDURE public.send_welcome_email();

-- Also create a function to manually send welcome emails if needed
CREATE OR REPLACE FUNCTION public.manual_send_welcome_email(user_email text, user_name text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT net.http_post(
    url := 'https://huiotujxbfycfmpucpdf.supabase.co/functions/v1/send_branded_email_2025_09_30_12_43',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'email', user_email,
      'fullName', user_name,
      'type', 'verification'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;