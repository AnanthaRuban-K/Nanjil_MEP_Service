'use client'
import React, { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  redirectTo
}) => {
  const { isLoading, isSignedIn, requireAuth, requireAdmin: checkAdmin } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (requireAdmin) {
        checkAdmin()
      } else {
        requireAuth(redirectTo)
      }
    }
  }, [isLoading, requireAdmin, requireAuth, checkAdmin, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">लोड हो रहा है... / Loading...</p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}