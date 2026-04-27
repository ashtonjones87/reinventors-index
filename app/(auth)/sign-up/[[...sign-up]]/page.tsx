'use client'

import { useEffect } from 'react'
import { SignUp, useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace('/home')
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded || isSignedIn) return null

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
        {/* Brand header */}
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
            margin: '0 auto 14px',
            opacity: 0.5,
          }} />
          <p style={{
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.1em',
            color: '#C17D10',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-inter)',
            marginBottom: '6px',
          }}>
            Restricted Access
          </p>
          <p style={{
            fontSize: '12px',
            color: '#9CA3AF',
            fontFamily: 'var(--font-inter)',
            lineHeight: '1.55',
          }}>
            Requires an <strong style={{ color: '#6B7280' }}>@insead.edu</strong> email address.
          </p>
        </div>

        {/* Clerk sign-up form */}
        <div className="anim-fade" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <SignUp forceRedirectUrl="/home" />
        </div>

        {/* Edge-case notice + sign-in link */}
        <div style={{
          marginTop: '24px',
          padding: '14px 16px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2DDD6',
          borderRadius: '10px',
          width: '100%',
        }}>
          <p style={{
            fontSize: '12px',
            color: '#9CA3AF',
            fontFamily: 'var(--font-inter)',
            lineHeight: '1.6',
            marginBottom: '12px',
          }}>
            If your account was created but you can&apos;t sign in, your email may not be eligible. Only <strong style={{ color: '#6B7280' }}>@insead.edu</strong> addresses and approved exceptions are granted access.
          </p>
          <a
            href="/sign-in"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#334a69',
              fontFamily: 'var(--font-inter)',
              textDecoration: 'none',
            }}
          >
            Already have an account? Sign in
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </a>
        </div>
      </div>
    </main>
  )
}
