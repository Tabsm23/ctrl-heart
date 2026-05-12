import { createClient } from '@supabase/supabase-js'

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

const configured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0

if (import.meta.env.DEV && !configured) {
  console.warn(
    '[ctrl-heart] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (see .env.example). Auth requests will fail until both are set.'
  )
}

// Missing env would make createClient throw and white-screen the whole app.
// Use inert placeholders so the UI can load; auth/vault calls fail until configured.
const url = configured ? supabaseUrl : 'https://placeholder.supabase.co'
const anonKey = configured
  ? supabaseAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.'

export const supabaseConfigured = configured
export const supabase = createClient(url, anonKey)