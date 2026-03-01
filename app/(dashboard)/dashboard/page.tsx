// @ts-nocheck
'use client'

import useSWR from 'swr'
import { Package, AlertTriangle, TrendingUp, Activity, BarChart3, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg" />
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useSWR('/api/dashboard/stats', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  const { data: activityData, isLoading: activityLoading } = useSWR('/api/dashboard/activity', fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds
  })

  if (statsLoading || activityLoading) {
    return <DashboardSkeleton />
  }

  const recentActivity = activityData?.activities || []

  const statsCards = [
    {
      label: 'Total Items',
      value: stats?.totalItems || 0,
      icon: Package,
      color: 'blue',
      href: '/inventory',
    },
    {
      label: 'Low Stock Alerts',
      value: stats?.lowStockCount || 0,
      icon: AlertTriangle,
      color: 'red',
      href: '/inventory?status=low_stock',
    },
    {
      label: 'Total Value',
      value: `$${(stats?.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'green',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's an overview of your inventory system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-500',
            red: 'bg-red-500',
            green: 'bg-green-500',
          }

          const content = (
            <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.label}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )

          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.label}>{content}</div>
          )
        })}
      </div>

      {/* Analytics Banner */}
      <Link href="/analytics" className="block">
        <div className="bg-gradient-to-br from-purple-500 via-blue-600 to-blue-700 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] cursor-pointer overflow-hidden">
          <div className="p-6 relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-white opacity-5 rounded-full" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg backdrop-blur-sm">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Advanced Analytics</h3>
                  <p className="text-blue-100 mt-1">
                    Explore detailed insights, charts, and trends
                  </p>
                </div>
              </div>
              <ArrowRight className="h-6 w-6 text-white opacity-80" />
            </div>
          </div>
        </div>
      </Link>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
        </div>
        <div className="px-6 py-4">
          {recentActivity && recentActivity.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, idx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {idx !== recentActivity.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${
                            activity.action === 'create' ? 'bg-green-500' :
                            activity.action === 'update' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`}>
                            <Activity className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              <span className="font-medium">{activity.user_profiles?.full_name || 'Unknown'}</span>
                              {' '}
                              <span className="text-gray-600 dark:text-gray-400">
                                {activity.action === 'create' ? 'created' :
                                 activity.action === 'update' ? 'updated' :
                                 'deleted'}
                              </span>
                              {' '}
                              <span className="font-medium">{activity.inventory_items?.name || 'Unknown Item'}</span>
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                            {new Date(activity.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>

      {/* Quick Actions - Removed role check, will show for all users */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/inventory/new"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Package className="h-4 w-4 mr-2" />
            Add New Item
          </Link>
          <Link
            href="/inventory?status=low_stock"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            View Low Stock
          </Link>
        </div>
      </div>
    </div>
  )
}
