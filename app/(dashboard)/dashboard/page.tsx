// @ts-nocheck
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/helpers'
import { Package, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const profile = await getUserProfile()

  // Get inventory statistics
  const { data: items } = await supabase
    .from('inventory_items')
    .select('*')

  const { data: lowStockItems } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('status', 'low_stock')

  // Fetch recent activity with simplified query
  const { data: recentActivity, error: activityError } = await supabase
    .from('activity_logs')
    .select(`
      id,
      user_id,
      action,
      item_id,
      changes,
      timestamp,
      user_profiles (full_name),
      inventory_items (name)
    `)
    .order('timestamp', { ascending: false })
    .limit(5)

  if (activityError) {
    console.error('Error fetching activity:', activityError)
  }

  const totalItems = items?.length || 0
  const lowStockCount = lowStockItems?.length || 0
  const totalValue = items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0

  const stats = [
    {
      label: 'Total Items',
      value: totalItems,
      icon: Package,
      color: 'blue',
      href: '/inventory',
    },
    {
      label: 'Low Stock Alerts',
      value: lowStockCount,
      icon: AlertTriangle,
      color: 'red',
      href: '/inventory?status=low_stock',
    },
    {
      label: 'Total Value',
      value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'green',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'User'}
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your inventory system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          const colorClasses = {
            blue: 'bg-blue-500',
            red: 'bg-red-500',
            green: 'bg-green-500',
          }

          const content = (
            <div className="bg-white overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.label}
                      </dt>
                      <dd className="text-2xl font-semibold text-gray-900">
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

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
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
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.action === 'create' ? 'bg-green-500' :
                            activity.action === 'update' ? 'bg-blue-500' :
                            'bg-red-500'
                          }`}>
                            <Activity className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">{activity.user_profiles?.full_name || 'Unknown'}</span>
                              {' '}
                              <span className="text-gray-600">
                                {activity.action === 'create' ? 'created' :
                                 activity.action === 'update' ? 'updated' :
                                 'deleted'}
                              </span>
                              {' '}
                              <span className="font-medium">{activity.inventory_items?.name || 'Unknown Item'}</span>
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
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
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {(profile?.role === 'admin' || profile?.role === 'manager') && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
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
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Low Stock
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
