import { createServerClient } from '@supabase/ssr'

export function createClient() {
  // Check if we're in a server environment
  if (typeof window !== 'undefined') {
    // We're in the browser, return a client-side client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    
    return createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {
            // No-op in browser
          },
        },
      }
    )
  }

  // We're in a server environment, try to use cookies if available
  try {
    const { cookies } = require('next/headers')
    const cookieStore = cookies()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    
    return createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          async getAll() {
            const cookieList = await cookieStore.getAll()
            return cookieList
          },
          async setAll(cookiesToSet) {
            try {
              for (const { name, value, options } of cookiesToSet) {
                await cookieStore.set(name, value, options)
              }
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
  } catch {
    // Fallback for when next/headers is not available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    
    return createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {
            // No-op
          },
        },
      }
    )
  }
}
