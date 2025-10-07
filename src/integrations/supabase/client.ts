import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://huiotujxbfycfmpucpdf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1aW90dWp4YmZ5Y2ZtcHVjcGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE4NzIsImV4cCI6MjA3NDc5Nzg3Mn0.50Cmf7eNNKYe91SPE0yonVgLlfQNufPlBWViuAX_PA8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
