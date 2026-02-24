'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Package, LayoutDashboard, Users, Search, BarChart3, Moon, Sun } from 'lucide-react'
import { UserRole } from '@/lib/types/database.types'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/lib/contexts/theme-context'

interface NavbarProps {
  userRole: UserRole | null
  userEmail: string | null
}

export function Navbar({ userRole, userEmail }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = async () => {
    try {
      const supabase = createClient()

      // Sign out using Supabase client
      await supabase.auth.signOut()

      // Clear all cookies by setting them to expire
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })

      // Clear all storage
      localStorage.clear()
      sessionStorage.clear()

      // Force a complete page reload to the login page
      // This ensures all state is cleared
      window.location.replace('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Force clear and redirect even on error
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace('/auth/login')
    }
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'viewer'] },
    { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'manager', 'viewer'] },
    { href: '/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'manager', 'viewer'] },
    { href: '/admin/users', label: 'Users', icon: Users, roles: ['admin'] },
  ]

  const filteredNavItems = navItems.filter(item =>
    !item.roles || (userRole && item.roles.includes(userRole))
  )

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Inventory</span>
            </Link>

            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {filteredNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <span className="text-gray-600 dark:text-gray-300">{userEmail}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                {userRole}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 shadow-sm rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="sm:hidden px-2 pt-2 pb-3 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="inline h-4 w-4 mr-2" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
