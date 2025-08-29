'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogOut, User, Settings, BarChart3, Users, Package, Calendar } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage?: string
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage = 'dashboard' }) => {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check admin authentication
  useEffect(() => {
    const checkAdminAuth = () => {
      const token = localStorage.getItem('admin-token')
      const userData = localStorage.getItem('admin-user')
      
      if (!token || !userData) {
        router.push('/admin/login')
        return
      }
      
      try {
        const user = JSON.parse(userData)
        setAdminUser(user)
        setIsLoading(false)
      } catch {
        localStorage.clear()
        router.push('/admin/login')
      }
    }
    
    checkAdminAuth()
  }, [router])

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('admin-token')
      localStorage.removeItem('admin-user')
      router.push('/')
    }
  }

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', name_ta: 'முகப்பு', icon: BarChart3, href: '/admin/dashboard' },
    { id: 'bookings', name: 'Bookings', name_ta: 'பதिவुकळ', icon: Calendar, href: '/admin/bookings' },
    { id: 'teams', name: 'Teams', name_ta: 'குழुक्कळ', icon: Users, href: '/admin/teams' },
    { id: 'inventory', name: 'Inventory', name_ta: 'பொருட्कळ', icon: Package, href: '/admin/inventory' },
    { id: 'reports', name: 'Reports', name_ta: 'அறिक्केकळ', icon: BarChart3, href: '/admin/reports' },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading admin panel...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold">Admin Panel</h1>
              <p className="text-sm text-gray-400">நிர्वाग பેનल</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium">{adminUser?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400">{adminUser?.role || 'Administrator'}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white shadow-sm px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 capitalize">
              {currentPage} {currentPage === 'dashboard' ? '/ முகப्पू' : ''}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AdminLayout