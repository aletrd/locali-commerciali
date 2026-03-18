import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createBrowserClient(url, anon)
}

export async function createServerClient() {
  const { cookies } = await import('next/headers')
  const { createServerClient: _create } = await import('@supabase/ssr')
  const cookieStore = cookies()
  return _create(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

export function createAdminClient() {
  return createSupabaseClient(
    url,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
