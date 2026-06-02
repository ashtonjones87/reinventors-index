// Retirement Index landing page - rendered when host is retirementindex.ai.
// No auth required. CTAs link out to reinventor.ai.
// All copy verbatim from the brief (June 2026).

export default function RetirementLanding() {
  return (
    <main style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-end',
      backgroundImage: "url('/retirement-index.jpeg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      // Subtle sharpening filter to counteract JPEG compression artifacts
      filter: 'contrast(1.08) saturate(1.05)',
    }}>

      {/* Dark gradient overlay - fades from near-black at the bottom to transparent at top */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(10,20,35,0.90) 0%, rgba(10,20,35,0.55) 35%, rgba(10,20,35,0.0) 100%)',
        zIndex: 1,
        // Remove the filter inheritance from parent
        filter: 'none',
      }} />

      {/* Content sits above the overlay */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '1200px',
        padding: '72px 64px',
        filter: 'none',
      }}>

        {/* Label */}
        <p style={{
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.85)',
          textTransform: 'uppercase',
          marginBottom: '18px',
          fontFamily: 'var(--font-inter)',
        }}>
          The Reinventor&apos;s Mindset&trade;
        </p>

        {/* Headline — forced 2 lines via <br /> */}
        <h1 style={{
          fontFamily: 'var(--font-libre)',
          fontSize: 'clamp(36px, 4.2vw, 62px)',
          fontWeight: '400',
          color: '#ffffff',
          lineHeight: 1.12,
          letterSpacing: '-0.5px',
          marginBottom: '24px',
          whiteSpace: 'nowrap',
        }}>
          You&apos;ve been funding your retirement.<br />
          But are you ready to live it?
        </h1>

        {/* Subheadline */}
        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.80)',
          lineHeight: 1.6,
          fontFamily: 'var(--font-inter)',
          marginBottom: '40px',
          maxWidth: '680px',
        }}>
          Retirement isn&apos;t a financial moment - it&apos;s an identity shift. Map how ready you are in five minutes. Free.
        </p>

        {/* CTA row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          <a
            href="https://reinventor.ai/sign-up"
            style={{
              display: 'inline-block',
              padding: '14px 28px',
              borderRadius: '6px',
              background: '#ffffff',
              color: '#1a2d4a',
              fontSize: '15px',
              fontWeight: '700',
              fontFamily: 'var(--font-inter)',
              letterSpacing: '0.01em',
              textDecoration: 'none',
            }}
          >
            Take the Index - free
          </a>

          <a
            href="https://reinventor.ai/sign-in"
            style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#ffffff',
              fontFamily: 'var(--font-inter)',
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            Sign in
          </a>
        </div>

      </div>
    </main>
  )
}
