import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Privacy Policy - The Reinventor's Mindset™ Index",
}

const sections = [
  {
    number: '1',
    title: 'Who We Are',
    content: (
      <>
        <p>
          The Reinventor&apos;s Mindset Index (&ldquo;the Index&rdquo;) is operated by Ashton Jones. If you have questions about this policy or your data, contact us at{' '}
          <a href="mailto:ashton@ashtonjones.com.au" style={{ color: '#334a69', textDecoration: 'underline' }}>
            ashton@ashtonjones.com.au
          </a>.
        </p>
      </>
    ),
  },
  {
    number: '2',
    title: 'What We Collect',
    content: (
      <>
        <p style={{ marginBottom: '14px' }}>When you use the Index, we collect:</p>
        <ul>
          <li>Your name and email address (at sign-up)</li>
          <li>Your responses to the 16-question diagnostic and computed mindset scores</li>
          <li>Full chat session transcripts - the complete word-for-word conversation from every session</li>
          <li>Session summaries including framework explored, core tension, practical action and shift observed</li>
          <li>Usage data such as message count and session timestamps</li>
        </ul>
        <p style={{ marginTop: '14px' }}>
          We do not collect financial information, government identifiers or sensitive health data.
        </p>
      </>
    ),
  },
  {
    number: '3',
    title: 'Why We Collect It',
    content: (
      <>
        <p style={{ marginBottom: '14px' }}>We use your data for two purposes:</p>
        <p style={{ marginBottom: '10px' }}>
          <strong style={{ color: '#334a69' }}>Coaching.</strong> Your diagnostic results, conversation history and session summaries enable the Index to deliver personalised coaching and build on previous sessions.
        </p>
        <p style={{ marginBottom: '14px' }}>
          <strong style={{ color: '#334a69' }}>Research.</strong> Anonymised, aggregate insights derived from usage patterns and conversations are used for academic research, including peer-reviewed publications developed in collaboration with the University of Sydney Business School. All research data is fully anonymised - no information in any research output can be linked to you personally.
        </p>
        <p>
          Use of the Index constitutes consent to both purposes. If you do not wish your anonymised data to be used for research, please do not create an account.
        </p>
      </>
    ),
  },
  {
    number: '4',
    title: 'Where Your Data Is Stored',
    content: (
      <p>
        All personal data is stored in Supabase (PostgreSQL) hosted in Sydney, Australia (ap-southeast-2 region). Your data does not leave Australia for storage purposes.
      </p>
    ),
  },
  {
    number: '5',
    title: 'Who We Share Data With',
    content: (
      <>
        <p style={{ marginBottom: '14px' }}>
          We share data only with the following third-party processors, each of which has a signed Data Processing Agreement in place:
        </p>
        <ul>
          <li>
            <strong style={{ color: '#334a69' }}>Anthropic</strong> - processes your conversation data via the Claude API to power the Index&apos;s coaching responses. Anthropic does not use your data for model training.
          </li>
          <li>
            <strong style={{ color: '#334a69' }}>Clerk</strong> - processes your authentication data (name, email and session tokens) to manage sign-up and login.
          </li>
          <li>
            <strong style={{ color: '#334a69' }}>Supabase</strong> - hosts the database where your data is stored.
          </li>
        </ul>
        <p style={{ marginTop: '14px' }}>
          We do not sell, rent or otherwise share your personal data with any other third party.
        </p>
      </>
    ),
  },
  {
    number: '6',
    title: 'Your Rights',
    content: (
      <>
        <p style={{ marginBottom: '14px' }}>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Withdraw your consent at any time</li>
        </ul>
        <p style={{ marginTop: '14px', marginBottom: '10px' }}>
          To exercise any of these rights, contact us at{' '}
          <a href="mailto:ashton@ashtonjones.com.au" style={{ color: '#334a69', textDecoration: 'underline' }}>
            ashton@ashtonjones.com.au
          </a>. We will respond within 30 days.
        </p>
        <p style={{ marginBottom: '10px' }}>
          If you are located in the European Union, you also have the right to lodge a complaint with your local data protection authority.
        </p>
        <p style={{
          backgroundColor: '#F5F3EE',
          border: '1px solid #E2DDD6',
          borderRadius: '10px',
          padding: '14px 18px',
          fontSize: '13px',
          color: '#6B7280',
          lineHeight: '1.7',
          marginTop: '14px',
        }}>
          <strong style={{ color: '#334a69' }}>Note:</strong> withdrawing consent or requesting deletion will result in the removal of your account and all associated personal data. Anonymised research data that has already been derived from your sessions and cannot be linked to you will be retained.
        </p>
      </>
    ),
  },
  {
    number: '7',
    title: 'Data Retention',
    content: (
      <>
        <p style={{ marginBottom: '10px' }}>
          <strong style={{ color: '#334a69' }}>Active accounts:</strong> your data is retained for the duration of your active account.
        </p>
        <p style={{ marginBottom: '10px' }}>
          <strong style={{ color: '#334a69' }}>After deletion:</strong> when your account is deleted, all personal data including your name, email, diagnostic responses, chat transcripts and session summaries is permanently deleted within 30 days.
        </p>
        <p>
          <strong style={{ color: '#334a69' }}>Anonymised research data:</strong> aggregate insights that contain no personally identifiable information may be retained indefinitely.
        </p>
      </>
    ),
  },
  {
    number: '8',
    title: 'Consent',
    content: (
      <>
        <p style={{ marginBottom: '14px' }}>By creating an account, you consent to:</p>
        <ul>
          <li>The collection and use of your data as described in this policy</li>
          <li>The storage of your full session transcripts for coaching continuity</li>
          <li>The use of your anonymised data for academic research and peer-reviewed publication</li>
        </ul>
        <p style={{
          backgroundColor: '#F5F3EE',
          border: '1px solid #E2DDD6',
          borderRadius: '10px',
          padding: '14px 18px',
          fontSize: '13px',
          color: '#6B7280',
          lineHeight: '1.7',
          marginTop: '14px',
          marginBottom: '14px',
        }}>
          Consent for all three purposes is required to use the Index. These are not separable - the research purpose is a core part of the project.
        </p>
        <p>
          You may withdraw your consent at any time by contacting us at{' '}
          <a href="mailto:ashton@ashtonjones.com.au" style={{ color: '#334a69', textDecoration: 'underline' }}>
            ashton@ashtonjones.com.au
          </a>. Withdrawal of consent will result in the deletion of your account and all associated personal data.
        </p>
      </>
    ),
  },
  {
    number: '9',
    title: 'Security',
    content: (
      <>
        <p style={{ marginBottom: '14px' }}>We protect your data through:</p>
        <ul>
          <li>Row Level Security on all database tables - you can only access your own data</li>
          <li>All API keys stored server-side and never exposed to your browser</li>
          <li>JWT verification on every API request - unauthenticated requests are rejected</li>
          <li>Invite-only access controlled by the Index administrator</li>
        </ul>
      </>
    ),
  },
  {
    number: '10',
    title: 'Data Breach',
    content: (
      <p>
        In the event of a data breach that affects your personal data, we will notify you by email within 48 hours. Where required by GDPR, we will report the breach to the relevant supervisory authority within 72 hours.
      </p>
    ),
  },
  {
    number: '11',
    title: 'Changes to This Policy',
    content: (
      <p>
        We may update this policy from time to time. If we make material changes, we will notify you by email. The &ldquo;Last updated&rdquo; date at the top of this page will always reflect the most recent version.
      </p>
    ),
  },
  {
    number: '12',
    title: 'Contact',
    content: (
      <>
        <p style={{ marginBottom: '4px' }}>For any questions about this policy or to exercise your data rights:</p>
        <p style={{ marginTop: '12px' }}>
          <strong style={{ color: '#334a69' }}>Ashton Jones</strong>
        </p>
        <p>
          <a href="mailto:ashton@ashtonjones.com.au" style={{ color: '#334a69', textDecoration: 'underline' }}>
            ashton@ashtonjones.com.au
          </a>
        </p>
      </>
    ),
  },
]

