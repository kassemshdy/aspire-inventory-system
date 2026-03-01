import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    // Get inventory statistics
    const { data: items } = await supabase
      .from('inventory_items')
      .select('*')

    const { data: lowStockItems } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('status', 'low_stock')

    const totalItems = items?.length || 0
    const lowStockCount = lowStockItems?.length || 0
    const totalValue = items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0) || 0

    return NextResponse.json({
      totalItems,
      lowStockCount,
      totalValue,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
