/**
 * Supabase Server Client
 * Используется в Server Components и Server Actions
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'
import { createSupabaseFetch } from '@/lib/supabase/fetch-helpers'

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const customFetch = createSupabaseFetch(supabaseUrl)

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      ...(customFetch ? { global: { fetch: customFetch } } : {}),
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component не может set cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component не может remove cookies
          }
        },
      },
    }
  )
}
