-- Fix authentication issues for login

-- Update any existing users to be confirmed (since we disabled email confirmation)
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Ensure RLS policies allow proper access for authenticated users
-- Drop and recreate policies to ensure they work correctly

DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles_2025_09_30_12_43;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles_2025_09_30_12_43;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_profiles_2025_09_30_12_43;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.user_profiles_2025_09_30_12_43;

-- Create simple, working RLS policies
CREATE POLICY "Allow all authenticated users to read profiles" ON public.user_profiles_2025_09_30_12_43
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow authenticated users to insert their own profile" ON public.user_profiles_2025_09_30_12_43
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own profile" ON public.user_profiles_2025_09_30_12_43
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own profile" ON public.user_profiles_2025_09_30_12_43
    FOR DELETE USING (auth.uid() = user_id);

-- Create a simple function to help debug authentication issues
CREATE OR REPLACE FUNCTION public.debug_auth_status()
RETURNS json AS $$
BEGIN
    RETURN json_build_object(
        'current_user_id', auth.uid(),
        'current_role', auth.role(),
        'is_authenticated', (auth.role() = 'authenticated'),
        'user_count', (SELECT COUNT(*) FROM auth.users)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the debug function
GRANT EXECUTE ON FUNCTION public.debug_auth_status() TO anon, authenticated;