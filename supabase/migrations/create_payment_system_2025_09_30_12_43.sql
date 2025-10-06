-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create user profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles_2025_09_30_12_43 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type TEXT CHECK (user_type IN ('client', 'designer')) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    portfolio_url TEXT,
    skills TEXT[],
    hourly_rate DECIMAL(10,2),
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects_2025_09_30_12_43 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.user_profiles_2025_09_30_12_43(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES public.user_profiles_2025_09_30_12_43(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    status TEXT CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments_2025_09_30_12_43 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects_2025_09_30_12_43(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.user_profiles_2025_09_30_12_43(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES public.user_profiles_2025_09_30_12_43(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    commission_amount DECIMAL(10,2) NOT NULL,
    designer_amount DECIMAL(10,2) NOT NULL,
    stripe_payment_intent_id TEXT,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    payment_type TEXT CHECK (payment_type IN ('deposit', 'final_payment', 'milestone')) DEFAULT 'deposit',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.user_profiles_2025_09_30_12_43
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles_2025_09_30_12_43
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles_2025_09_30_12_43
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view designer profiles" ON public.user_profiles_2025_09_30_12_43
    FOR SELECT USING (user_type = 'designer');

CREATE POLICY "Users can view projects they're involved in" ON public.projects_2025_09_30_12_43
    FOR SELECT USING (
        client_id IN (SELECT id FROM public.user_profiles_2025_09_30_12_43 WHERE user_id = auth.uid()) OR
        designer_id IN (SELECT id FROM public.user_profiles_2025_09_30_12_43 WHERE user_id = auth.uid()) OR
        status = 'open'
    );

CREATE POLICY "Clients can create projects" ON public.projects_2025_09_30_12_43
    FOR INSERT WITH CHECK (
        client_id IN (SELECT id FROM public.user_profiles_2025_09_30_12_43 WHERE user_id = auth.uid() AND user_type = 'client')
    );

CREATE POLICY "Users can view payments they're involved in" ON public.payments_2025_09_30_12_43
    FOR SELECT USING (
        client_id IN (SELECT id FROM public.user_profiles_2025_09_30_12_43 WHERE user_id = auth.uid()) OR
        designer_id IN (SELECT id FROM public.user_profiles_2025_09_30_12_43 WHERE user_id = auth.uid())
    );

-- Enable RLS on all tables
ALTER TABLE public.user_profiles_2025_09_30_12_43 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_2025_09_30_12_43 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments_2025_09_30_12_43 ENABLE ROW LEVEL SECURITY;