import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database.types'

let client: ReturnType<typeof createSupabaseBrowserClient<Database>> | null = null

export function createClient() {
  if (!client) {
    client = createSupabaseBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
