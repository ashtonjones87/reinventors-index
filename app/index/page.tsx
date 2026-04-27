import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  getLatestSummary,
  getLastTwoDiagnostics,
} from '@/lib/supabase/queries'
import CompanionClient from '@/components/CompanionClient'
import { isEmailAllowed } from '@/lib/allowlist'

export default async function CompanionPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Belt-and-braces check: if a signed-in user somehow isn't on the allowlist, sign them out.
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
  if (!isEmailAllowed(email)) {
    redirect('/sign-in')
  }

  let latestSummary = null
  let diagnostics: any[] = []
  let loadError = false

  try {
    const results = await Promise.all([
      getLatestSummary(userId),
      getLastTwoDiagnostics(userId),
    ])
    latestSummary = results[0]
    diagnostics = results[1]
  } catch (err) {
    console.error('Failed to load user data:', err)
    loadError = true
  }

  if (loadError) {
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
        <div style={{
          width: '40px',
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
        <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '28px', lineHeight: '1.6' }}>
          We couldn&apos;t load your data. Please refresh the page to try again.
        </p>
        <a
          href="/index"
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
          Refresh
        </a>
      </main>
    )
  }

  const hasCompletedDiagnostic = diagnostics.length > 0
  const isReturningUser = !!latestSummary
  const currentRadar = diagnostics[0] ?? null
  const previousRadar = diagnostics[1] ?? null

  return (
    <main style={{ minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
      <CompanionClient
        hasCompletedDiagnostic={hasCompletedDiagnostic}
        isReturningUser={isReturningUser}
        latestSummary={latestSummary}
        currentRadar={currentRadar}
        previousRadar={previousRadar}
      />
    </main>
  )
}
