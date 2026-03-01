import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // Fetch recent activity
    const { data: activityData, error: activityError } = await supabase
      .from('activity_logs')
      .select('id, user_id, action, item_id, changes, timestamp')
      .order('timestamp', { ascending: false })
      .limit(5)

    if (activityError) {
      console.error('Error fetching activity:', activityError)
      return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
    }

    let recentActivity = []

    if (activityData && activityData.length > 0) {
      // Fetch related data separately
      const userIds = [...new Set(activityData.map((a: any) => a.user_id).filter(Boolean))]
      const itemIds = [...new Set(activityData.map((a: any) => a.item_id).filter(Boolean))]

      // Get user profiles with full_name
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('id', userIds)

      const { data: items } = await supabase
        .from('inventory_items')
        .select('id, name')
        .in('id', itemIds)

      // Combine the data
      recentActivity = activityData.map((activity: any) => {
        const userProfile: any = users?.find((u: any) => u.id === activity.user_id)

        let displayName = 'Unknown User'
        if (userProfile && userProfile.full_name) {
          displayName = userProfile.full_name.trim() || 'User'
        }

        return {
          ...activity,
          user_profiles: {
            full_name: displayName
          },
          inventory_items: items?.find((i: any) => i.id === activity.item_id) || null,
        }
      })
    }

    return NextResponse.json({ activities: recentActivity }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}
