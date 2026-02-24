// @ts-nocheck
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getUserProfile } from '@/lib/auth/helpers'
import { Package, AlertTriangle, TrendingUp, Activity, BarChart3, ArrowRight } from 'lucide-react'
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

  // Fetch recent activity - split queries to avoid foreign key issues
  const { data: activityData, error: activityError } = await supabase
    .from('activity_logs')
    .select('id, user_id, action, item_id, changes, timestamp')
    .order('timestamp', { ascending: false })
    .limit(5)

  let recentActivity = []

  if (activityData && activityData.length > 0) {
    // Fetch related data separately
    const userIds = [...new Set(activityData.map(a => a.user_id).filter(Boolean))]
    const itemIds = [...new Set(activityData.map(a => a.item_id).filter(Boolean))]

    console.log('[Dashboard] Fetching profiles for user IDs:', userIds)

    // Get user profiles with full_name
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .in('id', userIds)

    console.log('[Dashboard] Fetched user profiles:', users)
    console.log('[Dashboard] User profiles error:', usersError)

    if (usersError) {
      console.error('Error fetching user profiles:', usersError)
    }

    const { data: items } = await supabase
      .from('inventory_items')
      .select('id, name')
      .in('id', itemIds)

    // Combine the data
    recentActivity = activityData.map(activity => {
      const userProfile = users?.find(u => u.id === activity.user_id)

      console.log(`[Dashboard] Activity ${activity.id}: user_id=${activity.user_id}, profile=`, userProfile)

      // If full_name is empty or null, use a generic label
      let displayName = 'Unknown User'
      if (userProfile && userProfile.full_name) {
        displayName = userProfile.full_name.trim() || 'User'
      }

      return {
        ...activity,
        user_profiles: {
          full_name: displayName
        },
        inventory_items: items?.find(i => i.id === activity.item_id) || null,
      }
    })
  }

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
