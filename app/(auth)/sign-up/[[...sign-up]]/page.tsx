'use client'

import { useEffect, useState } from 'react'
import { SignUp, useAuth } from '@clerk/nextjs'
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

export default function SignUpPage() {
  const [consented, setConsented] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace('/home')
  }, [isLoaded, isSignedIn, router])

  if (isSignedIn) return null

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

        {/* Consent checkbox */}
        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '11px',
          cursor: 'pointer',
          marginBottom: '20px',
          padding: '16px 18px',
          backgroundColor: consented ? '#FFFBF3' : '#FFFFFF',
          border: consented ? '1.5px solid #C17D10' : '1.5px solid #E2DDD6',
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          width: '100%',
        }}>
          <div style={{ position: 'relative', flexShrink: 0, marginTop: '1px' }}>
            <input
              type="checkbox"
              checked={consented}
              onChange={e => {
                setConsented(e.target.checked)
                if (!e.target.checked) setShowForm(false)
              }}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
            />
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '5px',
              border: consented ? '2px solid #C17D10' : '2px solid #D1D5DB',
              backgroundColor: consented ? '#C17D10' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}>
              {consented && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <polyline points="1.5,6 4.5,9 10.5,3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <p style={{
            fontSize: '13px',
            color: '#4B5563',
            lineHeight: '1.65',
            fontFamily: 'var(--font-inter)',
            margin: 0,
            userSelect: 'none',
          }}>
            I agree to the{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: '#334a69', textDecoration: 'underline', fontWeight: '600' }}
            >
              Privacy Policy
            </a>
            . I understand that my session data will be stored to enable personalised coaching, and that anonymised data will be used for academic research. I confirm I am 18 years or older.
          </p>
        </label>

        {/* Clerk form - only rendered after consent + button click */}
        {showForm ? (
          <div className="anim-fade" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <SignUp forceRedirectUrl="/home" />
          </div>
        ) : (
          <button
            onClick={() => { if (consented) setShowForm(true) }}
            disabled={!consented}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              background: consented
                ? 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)'
                : '#E8E4DE',
              color: consented ? '#FFFFFF' : '#9CA3AF',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'var(--font-inter)',
              border: 'none',
              cursor: consented ? 'pointer' : 'not-allowed',
              letterSpacing: '0.02em',
              boxShadow: consented ? '0 4px 14px rgba(51, 74, 105, 0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Create your account
          </button>
        )}

        <p style={{ marginTop: '20px', fontSize: '12px', color: '#9CA3AF', fontFamily: 'var(--font-inter)' }}>
          Already have an account?{' '}
          <a href="/sign-in" style={{ color: '#334a69', fontWeight: '600', textDecoration: 'none' }}>
            Sign in
          </a>
        </p>
      </div>
    </main>
  )
}