export default function PrivacyPage() {
  const basePStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#4B5563',
    lineHeight: '1.75',
    fontFamily: 'var(--font-inter)',
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F3EE',
      padding: '60px 24px 96px',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Back link */}
        <Link href="/home" className="privacy-back-link" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: '#9CA3AF',
          textDecoration: 'none',
          marginBottom: '48px',
          fontFamily: 'var(--font-inter)',
          fontWeight: '500',
          transition: 'color 0.15s',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to the Index
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '52px' }}>
          <p style={{
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '0.14em',
            color: '#1a1a1a',
            textTransform: 'uppercase',
            marginBottom: '10px',
            fontFamily: 'var(--font-inter)',
          }}>
            The Reinventor&apos;s Mindset™ · reinventor.ai
          </p>
          <h1 style={{
            fontFamily: 'var(--font-libre)',
            fontSize: '38px',
            color: '#334a69',
            lineHeight: '1.2',
            letterSpacing: '-0.3px',
            marginBottom: '16px',
          }}>
            Privacy Policy
          </h1>
          <div style={{
            width: '36px',
            height: '2px',
            background: 'linear-gradient(90deg, #334a69, #2A7B7B)',
            borderRadius: '999px',
            marginBottom: '16px',
          }} />
          <p style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: 'var(--font-inter)' }}>
            Last updated: 6 April 2026
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {sections.map((section, i) => (
            <div
              key={section.number}
              style={{
                borderTop: '1px solid #E2DDD6',
                paddingTop: '32px',
                paddingBottom: '32px',
              }}
            >
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                {/* Number */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  fontFamily: 'var(--font-inter)',
                  letterSpacing: '0.06em',
                  minWidth: '20px',
                  paddingTop: '3px',
                  opacity: 0.8,
                }}>
                  {section.number.padStart(2, '0')}
                </span>

                <div style={{ flex: 1 }}>
                  {/* Section title */}
                  <h2 style={{
                    fontFamily: 'var(--font-libre)',
                    fontSize: '19px',
                    color: '#334a69',
                    marginBottom: '14px',
                    lineHeight: '1.3',
                  }}>
                    {section.title}
                  </h2>

                  {/* Section content */}
                  <div style={{ ...basePStyle }}>
                    <div className="privacy-content">
                      {section.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Bottom border */}
          <div style={{ borderTop: '1px solid #E2DDD6' }} />
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '52px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{ fontSize: '12px', color: '#C4BFB8', fontFamily: 'var(--font-inter)' }}>
            &copy; {new Date().getFullYear()} Ashton Jones. All rights reserved.
          </p>
          <Link href="/home" style={{
            fontSize: '12px',
            color: '#9CA3AF',
            textDecoration: 'none',
            fontFamily: 'var(--font-inter)',
          }}>
            Back to the Index
          </Link>
        </div>
      </div>
    </div>
  )
}
