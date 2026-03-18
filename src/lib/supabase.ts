import { createBrowserClient } from '@supabase/ssr'
import { createClient as _createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createBrowserClient(url, anon)
}

export function createAdminClient() {
  return _createClient(
    url,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function createServerClient() {
  const { cookies } = await import('next/headers')
  const { createServerClient: _create } = await import('@supabase/ssr')
  const cookieStore = await cookies()
  return _create(url, anon, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(c: any[]) { c.forEach(({ name, value, options }: any) => { try { cookieStore.set(name, value, options) } catch {} }) }
    }
  })
}
