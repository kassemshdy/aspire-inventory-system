import { getUserProfile } from '@/lib/auth/helpers'
import { redirect } from 'next/navigation'
import { InventoryForm } from '@/components/inventory-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewInventoryPage() {
  const profile = await getUserProfile()

  // Only admins and managers can create items
  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    redirect('/inventory')
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
        <h1 className="text-3xl font-bold text-gray-900">Add New Item</h1>
        <p className="mt-2 text-gray-600">
          Create a new inventory item
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <InventoryForm mode="create" />
      </div>
    </div>
  )
}
