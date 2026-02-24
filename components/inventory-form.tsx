// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database.types'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type InventoryInsert = Database['public']['Tables']['inventory_items']['Insert']

interface InventoryFormProps {
  item?: InventoryItem
  mode: 'create' | 'edit'
}

export function InventoryForm({ item, mode }: InventoryFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    quantity: item?.quantity?.toString() || '0',
    category: item?.category || '',
    sku: item?.sku || '',
    unit_price: item?.unit_price?.toString() || '0',
    status: item?.status || 'in_stock',
    low_stock_threshold: item?.low_stock_threshold?.toString() || '10',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required'

    const quantity = parseInt(formData.quantity)
    if (isNaN(quantity) || quantity < 0) {
      newErrors.quantity = 'Quantity must be a positive number'
    }

    const price = parseFloat(formData.unit_price)
    if (isNaN(price) || price < 0) {
      newErrors.unit_price = 'Price must be a positive number'
    }

    const threshold = parseInt(formData.low_stock_threshold)
    if (isNaN(threshold) || threshold < 0) {
      newErrors.low_stock_threshold = 'Threshold must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        quantity: parseInt(formData.quantity),
        category: formData.category.trim(),
        sku: formData.sku.trim(),
        unit_price: parseFloat(formData.unit_price),
        status: formData.status as any,
        low_stock_threshold: parseInt(formData.low_stock_threshold),
      }

      if (mode === 'create') {
        const { error } = await supabase
          .from('inventory_items')
          .insert({
            ...itemData,
            created_by: user.id,
          })

        if (error) throw error
      } else if (mode === 'edit' && item) {
        const { error } = await supabase
          .from('inventory_items')
          .update(itemData)
          .eq('id', item.id)

        if (error) throw error
      }

      router.push('/inventory')
      router.refresh()
    } catch (error: any) {
      if (error.code === '23505') {
        setErrors({ sku: 'SKU already exists' })
      } else {
        alert('Error saving item: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Name */}
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Item Name *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., MacBook Pro 16&quot;"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional description..."
          />
        </div>

        {/* SKU */}
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
            SKU *
          </label>
          <input
            type="text"
            name="sku"
            id="sku"
            value={formData.sku}
            onChange={handleChange}
            disabled={mode === 'edit'}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.sku ? 'border-red-300' : 'border-gray-300'
            } ${mode === 'edit' ? 'bg-gray-100' : ''}`}
            placeholder="e.g., ELEC-MBP16-001"
          />
          {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
          {mode === 'edit' && <p className="mt-1 text-sm text-gray-500">SKU cannot be changed</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <input
            type="text"
            name="category"
            id="category"
            value={formData.category}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.category ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="e.g., Electronics"
          />
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantity *
          </label>
          <input
            type="number"
            name="quantity"
            id="quantity"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.quantity ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
        </div>

        {/* Unit Price */}
        <div>
          <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700">
            Unit Price ($) *
          </label>
          <input
            type="number"
            name="unit_price"
            id="unit_price"
            min="0"
            step="0.01"
            value={formData.unit_price}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.unit_price ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.unit_price && <p className="mt-1 text-sm text-red-600">{errors.unit_price}</p>}
        </div>

        {/* Low Stock Threshold */}
        <div>
          <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-gray-700">
            Low Stock Threshold *
          </label>
          <input
            type="number"
            name="low_stock_threshold"
            id="low_stock_threshold"
            min="0"
            value={formData.low_stock_threshold}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.low_stock_threshold ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.low_stock_threshold && <p className="mt-1 text-sm text-red-600">{errors.low_stock_threshold}</p>}
          <p className="mt-1 text-sm text-gray-500">Alert when quantity falls below this number</p>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="ordered">Ordered</option>
            <option value="discontinued">Discontinued</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Note: Status auto-updates based on quantity unless set to Ordered or Discontinued
          </p>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Item' : 'Update Item'}
        </button>
      </div>
    </form>
  )
}
