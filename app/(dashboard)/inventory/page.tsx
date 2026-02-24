'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database.types'
import { Plus, Search, Filter, Download, Upload } from 'lucide-react'
import Link from 'next/link'
import { InventoryTable } from '@/components/inventory-table'
import { SmartSearch } from '@/components/smart-search'
import { exportToCSV, parseCSV } from '@/lib/utils/csv'
import { useRef } from 'react'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [aiSearchActive, setAiSearchActive] = useState(false)
  const [aiSearchResults, setAiSearchResults] = useState<InventoryItem[]>([])
  const [aiSearchExplanation, setAiSearchExplanation] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchItems()
    fetchUserRole()

    // Set up real-time subscription
    const channel = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        (payload) => {
          console.log('Real-time update:', payload)
          fetchItems()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setUserRole(profile?.role || null)
    }
  }

  const fetchItems = async () => {
    try {
      let query = supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories
  const categories = Array.from(new Set(items.map(item => item.category)))

  // Handle AI search results
  const handleAiSearchResults = (results: InventoryItem[], explanation: string) => {
    setAiSearchResults(results)
    setAiSearchExplanation(explanation)
    setAiSearchActive(true)
  }

  const handleClearAiSearch = () => {
    setAiSearchActive(false)
    setAiSearchResults([])
    setAiSearchExplanation('')
  }

  const handleExportCSV = () => {
    const itemsToExport = aiSearchActive ? aiSearchResults : filteredItems
    exportToCSV(itemsToExport, `inventory-export-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const csvText = e.target?.result as string
        const rows = parseCSV(csvText)

        if (rows.length === 0) {
          alert('No valid rows found in CSV file')
          return
        }

        if (!confirm(`Import ${rows.length} items from CSV? This will create new inventory items.`)) {
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          alert('You must be logged in to import items')
          return
        }

        let successCount = 0
        let errorCount = 0

        for (const row of rows) {
          try {
            const { error } = await supabase
              .from('inventory_items')
              .insert({
                ...row,
                created_by: user.id,
              })

            if (error) {
              console.error(`Error importing ${row.name}:`, error)
              errorCount++
            } else {
              successCount++
            }
          } catch (err) {
            console.error(`Error importing ${row.name}:`, err)
            errorCount++
          }
        }

        alert(`Import complete!\nSuccess: ${successCount}\nErrors: ${errorCount}`)
        fetchItems()
      } catch (error: any) {
        alert('Error parsing CSV file: ' + error.message)
      }
    }

    reader.readAsText(file)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Filter items based on search and filters (if AI search is not active)
  const filteredItems = aiSearchActive ? aiSearchResults : items.filter(item => {
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const canModify = userRole === 'admin' || userRole === 'manager'
  const canDelete = userRole === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-2 text-gray-600">
            Manage your inventory items
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>

          {canModify && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </button>

              <Link
                href="/inventory/new"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Link>
            </>
          )}
        </div>
      </div>

      {/* AI Smart Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            AI-Powered Search
          </span>
        </h2>
        <SmartSearch onResults={handleAiSearchResults} onClear={handleClearAiSearch} />
      </div>

      {/* Traditional Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Traditional Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="ordered">Ordered</option>
            <option value="discontinued">Discontinued</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredItems.length} of {items.length} items
            {aiSearchActive && ' (AI search active)'}
          </span>
          {aiSearchActive && (
            <button
              onClick={handleClearAiSearch}
              className="text-purple-600 hover:text-purple-800 font-medium text-sm"
            >
              Clear AI Search
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {items.length === 0 ? 'No items yet. Add your first item!' : 'No items match your filters.'}
          </div>
        ) : (
          <InventoryTable
            items={filteredItems}
            canModify={canModify}
            canDelete={canDelete}
            onDelete={fetchItems}
          />
        )}
      </div>
    </div>
  )
}
