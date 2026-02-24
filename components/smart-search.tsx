'use client'

import { useState } from 'react'
import { Sparkles, Search, Loader2, X } from 'lucide-react'
import { Database } from '@/lib/types/database.types'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface SmartSearchProps {
  onResults: (items: InventoryItem[], explanation: string) => void
  onClear: () => void
}

export function SmartSearch({ onResults, onClear }: SmartSearchProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastExplanation, setLastExplanation] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/search/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Search failed')
      }

      const data = await response.json()
      setLastExplanation(data.explanation)
      onResults(data.items, data.explanation)
    } catch (err: any) {
      setError(err.message || 'Failed to search')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setError('')
    setLastExplanation('')
    onClear()
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Sparkles className="h-5 w-5 text-purple-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try: 'show me low stock electronics' or 'items under $100'"
            className="block w-full pl-10 pr-24 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50"
            disabled={loading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-2">
            {lastExplanation && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex items-center px-4 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {lastExplanation && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start">
            <Sparkles className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-900">AI Interpretation:</p>
              <p className="text-sm text-purple-700 mt-1">{lastExplanation}</p>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p className="font-medium mb-1">Try these example queries:</p>
        <ul className="space-y-1 ml-4">
          <li>• "show me all electronics that are running low"</li>
          <li>• "furniture items under $300"</li>
          <li>• "what items do we need to reorder"</li>
          <li>• "office supplies in stock"</li>
        </ul>
      </div>
    </div>
  )
}
