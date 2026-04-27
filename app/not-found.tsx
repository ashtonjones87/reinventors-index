import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#F5F3EE',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '32px',
        height: '2px',
        background: 'linear-gradient(90deg, #334a69, #2A7B7B)',
        borderRadius: '999px',
        margin: '0 auto 24px',
        opacity: 0.4,
      }} />
      <p style={{
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.14em',
        color: '#1a1a1a',
        textTransform: 'uppercase',
        marginBottom: '12px',
        fontFamily: 'var(--font-inter)',
      }}>
        The Reinventor&apos;s Mindset™
      </p>
      <h1 style={{
        fontFamily: 'var(--font-libre)',
        fontSize: '80px',
        fontWeight: '700',
        color: '#334a69',
        lineHeight: 1,
        marginBottom: '8px',
        letterSpacing: '-2px',
      }}>
        404
      </h1>
      <p style={{
        fontFamily: 'var(--font-libre)',
        fontSize: '22px',
        color: '#334a69',
        marginBottom: '12px',
      }}>
        Page not found
      </p>
      <p style={{
        fontSize: '14px',
        color: '#9CA3AF',
        marginBottom: '32px',
        lineHeight: '1.6',
        maxWidth: '320px',
        fontFamily: 'var(--font-inter)',
      }}>
        This page doesn&apos;t exist. Let&apos;s get you back to where you were.
      </p>
      <Link
        href="/home"
        style={{
          padding: '12px 32px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: '600',
          fontFamily: 'var(--font-inter)',
          textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(51, 74, 105, 0.35)',
        }}
      >
        Back to the Companion
      </Link>
    </main>
  )
}
