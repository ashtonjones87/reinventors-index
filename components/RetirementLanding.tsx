// Retirement Index landing page - rendered when host is retirementindex.ai.
// No auth required. CTAs link out to reinventor.ai.
// All copy verbatim from the brief (June 2026).

export default function RetirementLanding() {
  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#F5F3EE',
      padding: '60px 24px 80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ maxWidth: '680px', width: '100%' }}>

        {/* Brand header - matches reinventor.ai pre-diagnostic style */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <p style={{
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.14em',
            color: '#1a1a1a',
            textTransform: 'uppercase',
            marginBottom: '12px',
            fontFamily: 'var(--font-inter)',
          }}>
            The Reinventor&apos;s Mindset&trade;
          </p>
          <h1 style={{
            fontFamily: 'var(--font-libre)',
            fontSize: '54px',
            fontWeight: '700',
            color: '#334a69',
            letterSpacing: '-1px',
            lineHeight: 1,
            marginBottom: '14px',
          }}>
            Index
          </h1>
          <div style={{
            width: '36px',
            height: '2px',
            background: 'linear-gradient(90deg, #334a69, #2A7B7B)',
            borderRadius: '999px',
            margin: '0 auto',
            opacity: 0.5,
          }} />
        </div>

        {/* Hook */}
        <h2 style={{
          fontFamily: 'var(--font-libre)',
          fontSize: '32px',
          fontWeight: '700',
          color: '#334a69',
          letterSpacing: '-0.4px',
          lineHeight: 1.25,
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          You&apos;ve been funding your retirement. But are you ready to live it?
        </h2>

        {/* Subheadline */}
        <p style={{
          fontSize: '17px',
          color: '#4B5563',
          lineHeight: 1.65,
          textAlign: 'center',
          fontFamily: 'var(--font-inter)',
          marginBottom: '40px',
          maxWidth: '560px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Retirement isn&apos;t a financial moment - it&apos;s an identity shift. Map how ready you are for the part no plan covers, in five minutes. Free.
        </p>

        {/* Positioning */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2DDD6',
          borderRadius: '14px',
          padding: '22px 26px',
          marginBottom: '20px',
        }}>
          <p style={{
            fontSize: '15px',
            color: '#374151',
            lineHeight: 1.7,
            fontFamily: 'var(--font-inter)',
            margin: 0,
          }}>
            The money question gets all the attention. The harder one is who you become when the role that defined you is gone. That&apos;s where most retirement planning stops - and where the Index begins.
          </p>
        </div>

        {/* Credibility line */}
        <p style={{
          fontSize: '13px',
          color: '#6B7280',
          lineHeight: 1.65,
          textAlign: 'center',
          fontFamily: 'var(--font-inter)',
          marginBottom: '40px',
          fontStyle: 'italic',
        }}>
          Built on The Reinventor&apos;s Mindset methodology grounded in psychometric research conducted with 300+ participants over two decades at Swinburne University of Technology, taught at the University of Sydney Business School and INSEAD LaunchPad.
        </p>

        {/* CTA row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}>
          {/* Primary CTA - left */}
          <a
            href="https://reinventor.ai"
            style={{
              display: 'inline-block',
              padding: '15px 32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: '600',
              fontFamily: 'var(--font-inter)',
              letterSpacing: '0.01em',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(51,74,105,0.4)',
            }}
          >
            Take the Index - free
          </a>

          {/* Quiet sign-in link - right */}
          <a
            href="https://reinventor.ai/sign-in"
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#9CA3AF',
              fontFamily: 'var(--font-inter)',
              textDecoration: 'none',
              padding: '6px 8px',
              letterSpacing: '0.01em',
            }}
          >
            Sign in
          </a>
        </div>

        {/* Footer */}
        <p style={{
          marginTop: '64px',
          fontSize: '12px',
          color: '#C4BFB8',
          fontFamily: 'var(--font-inter)',
          textAlign: 'center',
        }}>
          &copy; {new Date().getFullYear()} Ashton Jones. All rights reserved.
        </p>
      </div>
    </main>
  )
}
