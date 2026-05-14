export default function CompanionLoading() {
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
