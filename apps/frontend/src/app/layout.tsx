// app/layout.tsx

import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryProvider } from './providers/query-provider';
import { Toaster } from '../components/ui/toaster';
import './global.css';   // ✅ relative path from app/


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'நாஞ்சில் MEP சேவை - Nanjil MEP Services',
  description: 'மின்சாரம் மற்றும் குழாய் சேவைகள் - Electrical and Plumbing Services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <html lang="ta" className="h-full">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700;900&family=Lato:wght@400;600;700;900&display=swap"
            rel="stylesheet"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <meta name="theme-color" content="#4f46e5" />
        </head>
        <body className={`${inter.className} h-full bg-gray-50 font-sans antialiased`}>
          <QueryProvider>
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}