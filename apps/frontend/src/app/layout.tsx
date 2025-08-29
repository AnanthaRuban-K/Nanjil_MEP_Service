import { Inter } from 'next/font/google';
import { AuthProvider } from '../components/auth/AuthProvider';
import { QueryProvider } from './providers/query-provider';

import './global.css';
import { Toaster } from '../components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'நாஞ்சில் MEP சேவை - Nanjil MEP Services',
  description: 'நாகர்கோவிலில் மின்சாரம், குழாய் மற்றும் அவசர சேவைகள் - Electrical, Plumbing & Emergency Services in Nagercoil',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
        <AuthProvider>
          <QueryProvider>
            <main className="min-h-screen">
              {children}
            </main>
            <Toaster />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}