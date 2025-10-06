-- Diagnose and fix authentication issues

-- First, let's see what users exist and their status
SELECT 
    id,
    email,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Fix any users that are stuck in unconfirmed state
UPDATE auth.users 
SET 
    email_confirmed_at = COALESCE(email_confirmed_at, created_at),
    confirmed_at = COALESCE(confirmed_at, created_at)
WHERE email_confirmed_at IS NULL OR confirmed_at IS NULL;

-- Create a function to manually confirm a user by email
CREATE OR REPLACE FUNCTION public.confirm_user_by_email(user_email text)
RETURNS json AS $$
DECLARE
    user_record auth.users%ROWTYPE;
    result json;
BEGIN
    -- Find the user
    SELECT * INTO user_record FROM auth.users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'User not found', 'email', user_email);
    END IF;
    
    -- Update the user to be confirmed
    UPDATE auth.users 
    SET 
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        confirmed_at = COALESCE(confirmed_at, NOW())
    WHERE email = user_email;
    
    -- Return user info
    SELECT json_build_object(
        'success', true,
        'user_id', id,
        'email', email,
        'email_confirmed_at', email_confirmed_at,
        'confirmed_at', confirmed_at,
        'created_at', created_at
    ) INTO result
    FROM auth.users 
    WHERE email = user_email;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.confirm_user_by_email(text) TO anon, authenticated;

-- Create a function to check user status by email
CREATE OR REPLACE FUNCTION public.check_user_status(user_email text)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'exists', COUNT(*) > 0,
        'user_data', json_agg(
            json_build_object(
                'id', id,
                'email', email,
                'email_confirmed_at', email_confirmed_at,
                'confirmed_at', confirmed_at,
                'created_at', created_at,
                'last_sign_in_at', last_sign_in_at
            )
        )
    ) INTO result
    FROM auth.users 
    WHERE email = user_email;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_user_status(text) TO anon, authenticated;