import { createServerSupabaseClient } from '@/lib/supabase/server'
import { UserRole } from '@/lib/types/database.types'

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = await createServerSupabaseClient()
  const user = await getCurrentUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile()
  return profile?.role || null
}

export async function checkPermission(allowedRoles: UserRole[]): Promise<boolean> {
  const role = await getUserRole()
  if (!role) return false
  return allowedRoles.includes(role)
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]) {
  await requireAuth()
  const hasPermission = await checkPermission(allowedRoles)

  if (!hasPermission) {
    throw new Error('Forbidden: insufficient permissions')
  }
}
