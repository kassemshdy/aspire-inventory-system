'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database.types'
import { Shield, UserCheck, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface UserWithEmail extends UserProfile {
  email?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    checkPermissions()
    fetchUsers()
  }, [])

  const checkPermissions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    setUserRole(profile.role)
  }

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get auth users to fetch emails
      const { data: { users: authUsers } } = await supabase.auth.admin.listUsers()

      const usersWithEmails = profiles?.map(profile => ({
        ...profile,
        email: authUsers?.find(u => u.id === profile.id)?.email,
      })) || []

      setUsers(usersWithEmails)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'admin' | 'manager' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (error: any) {
      alert('Error updating role: ' + error.message)
    }
  }

  const getRoleBadge = (role: string) => {
    const configs = {
      admin: { icon: Shield, color: 'bg-purple-100 text-purple-800', label: 'Admin' },
      manager: { icon: UserCheck, color: 'bg-blue-100 text-blue-800', label: 'Manager' },
      viewer: { icon: Eye, color: 'bg-gray-100 text-gray-800', label: 'Viewer' },
    }

    const config = configs[role as keyof typeof configs]
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </span>
    )
  }

  if (userRole !== 'admin') {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">
          Manage user roles and permissions
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> New users can be created via the Supabase dashboard.
          Use this page to manage their roles and permissions.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-purple-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Admin</h3>
              <p className="text-sm text-gray-600">
                Full access: Create, read, update, and delete inventory items. Manage users and their roles.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <UserCheck className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Manager</h3>
              <p className="text-sm text-gray-600">
                Can create, read, and update inventory items. Cannot delete items or manage users.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <Eye className="h-5 w-5 text-gray-600 mt-0.5 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Viewer</h3>
              <p className="text-sm text-gray-600">
                Read-only access. Can view inventory items but cannot make any changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
