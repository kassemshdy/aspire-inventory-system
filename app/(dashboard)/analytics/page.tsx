// @ts-nocheck
'use client'

import useSWR from 'swr'
import { CategoryDistributionChart } from '@/components/analytics/CategoryDistributionChart'
import { StatusBreakdownChart } from '@/components/analytics/StatusBreakdownChart'
import { TopItemsChart } from '@/components/analytics/TopItemsChart'
import { KeyMetricsCards } from '@/components/analytics/KeyMetricsCards'
import { BarChart3 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { data, isLoading, error } = useSWR('/api/analytics', fetcher, {
    refreshInterval: 60000, // Refresh every 60 seconds
  })

  if (isLoading) {
    return <AnalyticsSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load analytics</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { metrics, categoryData, statusData, topItems } = data || {}

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Comprehensive insights into your inventory performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {metrics && (
        <KeyMetricsCards
          totalValue={metrics.totalValue}
          totalItems={metrics.totalItems}
          lowStockCount={metrics.lowStockCount}
          avgPrice={metrics.avgPrice}
          totalActivity={metrics.totalActivity}
          valueTrend={metrics.valueTrend}
        />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryData && <CategoryDistributionChart data={categoryData} />}
        {statusData && <StatusBreakdownChart data={statusData} />}
      </div>

      {/* Top Items - Full Width */}
      {topItems && <TopItemsChart data={topItems} />}

      {/* Insights Section */}
      {metrics && categoryData && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              📊 Quick Insights
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Stock Health</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {metrics.totalItems > 0 ? ((metrics.totalItems - metrics.lowStockCount) / metrics.totalItems * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Items in good stock</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Most Common Category</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {categoryData[0]?.name || 'N/A'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {categoryData[0]?.count || 0} items
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Activity Rate</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {(metrics.totalActivity / 30).toFixed(1)} per day
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Over last 30 days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
