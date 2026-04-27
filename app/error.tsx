'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5F3EE',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.14em',
        color: '#1a1a1a',
        textTransform: 'uppercase',
        marginBottom: '16px',
      }}>
        The Reinventor&apos;s Mindset™
      </p>
      <p style={{
        fontFamily: 'var(--font-libre)',
        fontSize: '22px',
        color: '#334a69',
        marginBottom: '12px',
      }}>
        Something went wrong
      </p>
      <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '8px', lineHeight: '1.6', maxWidth: '320px' }}>
        {error?.message || 'An unexpected error occurred.'}
      </p>
      {error?.digest && (
        <p style={{ fontSize: '11px', color: '#D1D5DB', marginBottom: '24px', fontFamily: 'monospace' }}>
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        style={{
          padding: '12px 32px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'var(--font-inter)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(51, 74, 105, 0.35)',
        }}
      >
        Try again
      </button>
    </main>
  )
}
