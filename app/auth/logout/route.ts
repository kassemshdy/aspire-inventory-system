import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()

  // Return JSON response instead of redirect
  return NextResponse.json({ success: true }, { status: 200 })
}
