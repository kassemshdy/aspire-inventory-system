'use client'

import { useState } from 'react'
import { Database } from '@/lib/types/database.types'
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']

interface InventoryTableProps {
  items: InventoryItem[]
  canModify: boolean
  canDelete: boolean
  onDelete: () => void
}

type SortField = 'name' | 'quantity' | 'unit_price' | 'status' | 'category'
type SortDirection = 'asc' | 'desc'

export function InventoryTable({ items, canModify, canDelete, onDelete }: InventoryTableProps) {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const supabase = createClient()

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    let aVal: any = a[sortField]
    let bVal: any = b[sortField]

    if (sortField === 'name' || sortField === 'status' || sortField === 'category') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    setDeletingId(id)

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      onDelete()
    } catch (error: any) {
      alert('Error deleting item: ' + error.message)
    } finally {
      setDeletingId(null)
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    )
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      in_stock: 'bg-green-100 text-green-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      ordered: 'bg-blue-100 text-blue-800',
      discontinued: 'bg-gray-100 text-gray-800',
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              onClick={() => handleSort('name')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              Name <SortIcon field="name" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th
              onClick={() => handleSort('category')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              Category <SortIcon field="category" />
            </th>
            <th
              onClick={() => handleSort('quantity')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              Quantity <SortIcon field="quantity" />
            </th>
            <th
              onClick={() => handleSort('unit_price')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              Price <SortIcon field="unit_price" />
            </th>
            <th
              onClick={() => handleSort('status')}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            >
              Status <SortIcon field="status" />
            </th>
            {(canModify || canDelete) && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedItems.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                {item.description && (
                  <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.sku}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.quantity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(Number(item.unit_price))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(item.status)}
              </td>
              {(canModify || canDelete) && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {canModify && (
                    <Link
                      href={`/inventory/${item.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      disabled={deletingId === item.id}
                      className="text-red-600 hover:text-red-900 inline-flex items-center disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {deletingId === item.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
