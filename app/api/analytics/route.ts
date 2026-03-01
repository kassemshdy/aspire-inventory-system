import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { subDays } from 'date-fns'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // Fetch all inventory items
    const { data: items } = await supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false })

    // Fetch activity logs for the last 30 days
    const thirtyDaysAgo = subDays(new Date(), 30)
    const { data: activityLogs } = await supabase
      .from('activity_logs')
      .select('*')
      .gte('timestamp', thirtyDaysAgo.toISOString())
      .order('timestamp', { ascending: true })

    // Calculate key metrics
    const totalItems = items?.length || 0
    const totalValue = items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0) || 0
    const lowStockCount = items?.filter((item: any) => item.status === 'low_stock').length || 0
    const avgPrice = totalItems > 0 ? totalValue / totalItems : 0
    const totalActivity = activityLogs?.length || 0

    // Calculate value trend (last 7 days vs previous 7 days)
    const last7Days = items?.filter((item: any) =>
      new Date(item.created_at) >= subDays(new Date(), 7)
    ) || []
    const previous7Days = items?.filter((item: any) =>
      new Date(item.created_at) >= subDays(new Date(), 14) &&
      new Date(item.created_at) < subDays(new Date(), 7)
    ) || []
    const last7Value = last7Days.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    const previous7Value = previous7Days.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    const valueTrend = previous7Value > 0 ? ((last7Value - previous7Value) / previous7Value) * 100 : 0

    // Prepare data for Category Distribution chart
    const categoryData = items?.reduce((acc: any[], item: any) => {
      const existing = acc.find(c => c.name === item.category)
      const itemValue = item.quantity * item.unit_price
      if (existing) {
        existing.value += itemValue
        existing.count += 1
      } else {
        acc.push({
          name: item.category,
          value: itemValue,
          count: 1
        })
      }
      return acc
    }, [] as Array<{ name: string; value: number; count: number }>)
    categoryData?.sort((a, b) => b.value - a.value)

    // Prepare data for Status Breakdown chart
    const statusData = items?.reduce((acc: any[], item: any) => {
      const existing = acc.find(s => s.status === item.status)
      const itemValue = item.quantity * item.unit_price
      if (existing) {
        existing.count += 1
        existing.value += itemValue
      } else {
        acc.push({
          status: item.status,
          count: 1,
          value: itemValue
        })
      }
      return acc
    }, [] as Array<{ status: string; count: number; value: number }>)
    const orderedStatuses = ['in_stock', 'low_stock', 'ordered', 'discontinued']
    statusData?.sort((a, b) => orderedStatuses.indexOf(a.status) - orderedStatuses.indexOf(b.status))

    // Prepare data for Top 5 Items chart
    const topItems = items
      ?.map((item: any) => ({
        name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
        value: item.quantity * item.unit_price,
        quantity: item.quantity
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) || []

    return NextResponse.json({
      metrics: {
        totalValue,
        totalItems,
        lowStockCount,
        avgPrice,
        totalActivity,
        valueTrend
      },
      categoryData: categoryData || [],
      statusData: statusData || [],
      topItems
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
