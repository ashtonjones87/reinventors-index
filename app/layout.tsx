import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, Libre_Baskerville } from 'next/font/google'
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

export const metadata: Metadata = {
  title: "The Reinventor's Mindset™ Index",
  description: 'AI coaching companion by Ashton Jones',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      localization={{
        signIn: { start: { title: "Sign in to Reinventor's Mindset™ Index" } },
        signUp: { start: { title: "Sign up for Reinventor's Mindset™ Index" } },
      }}
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
