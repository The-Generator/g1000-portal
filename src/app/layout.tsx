import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import DevModeIndicator from '@/components/DevModeIndicator';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'G1000 Portal - Connecting Students with Real-World Projects',
  description: 'The G1000 Portal connects Babson AI Innovators Bootcamp alumni with small business owners for real-world AI and automation projects.',
  keywords: ['G1000', 'Babson', 'AI', 'Bootcamp', 'Projects', 'Students', 'Business'],
  authors: [{ name: 'Generator Team' }],
  creator: 'Generator Team',
  publisher: 'Generator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'G1000 Portal',
    description: 'Connecting Babson Students with Real-World AI Projects',
    siteName: 'G1000 Portal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'G1000 Portal',
    description: 'Connecting Babson Students with Real-World AI Projects',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification if needed
    // google: 'google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#006744" />
      </head>
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#006744',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <DevModeIndicator />
      </body>
    </html>
  );
} 