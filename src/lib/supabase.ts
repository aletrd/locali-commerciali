// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'
import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side (browser)
export function createClient() {
  return createBrowserClient(url, anon)
}

// Server-side (Server Components, Route Handlers, Server Actions)
export function createServerClient() {
  const cookieStore = cookies()
  return _createServerClient(url, anon, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value },
    },
  })
}

// Admin client (solo nelle API routes — mai esporre al browser)
export function createAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
