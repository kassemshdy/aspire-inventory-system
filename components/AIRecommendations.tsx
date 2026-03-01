// @ts-nocheck
'use client'

import useSWR from 'swr'
import { Sparkles, ShoppingCart, TrendingUp, Package, RefreshCw } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Recommendation {
  itemName: string
  category: string
  reason: string
  estimatedPrice: string
  priority: 'high' | 'medium' | 'low'
  type: 'replenishment' | 'expansion' | 'complementary'
}

function RecommendationsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

export function AIRecommendations() {
  const { data, isLoading, error, mutate } = useSWR('/api/ai/recommendations', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const handleRefresh = () => {
    mutate()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'replenishment':
        return <Package className="h-4 w-4" />
      case 'expansion':
        return <TrendingUp className="h-4 w-4" />
      case 'complementary':
        return <ShoppingCart className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'replenishment':
        return 'Replenishment'
      case 'expansion':
        return 'Expansion'
      case 'complementary':
        return 'Complementary'
      default:
        return type
    }
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">AI Purchase Recommendations</h2>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">Failed to load recommendations</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">AI Purchase Recommendations</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Smart suggestions based on your inventory analysis
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <RecommendationsSkeleton />
      ) : data?.recommendations && data.recommendations.length > 0 ? (
        <div className="space-y-4">
          {data.recommendations.map((rec: Recommendation, index: number) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {rec.itemName}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                      {getTypeIcon(rec.type)}
                      {getTypeLabel(rec.type)}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                      {rec.category}
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {rec.estimatedPrice}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {rec.reason}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No recommendations available. Add inventory items to get AI-powered suggestions.
          </p>
        </div>
      )}

      {data?.recommendations && data.recommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 These recommendations are AI-generated based on your current inventory. Last updated: {new Date(data.generatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}
