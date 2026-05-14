import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Libre_Baskerville } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-libre',
})

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const isOwnerIndex = headersList.get('x-is-owner-index') === '1'
  return {
    title: isOwnerIndex ? "The Owner's Index" : "The Reinventor's Mindset™ Index",
    description: 'AI coaching companion by Ashton Jones',
    icons: { icon: '/icon.png' },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#334a69',
          colorText: '#1a1a1a',
          colorBackground: '#F5F3EE',
          colorInputBackground: '#FFFFFF',
          borderRadius: '10px',
        },
      }}
    >
      <html lang="en" className={`${inter.variable} ${libreBaskerville.variable}`} suppressHydrationWarning>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
