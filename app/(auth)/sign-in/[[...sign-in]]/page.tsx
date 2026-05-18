'use client'

import { useEffect, useState } from 'react'
import { SignIn, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

const BrandHeader = ({ isOwnerIndex }: { isOwnerIndex: boolean }) => (
  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
    <p style={{
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.14em',
      color: '#1a1a1a',
      textTransform: 'uppercase',
      marginBottom: '10px',
    }}>
      {isOwnerIndex ? "The Owner's" : "The Reinventor's Mindset™"}
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
    {isOwnerIndex && (
      <p style={{
        fontSize: '11px',
        color: '#9CA3AF',
        fontFamily: 'var(--font-inter)',
        letterSpacing: '0.04em',
        marginTop: '10px',
        marginBottom: 0,
      }}>
        Powered by{' '}
        <a
          href="https://ironcovepartners.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#9CA3AF', textDecoration: 'underline', textUnderlineOffset: '2px' }}
        >
          Iron Cove Partners
        </a>
      </p>
    )}
  </div>
)

function readCookieBool(name: string): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some(c => c.trim().startsWith(name + '=1'))
}

export default function SignInPage() {
  const [isOwnerIndex, setIsOwnerIndex] = useState(() => readCookieBool('x_is_owner'))
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const h = window.location.hostname
    setIsOwnerIndex(h.includes('ownerindex') || h.includes('owner.reinventor'))
  }, [])

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/home')
    }
  }, [isLoaded, isSignedIn, router])

  if (isLoaded && isSignedIn) return null

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
        <BrandHeader isOwnerIndex={isOwnerIndex} />

        <div className="anim-fade" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <SignIn forceRedirectUrl="/home" />
        </div>
      </div>
    </main>
  )
}
