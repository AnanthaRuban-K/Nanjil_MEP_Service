// app/admin/dashboard/page.tsx
'use client'
import React from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import AdminDashboard from '../../../components/admin/AdminDashboard'

export default function AdminDashboardPage() {
  return (
    <AdminLayout currentPage="dashboard">
      <AdminDashboard />
    </AdminLayout>
  )
}

// You can also create it without the layout if AdminDashboard handles its own layout
// export default function AdminDashboardPage() {
//   return <AdminDashboard />
// }