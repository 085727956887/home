import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Export client Supabase agar bisa dipakai di App.jsx
export const supabase = createClient(supabaseUrl, supabaseAnonKey)