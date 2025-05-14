'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-white text-lg font-bold">Admin Dashboard</span>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    href="/admin"
                    className="text-white hover:bg-primary-500 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/doctors"
                    className="text-primary-100 hover:bg-primary-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Doctors
                  </Link>
                  <Link
                    href="/admin/receptionists"
                    className="text-primary-100 hover:bg-primary-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Receptionists
                  </Link>
                  <Link
                    href="/admin/appointments"
                    className="text-primary-100 hover:bg-primary-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Appointments
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button
                  onClick={() => {
                    // Add logout functionality
                  }}
                  className="text-primary-100 hover:bg-primary-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
} 