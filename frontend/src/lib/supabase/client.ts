/**
 * Supabase Browser Client
 * Используется в Client Components
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'
import { createSupabaseFetch } from '@/lib/supabase/fetch-helpers'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const customFetch = createSupabaseFetch(supabaseUrl)

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey,
    customFetch
      ? {
          global: { fetch: customFetch },
        }
      : undefined
  )
}
