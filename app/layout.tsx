import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, DM_Sans } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/lib/context'
import BackgroundFog from '@/components/BackgroundFog'
import { getSessionUser } from '@/lib/supabase-server'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const dmSans = DM_Sans({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Elite Action',
  description: 'Your gamified life dashboard',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Elite Action',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a08',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body style={{ fontFamily: 'var(--font-dm), sans-serif' }}>
        <BackgroundFog />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AppProvider userId={user?.id}>
            {children}
          </AppProvider>
        </div>
      </body>
    </html>
  )
}
