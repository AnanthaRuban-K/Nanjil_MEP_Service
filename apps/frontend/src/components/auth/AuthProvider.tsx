'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import React from 'react'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#3b82f6',
          borderRadius: '12px',
        },
        elements: {
          formButtonPrimary:
            'bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors',
          card: 'shadow-lg border-0',
          headerTitle: 'text-xl font-bold text-gray-800',
          headerSubtitle: 'text-gray-600',
          formFieldLabel: 'text-sm font-medium text-gray-700',
          formFieldInput: 'border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500',
          footerActionLink: 'text-blue-600 hover:text-blue-800 font-medium',
        },
      }}
      localization={{
        signIn: {
          start: {
            title: 'உள்நுழை / Sign In',
            subtitle: 'நாஞ்சில் MEP Services-க்கு வரவேற்கிறோம்',
          },
        },
        signUp: {
          start: {
            title: 'பதிவு செய் / Sign Up',
            subtitle: 'புதிய கணக்கை உருவாக்கவும்',
          },
        },
      }}
    >
      {children}
    </ClerkProvider>
  )
}