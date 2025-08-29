'use client'
import React from 'react'
import AdminLayout from '../../../components/admin/AdminLayout'
import AdminDashboard from '../../../components/admin/AdminDashboard'

const AdminDashboardPage: React.FC = () => {
  return (
    <AdminLayout currentPage="dashboard">
      <AdminDashboard />
    </AdminLayout>
  )
}

export default AdminDashboardPage