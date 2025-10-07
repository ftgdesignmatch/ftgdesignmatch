-- Update auth settings to allow signups without email confirmation
-- Note: This would typically be done in Supabase dashboard, but we can create a function to handle it

-- Create a function to handle user signup without email confirmation requirement
CREATE OR REPLACE FUNCTION public.handle_signup_without_confirmation()
RETURNS trigger AS $$
BEGIN
  -- Automatically confirm email for new signups
  NEW.email_confirmed_at = NOW();
  NEW.confirmed_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm emails on signup
DROP TRIGGER IF EXISTS auto_confirm_email ON auth.users;
CREATE TRIGGER auto_confirm_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NULL)
  EXECUTE PROCEDURE public.handle_signup_without_confirmation();

-- Also update existing unconfirmed users (if any)
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;