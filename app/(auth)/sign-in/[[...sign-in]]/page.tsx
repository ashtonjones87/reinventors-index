'use client'

import { SignIn, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const BrandHeader = () => (
  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
    <p style={{
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.14em',
      color: '#1a1a1a',
      textTransform: 'uppercase',
      marginBottom: '10px',
    }}>
      The Reinventor&apos;s Mindset™
    </p>
    <h1 style={{
      fontFamily: 'var(--font-libre)',
      fontSize: '38px',
      fontWeight: '700',
      color: '#334a69',
      letterSpacing: '-0.8px',
      lineHeight: 1,
      marginBottom: '12px',
    }}>
      Index
    </h1>
    <div style={{
      width: '32px',
      height: '2px',
      background: 'linear-gradient(90deg, #334a69, #2A7B7B)',
      borderRadius: '999px',
      margin: '0 auto',
      opacity: 0.5,
    }} />
  </div>
)

export default function SignInPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  if (isSignedIn) {
    router.replace('/home')
    return null
  }

  // Show brand header while Clerk loads — prevents blank flash
  if (!isLoaded) {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F3EE',
        padding: '24px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <BrandHeader />
        </div>
      </main>
    )
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5F3EE',
      padding: '24px',
    }}>
      <div className="anim-up" style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <BrandHeader />

        <div className="anim-fade" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <SignIn forceRedirectUrl="/home" />
        </div>

        <p style={{ marginTop: '20px', fontSize: '12px', color: '#9CA3AF', fontFamily: 'var(--font-inter)' }}>
          New here?{' '}
          <a href="/sign-up" style={{ color: '#334a69', fontWeight: '600', textDecoration: 'none' }}>
            Create an account
          </a>
        </p>
      </div>
    </main>
  )
}
