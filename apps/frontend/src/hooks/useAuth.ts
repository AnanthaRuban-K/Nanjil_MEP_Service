'use client'
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from './use-toast'

export interface AuthUser {
  id: string
  email: string | null
  name: string | null
  phone: string | null
  role: 'customer' | 'admin'
  language: 'ta' | 'en'
  isVerified: boolean
}

export const useAuth = () => {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerkAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(!isLoaded)

  useEffect(() => {
    setIsLoading(!isLoaded)
  }, [isLoaded])

  // Check if user is admin
  const isAdmin = (): boolean => {
    if (!user) return false
    return user.unsafeMetadata?.role === 'admin'
  }

  // Check if user is customer  
  const isCustomer = (): boolean => {
    if (!user) return false
    return !user.unsafeMetadata?.role || user.unsafeMetadata?.role === 'customer'
  }

  // Require authentication - redirect to login if not authenticated
  const requireAuth = (redirectTo?: string): boolean => {
    if (isLoading) return false
    
    if (!isSignedIn) {
      const currentPath = window.location.pathname
      const redirect = redirectTo || currentPath
      // Updated to use Clerk's sign-in page
      router.push(`/sign-in?redirect_url=${encodeURIComponent(redirect)}`)
      return false
    }
    return true
  }

  // Require admin access
  const requireAdmin = (): boolean => {
    if (!requireAuth()) return false
    
    if (!isAdmin()) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Admin access required / நிர்வாக அனுமதி தேவை"
      })
      router.push('/admin/login') // Redirect to admin login instead
      return false
    }
    return true
  }

  // Get formatted user data
  const getUser = (): AuthUser | null => {
    if (!user) return null

    return {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress || null,
      name: user.fullName || user.firstName || null,
      phone: user.primaryPhoneNumber?.phoneNumber || null,
      role: (user.unsafeMetadata?.role as 'customer' | 'admin') || 'customer',
      language: (user.unsafeMetadata?.language as 'ta' | 'en') || 'ta',
      isVerified: user.hasVerifiedEmailAddress || user.hasVerifiedPhoneNumber
    }
  }

  // Update user metadata
  const updateUserMetadata = async (metadata: {
    role?: 'customer' | 'admin'
    language?: 'ta' | 'en'
    phone?: string
    address?: string
  }) => {
    if (!user) return false

    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          ...metadata
        }
      })
      
      await user.reload()
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully / உங்கள் சுயவிவரம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது"
      })
      
      return true
    } catch (error) {
      console.error('Error updating user metadata:', error)
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Failed to update profile / சுயவிவரம் புதுப்பிக்க முடியவில்லை"
      })
      return false
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await signOut()
      router.push('/')
      toast({
        title: "Logged Out",
        description: "Logged out successfully / வெற்றிகரமாக வெளியேறினீர்கள்"
      })
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Logout failed / வெளியேற முடியவில்லை"
      })
    }
  }

  // Navigate to appropriate dashboard
  const goToDashboard = () => {
    if (isAdmin()) {
      router.push('/admin/dashboard')
    } else {
      router.push('/bookings')
    }
  }

  return {
    // User state
    user: getUser(),
    clerkUser: user,
    isLoading,
    isSignedIn: isSignedIn || false,
    
    // Role checks
    isAdmin,
    isCustomer,
    
    // Auth actions
    requireAuth,
    requireAdmin,
    logout,
    updateUserMetadata,
    goToDashboard
  }
}