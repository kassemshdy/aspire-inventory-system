// @ts-nocheck
'use client'

import { TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, Activity } from 'lucide-react'

interface KeyMetricsCardsProps {
  totalValue: number
  totalItems: number
  lowStockCount: number
  avgPrice: number
  totalActivity: number
  valueTrend?: number // percentage change
}

export function KeyMetricsCards({
  totalValue,
  totalItems,
  lowStockCount,
  avgPrice,
  totalActivity,
  valueTrend = 0
}: KeyMetricsCardsProps) {
  const metrics = [
    {
      label: 'Total Inventory Value',
      value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'blue',
      trend: valueTrend,
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Total Items',
      value: totalItems.toLocaleString(),
      icon: Package,
      color: 'green',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      label: 'Low Stock Items',
      value: lowStockCount.toLocaleString(),
      icon: AlertTriangle,
      color: 'amber',
      bgGradient: 'from-amber-500 to-amber-600'
    },
    {
      label: 'Average Item Price',
      value: `$${avgPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'purple',
      bgGradient: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Total Activity (30d)',
      value: totalActivity.toLocaleString(),
      icon: Activity,
      color: 'pink',
      bgGradient: 'from-pink-500 to-pink-600'
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <div
            key={metric.label}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className={`bg-gradient-to-br ${metric.bgGradient} p-4`}>
              <div className="flex items-center justify-between">
                <Icon className="h-8 w-8 text-white opacity-90" />
                {metric.trend !== undefined && (
                  <div className="flex items-center text-white text-sm font-medium">
                    {metric.trend > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +{metric.trend.toFixed(1)}%
                      </>
                    ) : metric.trend < 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 mr-1" />
                        {metric.trend.toFixed(1)}%
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {metric.label}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {metric.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
