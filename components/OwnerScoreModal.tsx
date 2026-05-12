'use client'

import { useEffect } from 'react'
import { type OwnerScores, type OwnerDimension, founderDependencyLabel, watermarkStrengthLabel } from '@/lib/ownerIndex'

interface OwnerScoreModalProps {
  ownerScores: OwnerScores
  prevOwnerScores?: OwnerScores | null
  onClose: () => void
}

const H = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontWeight: '700',
    color: '#334a69',
    fontSize: '13px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: '6px',
    marginTop: '20px',
  }}>
    {children}
  </p>
)

const Body = ({ children }: { children: React.ReactNode }) => (
  <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.7', marginBottom: '4px' }}>
    {children}
  </p>
)

function fdNarrative(score: number): string {
  if (score >= 7) return "Your business runs on you. Most of what makes it work hasn't been encoded outside your head and habits. This isn't a flaw - it's how every founder-led business starts. The next chapter is the extraction work."
  if (score >= 4) return "Your business runs partly on systems and partly on you. There's real progress here, and there's real work left. The next chapter is about identifying which remaining dependencies actually matter."
  return "You've built a business that doesn't need you running through every part of it. The fundamental work of extraction is done. The next chapter is about what you do with that freedom."
}

function watermarkNarrative(score: number): string {
  if (score >= 7) return "There's something about your business that competitors can't copy - a way of seeing, a set of standards, a feel that customers come for. This is your terroir. Naming it explicitly is what lets you decide what happens to it."
  if (score >= 4) return "Your watermark is forming. Customers and team can sense something distinctive but you may not have named it yet. Articulate it before extraction efforts erode what they're trying to scale."
  return "The watermark is faint. The business hasn't yet differentiated its taste in a way that's irreducibly yours. This is a question about distinctiveness, not extraction - and it sets the ceiling on what the business is worth without you in it."
}

function dimensionNarrative(dim: OwnerDimension): string {
  const narratives: Record<string, Record<string, string>> = {
    process: {
      high: "Your business runs on your habits. The way you start the week, check quality, handle escalations - these are the operating system, and you are the documentation. Without you, the machine stops. The work here is to convert your unconscious competence into transferable process.",
      moderate: "Some of your processes have been encoded; many haven't. You've made it through the first wave of systematisation but your habits are still load-bearing in places that matter. The work is to identify which remaining habits are systems in disguise.",
      low: "Your business runs on documented systems, not your personal habits. You've done the work most founders avoid. The risk now is complacency - systems atrophy without maintenance.",
    },
    information: {
      high: "What you know about this business lives mostly in your head. Client preferences, pricing logic, the why-we-do-it-this-way decisions - none of it is written down. Every day you don't externalise it, the dependency compounds. The work is to make the invisible visible.",
      moderate: "Some of what you know is documented; much isn't. The team has access to processes but not to the context that makes those processes work. The work is to write down what you've never been asked to explain.",
      low: "Your knowledge has been externalised - your team can access what you know. The risk now is that fresh tacit knowledge keeps accumulating in your head faster than it gets out.",
    },
    decision: {
      high: "Decisions queue up at your desk. Your team waits before acting on anything non-routine, and the cost of waiting outweighs the cost of letting them get it 80% right. Decision dependency is often the bottleneck founders don't see - they see themselves as decisive, not as the choke point. The work is to raise the average.",
      moderate: "Your team makes some decisions independently but escalates the ones that matter. The line between check with the founder and just decide is unclear, and the default is to wait. The work is to clarify decision rights.",
      low: "Your team makes decisions at the right altitude. They escalate what should be escalated and resolve what should be resolved. The risk is that your high standards get diluted as the team scales - protect the standards while keeping the decision speed.",
    },
    energy: {
      high: "Your week is full of low-value work that drains energy without creating proportional value. Admin, chasing, operational noise - the things you've added because they made sense at the time but no longer earn the cost of your attention. The work is subtraction.",
      moderate: "You've subtracted some of the noise but the calendar still drifts toward filling itself. Each new commitment makes sense in isolation; in aggregate, you're crowded out of the work that matters. The work is to keep cutting.",
      low: "Your week reflects deliberate choices about where your energy goes. You've cut the low-value work and protected the work only you can do. The risk is drift - busy seasons add commitments that don't get pruned in the quieter ones.",
    },
    taste: {
      high: "You have a clear watermark. There's something about how you see the world, the standards you hold, the relationships you've built - that customers come for. Competitors can copy the product but not the experience. The work here isn't to extract this. It's to name it explicitly so you can decide what happens to it.",
      moderate: "There's a watermark forming. Customers and team can sense something distinctive but you may not have named it yet. The danger is that what's irreducibly you gets diluted in the rush to systematise everything else. Articulate the watermark before extraction efforts erode what they're trying to scale.",
      low: "The watermark is faint. The business doesn't yet have a distinctive signature beyond competence - competitors could copy the experience as well as the product. This is a question about whether the business has differentiated its taste yet, and it sets the ceiling on what the business is worth without you in it.",
    },
  }

  const band = dim.isProtect
    ? (dim.score >= 7 ? 'high' : dim.score >= 4 ? 'moderate' : 'low')
    : (dim.score >= 7 ? 'high' : dim.score >= 4 ? 'moderate' : 'low')

  return narratives[dim.key]?.[band] ?? ''
}

