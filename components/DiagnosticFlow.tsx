'use client'

import { useState, useEffect } from 'react'
import { DIAGNOSTIC_STATEMENTS, DIMENSION_FRAMINGS } from '@/lib/diagnostic'

type DetectedContext = 'building' | 'leading' | 'transitioning' | null

interface DiagnosticFlowProps {
  detectedContext?: DetectedContext
  onComplete: (
    scores: any,
    readinessScore: number,
    rangeScores: {
      rangeDecisionMaking: number
      rangeBehaviour: number
      rangeLeadership: number
      rangeAwareness: number
    }
  ) => void
}

const ACKNOWLEDGEMENTS = [
  'Got it.',
  'Noted.',
  'Understood.',
  'Thanks for that.',
  'Okay.',
  'Good to know.',
]

const DIMENSIONS = [
  'decision_making',
  'behaviour',
  'leadership',
  'awareness',
] as const

function getAcknowledgement(index: number) {
  return ACKNOWLEDGEMENTS[index % ACKNOWLEDGEMENTS.length]
}

function getDimensionForIndex(index: number) {
  return DIMENSIONS[Math.floor(index / 4)]
}

function isFirstInDimension(index: number) {
  return index % 4 === 0
}

export default function DiagnosticFlow({ detectedContext, onComplete }: DiagnosticFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [showAck, setShowAck] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitAttempts, setSubmitAttempts] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Use detected context for framing; fall back to 'building' if unclear
  const context = detectedContext ?? 'building'

  // Restore progress from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('diagnostic_progress')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (
          typeof parsed?.savedIndex === 'number' &&
          Array.isArray(parsed?.savedAnswers) &&
          parsed.savedIndex >= 0 &&
          parsed.savedIndex <= 15 &&
          parsed.savedAnswers.length === parsed.savedIndex
        ) {
          setCurrentIndex(parsed.savedIndex)
          setAnswers(parsed.savedAnswers)
        } else {
          sessionStorage.removeItem('diagnostic_progress')
        }
      }
    } catch {
      sessionStorage.removeItem('diagnostic_progress')
    }
  }, [])

  // Persist progress to sessionStorage whenever it changes
  useEffect(() => {
    if (answers.length > 0) {
      try {
        sessionStorage.setItem('diagnostic_progress', JSON.stringify({
          savedIndex: currentIndex,
          savedAnswers: answers,
        }))
      } catch {
        // sessionStorage unavailable (private browsing quota exceeded) — ignore
      }
    }
  }, [currentIndex, answers])

  async function submitAnswers(finalAnswers: number[]) {
    setIsSubmitting(true)
    setError(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20_000)

    try {
      const res = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) throw new Error(`Server error ${res.status}`)

      const data = await res.json()
      sessionStorage.removeItem('diagnostic_progress')

      onComplete(data.scores, data.readinessScore, {
        rangeDecisionMaking: data.rangeDecisionMaking,
        rangeBehaviour: data.rangeBehaviour,
        rangeLeadership: data.rangeLeadership,
        rangeAwareness: data.rangeAwareness,
      })
    } catch (err: any) {
      clearTimeout(timeoutId)
      setSubmitAttempts(prev => prev + 1)
      setIsSubmitting(false)
      setShowAck(false)
      setSelectedRating(null)

      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.')
      } else {
        setError('Something went wrong saving your results. Please try again.')
      }
    }
  }

  async function handleAnswer(rating: number) {
    if (showAck) return
    setSelectedRating(rating)
    setShowAck(true)
    setError(null)

    const newAnswers = [...answers, rating]

    setTimeout(async () => {
      if (currentIndex === 15) {
        await submitAnswers(newAnswers)
      } else {
        setAnswers(newAnswers)
        setCurrentIndex(currentIndex + 1)
        setSelectedRating(null)
        setShowAck(false)
      }
    }, 800)
  }

  async function handleRetrySubmit() {
    if (isSubmitting || answers.length < 16) return
    await submitAnswers(answers)
  }

  const currentStatement = DIAGNOSTIC_STATEMENTS[currentIndex]
  const currentDimension = getDimensionForIndex(currentIndex)
  const showFraming = isFirstInDimension(currentIndex)
  const framingText = DIMENSION_FRAMINGS[context][currentDimension]
  const progress = Math.round((currentIndex / 16) * 100)

  return (
    <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>

      {/* Progress header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <p style={{
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.12em',
          color: '#334a69',
          textTransform: 'uppercase',
          opacity: 0.75,
        }}>
          Mindset Diagnostic
        </p>
        <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>
          {currentIndex} <span style={{ opacity: 0.5 }}>/ 16</span>
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '3px',
        backgroundColor: '#E8E4DE',
        borderRadius: '999px',
        marginBottom: '36px',
        overflow: 'hidden',
      }}>
        <div className="progress-fill" style={{ height: '3px', width: `${progress}%` }} />
      </div>

      {/* Dimension framing */}
      {showFraming && (
        <div
          className="framing-card"
          style={{
            marginBottom: '24px',
            padding: '18px 22px',
            backgroundColor: '#FFFFFF',
            borderLeft: '3px solid #2A7B7B',
            borderRadius: '0 12px 12px 0',
          }}
        >
          <p style={{
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '0.12em',
            color: '#2A7B7B',
            textTransform: 'uppercase',
            marginBottom: '7px',
          }}>
            {currentDimension.replace('_', ' ')}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#4B5563',
            fontStyle: 'italic',
            lineHeight: '1.65',
          }}>
            {framingText}
          </p>
        </div>
      )}

      {/* Statement card */}
      <div className="card" style={{ padding: '28px 28px', marginBottom: '28px' }}>
        <p style={{
          fontSize: '17px',
          color: '#1a1a1a',
          lineHeight: '1.65',
          fontFamily: 'var(--font-libre)',
          textAlign: 'center',
          letterSpacing: '-0.1px',
        }}>
          &ldquo;{currentStatement.statement}&rdquo;
        </p>
      </div>

      {/* Rating buttons */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '12px',
          paddingLeft: '4px',
          paddingRight: '4px',
        }}>
          <span style={{ fontSize: '11px', color: '#B0A99F', letterSpacing: '0.01em' }}>Strongly disagree</span>
          <span style={{ fontSize: '11px', color: '#B0A99F', letterSpacing: '0.01em' }}>Strongly agree</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              className="rating-btn"
              onClick={() => handleAnswer(rating)}
              disabled={showAck || isSubmitting}
              style={{
                flex: 1,
                minHeight: '52px',
                borderRadius: '50%',
                border: selectedRating === rating ? '2px solid #334a69' : '1.5px solid #E2DDD6',
                backgroundColor: selectedRating === rating ? '#334a69' : '#FFFFFF',
                color: selectedRating === rating ? '#FFFFFF' : '#334a69',
                fontSize: '15px',
                fontWeight: '600',
                cursor: showAck || isSubmitting ? 'not-allowed' : 'pointer',
                opacity: showAck && selectedRating !== rating ? 0.45 : 1,
                boxShadow: selectedRating === rating ? '0 3px 12px rgba(51,74,105,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      {/* Acknowledgement */}
      {showAck && !isSubmitting && !error && (
        <p className="anim-fade" style={{
          textAlign: 'center',
          color: '#2A7B7B',
          fontSize: '13px',
          fontWeight: '500',
          letterSpacing: '0.01em',
        }}>
          {getAcknowledgement(currentIndex)}
        </p>
      )}

      {/* Submitting */}
      {isSubmitting && (
        <p className="anim-fade" style={{
          textAlign: 'center',
          color: '#9CA3AF',
          fontSize: '13px',
          letterSpacing: '0.02em',
        }}>
          Mapping your mindset&nbsp;·&nbsp;·&nbsp;·
        </p>
      )}

      {/* Error with retry */}
      {error && !isSubmitting && (
        <div className="anim-fade" style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '10px',
          padding: '12px 16px',
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <p style={{ color: '#DC2626', fontSize: '13px' }}>{error}</p>
          <button
            onClick={handleRetrySubmit}
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#DC2626',
              background: 'none',
              border: '1px solid #FECACA',
              borderRadius: '7px',
              padding: '4px 12px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {submitAttempts > 1 ? 'Try again' : 'Retry'}
          </button>
        </div>
      )}
    </div>
  )
}
