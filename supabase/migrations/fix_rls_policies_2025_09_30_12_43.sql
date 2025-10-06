-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles_2025_09_30_12_43;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles_2025_09_30_12_43;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles_2025_09_30_12_43;
DROP POLICY IF EXISTS "Anyone can view designer profiles" ON public.user_profiles_2025_09_30_12_43;

-- Create more permissive RLS policies
CREATE POLICY "Enable read access for all users" ON public.user_profiles_2025_09_30_12_43
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.user_profiles_2025_09_30_12_43
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON public.user_profiles_2025_09_30_12_43
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.user_profiles_2025_09_30_12_43
    FOR DELETE USING (auth.uid() = user_id);

-- Also create a trigger to automatically create user profiles after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles_2025_09_30_12_43 (user_id, full_name, email, user_type)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    COALESCE(new.raw_user_meta_data->>'user_type', 'client')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();