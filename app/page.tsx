import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-6xl font-bold text-gray-900">
          Inventory Management System
        </h1>
        <p className="text-xl text-gray-600">
          AI-powered inventory management with role-based access control and real-time updates
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            View Demo
          </Link>
        </div>
        <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">AI-Powered Search</h3>
            <p className="text-gray-600 text-sm">Natural language queries with Claude API</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Real-Time Updates</h3>
            <p className="text-gray-600 text-sm">Live inventory sync across users</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Role-Based Access</h3>
            <p className="text-gray-600 text-sm">Admin, Manager, and Viewer permissions</p>
          </div>
        </div>
      </div>
    </main>
  )
}
