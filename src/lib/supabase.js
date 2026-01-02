import { createClient } from '@supabase/supabase-js'

// We use Vite environment variables here.
// You will add these values in your Vercel Dashboard Settings.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
