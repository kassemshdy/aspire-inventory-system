// @ts-nocheck
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/helpers'
import { CategoryDistributionChart } from '@/components/analytics/CategoryDistributionChart'
import { StatusBreakdownChart } from '@/components/analytics/StatusBreakdownChart'
import { TopItemsChart } from '@/components/analytics/TopItemsChart'
import { KeyMetricsCards } from '@/components/analytics/KeyMetricsCards'
import { BarChart3 } from 'lucide-react'
import { subDays } from 'date-fns'

export default async function AnalyticsPage() {
  const supabase = await createServerSupabaseClient()
  const profile = await getUserProfile()

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
  const totalValue = items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0
  const lowStockCount = items?.filter(item => item.status === 'low_stock').length || 0
  const avgPrice = totalItems > 0 ? totalValue / totalItems : 0
  const totalActivity = activityLogs?.length || 0

  // Calculate value trend (last 7 days vs previous 7 days)
  const last7Days = items?.filter(item =>
    new Date(item.created_at) >= subDays(new Date(), 7)
  ) || []
  const previous7Days = items?.filter(item =>
    new Date(item.created_at) >= subDays(new Date(), 14) &&
    new Date(item.created_at) < subDays(new Date(), 7)
  ) || []
  const last7Value = last7Days.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  const previous7Value = previous7Days.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  const valueTrend = previous7Value > 0 ? ((last7Value - previous7Value) / previous7Value) * 100 : 0

  // Prepare data for Category Distribution chart
  const categoryData = items?.reduce((acc, item) => {
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
  const statusData = items?.reduce((acc, item) => {
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
    ?.map(item => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      value: item.quantity * item.unit_price,
      quantity: item.quantity
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-1 text-gray-600">
                Comprehensive insights into your inventory performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <KeyMetricsCards
        totalValue={totalValue}
        totalItems={totalItems}
        lowStockCount={lowStockCount}
        avgPrice={avgPrice}
        totalActivity={totalActivity}
        valueTrend={valueTrend}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryDistributionChart data={categoryData || []} />
        <StatusBreakdownChart data={statusData || []} />
      </div>

      {/* Top Items - Full Width */}
      <TopItemsChart data={topItems} />

      {/* Insights Section */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            📊 Quick Insights
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Stock Health</p>
            <p className="text-lg font-semibold text-gray-900">
              {totalItems > 0 ? ((totalItems - lowStockCount) / totalItems * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Items in good stock</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Most Common Category</p>
            <p className="text-lg font-semibold text-gray-900">
              {categoryData?.[0]?.name || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {categoryData?.[0]?.count || 0} items
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Activity Rate</p>
            <p className="text-lg font-semibold text-gray-900">
              {(totalActivity / 30).toFixed(1)} per day
            </p>
            <p className="text-xs text-gray-500 mt-1">Over last 30 days</p>
          </div>
        </div>
      </div>
    </div>
  )
}
