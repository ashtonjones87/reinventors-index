import { headers } from 'next/headers'

export default async function CompanionLoading() {
  const headersList = await headers()
  const isOwnerIndex = headersList.get('x-is-owner-index') === '1'

  return (
    <main style={{
      display: 'flex',
      minHeight: '100vh',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5F3EE',
      padding: '24px',
    }}>
      <div style={{ textAlign: 'center' }}>
        {/* Label */}
        <p style={{
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.14em',
          color: '#1a1a1a',
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}>
          {isOwnerIndex ? "The Owner's" : "The Reinventor’s Mindset™"}
        </p>

        {/* Big serif title */}
        <p style={{
          fontFamily: 'var(--font-libre), Georgia, serif',
          fontSize: '48px',
          fontWeight: '700',
          color: '#334a69',
          letterSpacing: '-1px',
          lineHeight: 1,
          marginBottom: '16px',
        }}>
          Index
        </p>

        {/* Gradient divider */}
        <div style={{
          width: '32px',
          height: '2px',
          background: 'linear-gradient(90deg, #334a69, #2A7B7B)',
          borderRadius: '999px',
          margin: '0 auto',
          opacity: 0.45,
        }} />
      </div>
    </main>
  )
}
