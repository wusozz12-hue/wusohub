import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/config'
import type { CurrentProfile } from '@/lib/types'

/**
 * Returns the currently authenticated user's profile (with email), or null.
 * Safe to call even when Supabase is not configured.
 */
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  if (!isSupabaseConfigured) return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!data) return null

  return { ...data, email: user.email ?? null } as CurrentProfile
}
