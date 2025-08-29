'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../hooks/useAuth'
import { SignIn } from '@clerk/nextjs'
import { Shield, AlertCircle, Loader, ArrowLeft, LogIn } from 'lucide-react'

const AdminLogin: React.FC = () => {
  const router = useRouter()
  const { user, isLoading, isSignedIn, isAdmin, logout } = useAuth()
  const [isCheckingAccess, setIsCheckingAccess] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [error, setError] = useState('')
  const [showLoginForm, setShowLoginForm] = useState(false)

  // Check if user has admin access
  const checkAdminAccess = async () => {
    if (!user) return false
    
    // Check if user has admin role in metadata
    if (user.role === 'admin') {
      return true
    }
    
    // Additional check: verify with backend if needed
    try {
      const response = await fetch('/api/admin/verify-access', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      })
      
      if (response.ok) {
        const { isAdmin } = await response.json()
        return isAdmin
      }
    } catch (error) {
      console.error('Admin verification error:', error)
    }
    
    return false
  }

  // Handle admin access verification
  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!isLoading && isSignedIn && user) {
        setIsCheckingAccess(true)
        
        const hasAccess = await checkAdminAccess()
        
        if (hasAccess) {
          // User has admin access, redirect to dashboard
          router.push('/admin/dashboard')
        } else {
          // User doesn't have admin access
          setAccessDenied(true)
          setError('Access denied. Admin privileges required.')
        }
        
        setIsCheckingAccess(false)
      } else if (!isLoading && !isSignedIn) {
        // User is not signed in, show login form
        setShowLoginForm(true)
      }
    }

    if (!isLoading) {
      verifyAdminAccess()
    }
  }, [isSignedIn, isLoading, user, router])

  // Loading state
  if (isLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Loader className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isLoading ? 'Loading...' : 'Verifying Access...'}
          </h2>
          <p className="text-gray-600">
            {isLoading ? 'Please wait...' : 'Checking admin privileges'}
          </p>
        </div>
      </div>
    )
  }

  // Access denied state - but allow switching accounts
  if (accessDenied && isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h1>
          <p className="text-red-600 mb-2">அணுகல் மறுக்கப்பட்டது</p>
          
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>

          <div className="text-gray-600 mb-6">
            <p className="mb-2">You are signed in as:</p>
            <p className="font-medium text-gray-800">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              This account does not have administrator privileges.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={async () => {
                await logout()
                setAccessDenied(false)
                setShowLoginForm(true)
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign in with Different Account</span>
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Return to Home</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Contact system administrator for access • நிர்வாகியை தொடர்பு கொள்ளவும்
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show sign-in form when not signed in or when explicitly requested
  if (!isSignedIn || showLoginForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              நிர்வாக உள்நுழைவு
            </h1>
            <p className="text-gray-600">Admin Portal Access</p>
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mt-4 text-sm">
              <p className="font-medium">Please sign in with your administrator account</p>
              <p className="text-xs mt-1">Use your regular email/password - admin access is determined by your account role</p>
            </div>
          </div>

          {/* Fallback Login Button if SignIn component fails */}
          <div className="mb-6">
            <div className="text-center">
              <button
                onClick={() => router.push('/sign-in?redirect_url=' + encodeURIComponent('/admin/login'))}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 mb-4"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In to Admin Portal</span>
              </button>
              
              <p className="text-sm text-gray-500 mb-4">
                Don't have an account? 
                <button
                  onClick={() => router.push('/sign-up')}
                  className="text-blue-600 hover:text-blue-800 ml-1"
                >
                  Sign up first
                </button>
              </p>
            </div>

            {/* Try to render Clerk SignIn component */}
            <div style={{ minHeight: '400px' }}>
              <SignIn
  appearance={{
    elements: {
      rootBox: "w-full",
      card: "shadow-none border-0 p-0",
      headerTitle: "hidden",
      headerSubtitle: "hidden",
      socialButtonsBlockButton: "bg-gray-50 border border-gray-300 hover:bg-gray-100",
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors",
      formFieldInput: "border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      formFieldLabel: "text-sm font-medium text-gray-700 mb-2",
      footerActionLink: "text-blue-600 hover:text-blue-800 font-medium",
    }
  }}
  afterSignInUrl="/admin/login"
  signUpUrl="/sign-up"
/>

            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-4">
              Authorized personnel only • அங்கீகரிக்கப்பட்ட பணியாளர்கள் மட்டும்
            </p>
            <button
              onClick={() => router.push('/')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center space-x-1 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="bg-gray-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Shield className="w-10 h-10 text-gray-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Initializing...
        </h2>
        <p className="text-gray-600">
          Please wait while we set up the admin portal
        </p>
      </div>
    </div>
  )
}

export default AdminLogin