'use client'

import { type OwnerScores, type OwnerDimension } from '@/lib/ownerIndex'

function fdsSubtext(score: number): string {
  if (score >= 6.7) return 'High dependency - the business is you'
  if (score >= 3.4) return 'Moderate dependency - room to extract'
  return 'Highly extractable - lower means more extractable'
}

function watermarkSubtext(score: number): string {
  if (score >= 6.7) return 'Defined watermark - higher means more distinctive'
  if (score >= 3.4) return 'Emerging watermark - clarity building'
  return 'Undefined watermark - hard to separate you from the business'
}

interface FounderDependencyMapProps {
  ownerScores: OwnerScores
  prevOwnerScores?: OwnerScores | null
  onWhatDoesThisMean: () => void
}

function ScoreBar({ score, isProtect }: { score: number; isProtect: boolean }) {
  const pct = (score / 10) * 100
  const barColor = isProtect
    ? '#2A7B7B'
    : score >= 6.7 ? '#C84B31' : score >= 3.4 ? '#C17D10' : '#2A7B7B'

  return (
    <div style={{
      width: '100%',
      height: '6px',
      backgroundColor: '#F0EDE8',
      borderRadius: '999px',
      overflow: 'hidden',
      marginTop: '8px',
    }}>
      <div style={{
        width: `${pct}%`,
        height: '100%',
        backgroundColor: barColor,
        borderRadius: '999px',
        transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

function DeltaArrow({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.1) return null
  const up = delta > 0
  return (
    <span style={{
      fontSize: '11px',
      fontWeight: '700',
      color: up ? '#2A7B7B' : '#C84B31',
      marginLeft: '6px',
    }}>
      {up ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}
    </span>
  )
}

export default function FounderDependencyMap({ ownerScores, prevOwnerScores, onWhatDoesThisMean }: FounderDependencyMapProps) {
  const { founderDependencyScore, watermarkStrength, dimensions } = ownerScores

  const prevFDS = prevOwnerScores?.founderDependencyScore ?? null
  const prevWS = prevOwnerScores?.watermarkStrength ?? null

  return (
    <div style={{
      width: '100%',
      maxWidth: '640px',
      margin: '0 auto',
      padding: '0 0 32px',
    }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{
          fontSize: '10px',
          fontWeight: '700',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#9CA3AF',
          fontFamily: 'var(--font-inter)',
          marginBottom: '6px',
        }}>
          Your current map
        </p>
        <h2 style={{
          fontFamily: 'var(--font-libre)',
          fontSize: '26px',
          fontWeight: '700',
          color: '#334a69',
          letterSpacing: '-0.3px',
          lineHeight: 1.2,
          marginBottom: '4px',
        }}>
          Founder Dependency Map
        </h2>
        <div style={{
          width: '32px',
          height: '2px',
          background: 'linear-gradient(90deg, #334a69, #2A7B7B)',
          borderRadius: '999px',
          opacity: 0.5,
        }} />
      </div>

      {/* Headline metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {/* Founder Dependency Score */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2DDD6',
          borderRadius: '14px',
          padding: '16px 18px',
        }}>
          <p style={{
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#9CA3AF',
            fontFamily: 'var(--font-inter)',
            marginBottom: '8px',
          }}>
            Founder Dependency Score
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-libre)',
              fontSize: '32px',
              fontWeight: '700',
              color: '#334a69',
              lineHeight: 1,
            }}>
              {founderDependencyScore.toFixed(1)}
            </span>
            <span style={{ fontSize: '14px', color: '#9CA3AF', fontFamily: 'var(--font-inter)' }}>/10</span>
            {prevFDS !== null && <DeltaArrow delta={founderDependencyScore - prevFDS} />}
          </div>
          <p style={{
            fontSize: '11px',
            color: '#6B7280',
            fontFamily: 'var(--font-inter)',
            marginTop: '6px',
            lineHeight: '1.5',
          }}>
            {fdsSubtext(founderDependencyScore)}
          </p>
        </div>

        {/* Watermark Strength */}
        <div style={{
          backgroundColor: '#F0F7F7',
          border: '1px solid #B2D8D8',
          borderRadius: '14px',
          padding: '16px 18px',
        }}>
          <p style={{
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#2A7B7B',
            fontFamily: 'var(--font-inter)',
            marginBottom: '8px',
          }}>
            Watermark Strength
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-libre)',
              fontSize: '32px',
              fontWeight: '700',
              color: '#2A7B7B',
              lineHeight: 1,
            }}>
              {watermarkStrength.toFixed(1)}
            </span>
            <span style={{ fontSize: '14px', color: '#5B9E9E', fontFamily: 'var(--font-inter)' }}>/10</span>
            {prevWS !== null && <DeltaArrow delta={watermarkStrength - prevWS} />}
          </div>
          <p style={{
            fontSize: '11px',
            color: '#2A7B7B',
            fontFamily: 'var(--font-inter)',
            marginTop: '6px',
            lineHeight: '1.5',
          }}>
            {watermarkSubtext(watermarkStrength)}
          </p>
        </div>
      </div>

      {/* Dimension cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {dimensions.map((dim: OwnerDimension) => (
          <div
            key={dim.key}
            style={{
              backgroundColor: dim.isProtect ? '#F0F7F7' : '#FFFFFF',
              border: `1px solid ${dim.isProtect ? '#B2D8D8' : '#E2DDD6'}`,
              borderRadius: '12px',
              padding: '14px 16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: dim.isProtect ? '#2A7B7B' : '#334a69',
                  fontFamily: 'var(--font-inter)',
                  marginBottom: '2px',
                }}>
                  {dim.label}
                </p>
                <p style={{
                  fontSize: '11px',
                  color: dim.isProtect ? '#2A7B7B' : '#9CA3AF',
                  fontFamily: 'var(--font-inter)',
                }}>
                  {dim.pillars.join(' · ')}
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                <span style={{
                  fontFamily: 'var(--font-libre)',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: dim.isProtect ? '#2A7B7B' : '#334a69',
                }}>
                  {dim.score.toFixed(1)}
                </span>
                <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '2px' }}>/10</span>
                <p style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: dim.isProtect ? '#2A7B7B' :
                    dim.score >= 6.7 ? '#C84B31' :
                    dim.score >= 3.4 ? '#C17D10' : '#2A7B7B',
                  fontFamily: 'var(--font-inter)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginTop: '2px',
                }}>
                  {dim.levelLabel}
                </p>
              </div>
            </div>
            <ScoreBar score={dim.score} isProtect={dim.isProtect} />
          </div>
        ))}
      </div>

      {/* What does this mean button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        <button
          onClick={onWhatDoesThisMean}
          style={{
            padding: '7px 20px',
            borderRadius: '999px',
            background: 'transparent',
            border: '1px solid #D1D5DB',
            color: '#9CA3AF',
            fontSize: '12px',
            fontWeight: '500',
            fontFamily: 'var(--font-inter)',
            cursor: 'pointer',
            letterSpacing: '0.02em',
            transition: 'all 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.color = '#334a69'; e.currentTarget.style.borderColor = '#334a69' }}
          onMouseOut={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = '#D1D5DB' }}
        >
          What does this mean?
        </button>
      </div>
    </div>
  )
}