export default function OwnerScoreModal({ ownerScores, prevOwnerScores, onClose }: OwnerScoreModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const { founderDependencyScore, watermarkStrength, dimensions } = ownerScores

  // Biggest extraction priority - highest dependency score among non-Taste dimensions
  const extractionDims = dimensions.filter(d => !d.isProtect)
  const biggestPriority = extractionDims.reduce((a, b) => a.score > b.score ? a : b)

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(26, 26, 26, 0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 200,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201,
        width: '90%',
        maxWidth: '560px',
        maxHeight: '82vh',
        overflowY: 'auto',
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        padding: '32px 32px 36px',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '6px' }}>
              Your Map Decoded
            </p>
            <h2 style={{ fontFamily: 'var(--font-libre)', fontSize: '26px', fontWeight: '700', color: '#334a69', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              What Your Score Reveals
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9CA3AF', flexShrink: 0, marginLeft: '16px', marginTop: '2px' }}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ width: '32px', height: '2px', background: 'linear-gradient(90deg, #334a69, #2A7B7B)', borderRadius: '999px', marginBottom: '20px', opacity: 0.5 }} />

        {/* Founder Dependency Score */}
        <H>Founder Dependency Score - {founderDependencyScore.toFixed(1)}/10 - {founderDependencyLabel(founderDependencyScore)}</H>
        <Body>{fdNarrative(founderDependencyScore)}</Body>

        {/* Watermark Strength */}
        <H>Watermark Strength - {watermarkStrength.toFixed(1)}/10 - {watermarkStrengthLabel(watermarkStrength)}</H>
        <Body>{watermarkNarrative(watermarkStrength)}</Body>

        {/* Path */}
        <H>Your Path - Owner-Operator</H>
        <Body>This map reflects how dependent your business is on you, and what makes it irreducibly yours. The first four dimensions are about what can be extracted. The fifth is about what must be protected. Together they tell you what work is ahead and what stays yours regardless.</Body>

        {/* Five dimensions */}
        <H>Your Five Dependencies</H>
        {dimensions.map(dim => (
          <div key={dim.key} style={{ marginBottom: '14px' }}>
            <p style={{ fontWeight: '700', color: dim.isProtect ? '#2A7B7B' : '#334a69', fontSize: '13px', marginBottom: '3px' }}>
              {dim.label} - {dim.levelLabel}
            </p>
            <Body>{dimensionNarrative(dim)}</Body>
          </div>
        ))}

        {/* Biggest extraction priority */}
        <H>Your Biggest Extraction Priority</H>
        <Body>
          <strong style={{ color: '#334a69' }}>{biggestPriority.label}</strong> is your highest dependency score ({biggestPriority.score.toFixed(1)}/10) - that's where your business is most vulnerable to your absence. Not just for sale, but for any leverage you want to create. The work you do here will ripple across the others. Start with {biggestPriority.pillars.join(' and ')}.
        </Body>

        {/* Watermark reflection */}
        <H>Your Watermark Reflection</H>
        <Body>After extracting everything that can be systematised, what remains is your watermark. Three questions worth sitting with:</Body>
        <Body>- What would customers miss most if you left?</Body>
        <Body>- What do you do that you've never been able to teach someone else?</Body>
        <Body>- If your business were a wine, what's the terroir - and what's just the label?</Body>

        {/* Shift (returning users) */}
        {prevOwnerScores && (
          <>
            <H>What Shifted Since Last Time</H>
            <Body>
              Your Founder Dependency Score moved from <strong style={{ color: '#334a69' }}>{prevOwnerScores.founderDependencyScore.toFixed(1)}/10</strong> to <strong style={{ color: '#334a69' }}>{founderDependencyScore.toFixed(1)}/10</strong> ({founderDependencyScore >= prevOwnerScores.founderDependencyScore ? '+' : ''}{(founderDependencyScore - prevOwnerScores.founderDependencyScore).toFixed(1)}).{' '}
              Your Watermark Strength moved from <strong style={{ color: '#2A7B7B' }}>{prevOwnerScores.watermarkStrength.toFixed(1)}/10</strong> to <strong style={{ color: '#2A7B7B' }}>{watermarkStrength.toFixed(1)}/10</strong>.{' '}
              {dimensions.map(dim => {
                const prev = prevOwnerScores.dimensions.find(d => d.key === dim.key)
                if (!prev) return null
                const diff = dim.score - prev.score
                if (Math.abs(diff) < 0.5) return null
                return `${dim.label} shifted by ${diff > 0 ? '+' : ''}${diff.toFixed(1)}.`
              }).filter(Boolean).join(' ')}
            </Body>
          </>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            marginTop: '28px',
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'var(--font-inter)',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          Got it
        </button>
      </div>
    </>
  )
}
