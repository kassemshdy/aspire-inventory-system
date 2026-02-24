// @ts-nocheck
import { getUserProfile } from '@/lib/auth/helpers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { InventoryForm } from '@/components/inventory-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EditInventoryPage({ params }: { params: { id: string } }) {
  const profile = await getUserProfile()

  // Only admins and managers can edit items
  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    redirect('/inventory')
  }

  const supabase = await createServerSupabaseClient()
  const { data: item, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !item) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/inventory"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Inventory
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Item</h1>
        <p className="mt-2 text-gray-600">
          Update inventory item details
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <InventoryForm mode="edit" item={item} />
      </div>
    </div>
  )
}
