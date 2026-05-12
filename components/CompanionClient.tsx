'use client'

import { useState, useMemo } from 'react'
import { UserButton } from '@clerk/nextjs'
import DiagnosticFlow from './DiagnosticFlow'
import ChatWindow from './ChatWindow'
import RadarChart from './RadarChart'
import ScoreModal from './ScoreModal'
import ActionPlansDropdown from './ActionPlansDropdown'
import FounderDependencyMap from './FounderDependencyMap'
import OwnerScoreModal from './OwnerScoreModal'
import { computeOwnerScores } from '@/lib/ownerIndex'

type Phase = 'preDiagnostic' | 'diagnostic' | 'chat'

interface CompanionClientProps {
  hasCompletedDiagnostic: boolean
  isReturningUser: boolean
  latestSummary: any
  currentRadar: any
  previousRadar: any
  isOwnerIndex?: boolean
}

export default function CompanionClient({
  hasCompletedDiagnostic,
  isReturningUser,
  latestSummary,
  currentRadar,
  previousRadar,
  isOwnerIndex = false,
}: CompanionClientProps) {
  const [phase, setPhase] = useState<Phase>(hasCompletedDiagnostic ? 'chat' : 'preDiagnostic')
  const [isRetaking, setIsRetaking] = useState(false)
  const [showRadar, setShowRadar] = useState(false)
  const [radarScores, setRadarScores] = useState(currentRadar)
  const [prevRadarScores, setPrevRadarScores] = useState(previousRadar)
  const [readinessScore, setReadinessScore] = useState<number | null>(
    currentRadar?.readiness_score ?? null
  )
  const [rangeScores, setRangeScores] = useState<any>(
    currentRadar ? {
      rangeDecisionMaking: Math.abs(currentRadar.intuitive - currentRadar.analytical),
      rangeBehaviour: Math.abs(currentRadar.proactive - currentRadar.reactive),
      rangeLeadership: Math.abs(currentRadar.collaborative - currentRadar.directive),
      rangeAwareness: Math.abs(currentRadar.spiritual_purpose - currentRadar.cognitive),
    } : null
  )
  const [isViewingFromChat, setIsViewingFromChat] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [detectedContext, setDetectedContext] = useState<string | null>(null)
  const [preDiagnosticContext, setPreDiagnosticContext] = useState<string | null>(null)
  const [showScoreModal, setShowScoreModal] = useState(false)

  // Owner's Index computed scores
  const ownerScores = useMemo(() => (isOwnerIndex && radarScores) ? computeOwnerScores(radarScores) : null, [isOwnerIndex, radarScores])
  const prevOwnerScores = useMemo(() => (isOwnerIndex && prevRadarScores) ? computeOwnerScores(prevRadarScores) : null, [isOwnerIndex, prevRadarScores])

  function closeMenu() { setMenuOpen(false) }

  function handleDiagnosticReady(context: string | null, messages?: { role: string; content: string }[]) {
    setDetectedContext(context)
    if (messages && messages.length > 0) {
      // Format the conversation as a compact string for the system prompt
      const transcript = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Companion'}: ${m.content.replace(/\[CONTEXT:[^\]]+\]/gi, '').replace(/\[DIAGNOSTIC_READY\]/gi, '').trim()}`)
        .filter(line => !line.endsWith(': '))
        .join('\n')
      setPreDiagnosticContext(transcript)
    }
    setPhase('diagnostic')
  }

  function handleSkipToDiagnostic() {
    setDetectedContext(null)
    setPreDiagnosticContext(null)
    setPhase('diagnostic')
  }

  function handleDiagnosticComplete(scores: any, readiness: number, ranges: any) {
    setPrevRadarScores(radarScores)
    setRadarScores(scores)
    setReadinessScore(readiness)
    setRangeScores(ranges)
    setPhase('chat')
    setIsRetaking(false)
    setShowRadar(true)
  }

  function handleRetakeDiagnostic() {
    if (window.confirm(
      'Retake the diagnostic? Your previous results will be kept as a reference point to show how you have shifted.'
    )) {
      sessionStorage.removeItem('diagnostic_progress')
      setIsRetaking(true)
      setPhase('diagnostic')
      setShowRadar(false)
    }
  }

  // ── PRE-DIAGNOSTIC CHAT PHASE ────────────────────────────────
  if (phase === 'preDiagnostic') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', margin: 0, padding: 0, backgroundColor: '#F5F3EE', position: 'relative' }}>
        {/* Header */}
        <div
          className="app-header md-header"
          style={{
            padding: '0 28px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            position: 'relative',
            zIndex: 60,
          }}
        >
          <div style={{ display: ‘flex’, flexDirection: ‘column’, alignItems: ‘center’ }}>
            <p style={{
              fontSize: ‘10px’,
              fontWeight: ‘700’,
              letterSpacing: ‘0.14em’,
              color: ‘#1a1a1a’,
              textTransform: ‘uppercase’,
              marginBottom: ‘2px’,
            }}>
              {isOwnerIndex ? "The Owner’s" : "The Reinventor’s Mindset™"}
            </p>
            <p style={{
              fontFamily: ‘var(--font-libre)’,
              fontSize: ‘15px’,
              fontWeight: ‘700’,
              color: ‘#334a69’,
              lineHeight: 1,
            }}>
              Index
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleSkipToDiagnostic}
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#9CA3AF',
                background: 'none',
                border: '1px solid #D1D5DB',
                borderRadius: '999px',
                padding: '5px 14px',
                cursor: 'pointer',
                fontFamily: 'var(--font-inter)',
                letterSpacing: '0.01em',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.color = '#334a69'; e.currentTarget.style.borderColor = '#334a69' }}
              onMouseOut={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = '#D1D5DB' }}
            >
              Skip to diagnostic
            </button>
            <div className="phone-hide">
              <UserButton />
            </div>
          </div>
          <button
            className="mob-only"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#334a69" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <>
            <div onClick={closeMenu} style={{ position: 'absolute', inset: 0, top: '60px', backgroundColor: 'rgba(0,0,0,0.18)', zIndex: 40 }} />
            <div className="mob-only mobile-menu-panel" style={{ position: 'absolute', top: '60px', left: 0, right: 0, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2DDD6', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', zIndex: 50, flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center' }}>
                <UserButton />
              </div>
            </div>
          </>
        )}

        {/* Pre-diagnostic chat */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow
            radarScores={null}
            readinessScore={null}
            rangeScores={null}
            isReturningUser={isReturningUser}
            latestSummary={latestSummary}
            previousRadar={null}
            preDiagnostic={true}
            onDiagnosticReady={handleDiagnosticReady}
          />
        </div>
      </div>
    )
  }

  // ── DIAGNOSTIC FLOW PHASE ────────────────────────────────────
  if (phase === 'diagnostic') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F5F3EE',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '56px 24px 72px',
      }}>
        <div className="anim-up" style={{ width: '100%', maxWidth: '720px' }}>

          <h1 className="md-title sm-title" style={{
            fontFamily: 'var(--font-libre)',
            fontSize: '34px',
            fontWeight: '700',
            color: '#334a69',
            textAlign: 'center',
            marginBottom: '16px',
            letterSpacing: '-0.4px',
            lineHeight: '1.25',
          }}>
            {isRetaking
              ? "Let\u2019s see how you\u2019ve shifted."
              : "Good. Let\u2019s map where you are right now."}
          </h1>

          {!isRetaking && (
            <p style={{
              fontSize: '13px',
              fontStyle: 'italic',
              color: '#9CA3AF',
              textAlign: 'center',
              marginBottom: '12px',
              fontFamily: 'var(--font-inter)',
            }}>
              Most diagnostics tell you where you are, we tell you where you need to go.
            </p>
          )}

          <p className="md-subtitle" style={{
            fontSize: '15px',
            color: '#6B7280',
            textAlign: 'center',
            marginBottom: '52px',
            lineHeight: '1.65',
            maxWidth: '520px',
            margin: '0 auto 52px',
          }}>
            {isRetaking
              ? "Same 16 statements. Rate each one honestly based on where you are right now, not where you were last time."
              : "Rate each statement 1 to 5 based on how true it feels. Takes about five minutes. The conversation that follows goes deeper, set aside 15–20 minutes to get the most out of it."
            }
          </p>

          <DiagnosticFlow
            detectedContext={detectedContext as any}
            onComplete={handleDiagnosticComplete}
          />
        </div>
      </div>
    )
  }

  // ── POST-DIAGNOSTIC RADAR VIEW ──────────────────────────────
  // ── CHAT VIEW (+ radar overlay) ────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', margin: 0, padding: 0, backgroundColor: '#F5F3EE', position: 'relative' }}>

      {/* RADAR OVERLAY - rendered on top, chat stays mounted beneath */}
      {showRadar && radarScores && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 100,
          overflowY: 'scroll',
          backgroundColor: '#F5F3EE',
          WebkitOverflowScrolling: 'touch',
        }}>
          <div
            className="md-px sm-px"
            style={{
            maxWidth: '640px',
            margin: '0 auto',
            padding: '52px 24px 72px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Label */}
          <p className="anim-fade" style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.14em',
            color: '#1a1a1a',
            textTransform: 'uppercase',
            marginBottom: '10px',
            textAlign: 'center',
          }}>
            {isOwnerIndex ? "The Owner's Index" : 'Your Mindset Map'}
          </p>

          {/* Title */}
          <h1 className="anim-up md-title sm-title" style={{
            fontFamily: 'var(--font-libre)',
            fontSize: '36px',
            fontWeight: '700',
            color: '#334a69',
            textAlign: 'center',
            marginBottom: '40px',
            letterSpacing: '-0.4px',
            lineHeight: '1.2',
          }}>
            {isOwnerIndex
              ? (isViewingFromChat ? 'Your current map' : "Here's your map.")
              : (isViewingFromChat ? 'Your current radar' : "Here\u2019s your map.")}
          </h1>

          {/* Owner's Index path - Founder Dependency Map */}
          {isOwnerIndex && ownerScores ? (
            <div className="anim-up-delay-1" style={{ width: '100%' }}>
              <FounderDependencyMap
                ownerScores={ownerScores}
                prevOwnerScores={prevOwnerScores}
                onWhatDoesThisMean={() => setShowScoreModal(true)}
              />
            </div>
          ) : (
          <>

          {/* Readiness Score Card */}
          {readinessScore !== null && (
            <div className="score-card anim-up-delay-1" style={{
              padding: '24px 36px 20px',
              textAlign: 'center',
              marginBottom: '36px',
              width: '100%',
              maxWidth: '380px',
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.12em',
                color: '#334a69',
                textTransform: 'uppercase',
                marginBottom: '10px',
                opacity: 0.7,
              }}>
                Adaptive Range Score
              </p>
              <p style={{
                fontFamily: 'var(--font-libre)',
                fontSize: '60px',
                fontWeight: '700',
                color: '#334a69',
                lineHeight: 1,
                marginBottom: '4px',
                letterSpacing: '-1px',
              }}>
                {readinessScore}
                <span style={{ fontSize: '22px', color: '#9CA3AF', fontWeight: '400', letterSpacing: '0' }}> / 10</span>
              </p>
              {prevRadarScores?.readiness_score && (
                <p style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: readinessScore > prevRadarScores.readiness_score ? '#2A7B7B' : readinessScore < prevRadarScores.readiness_score ? '#C17D10' : '#9CA3AF',
                  marginTop: '10px',
                }}>
                  {readinessScore > prevRadarScores.readiness_score
                    ? `↑ +${(readinessScore - prevRadarScores.readiness_score).toFixed(1)} from last time`
                    : readinessScore < prevRadarScores.readiness_score
                    ? `↓ ${(readinessScore - prevRadarScores.readiness_score).toFixed(1)} from last time`
                    : 'No change from last time'}
                </p>
              )}
              <p style={{
                fontSize: '12px',
                color: '#9CA3AF',
                marginTop: '10px',
                lineHeight: '1.55',
              }}>
                Measures how fluidly you move between poles across all four dimensions. Higher means more adaptive.
              </p>
            </div>
          )}

          {/* Radar Chart */}
          <div className="anim-up-delay-2" style={{ width: '100%', maxWidth: '480px', marginBottom: '36px' }}>
            <RadarChart current={radarScores} previous={prevRadarScores ?? null} />
          </div>

          {/* Dimension Cards */}
          {rangeScores && rangeScores.rangeDecisionMaking !== undefined && (
            <div
              className="md-1col anim-up-delay-3"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                width: '100%',
                marginBottom: '40px',
              }}
            >
              {[
                { label: 'Decision Making', range: rangeScores.rangeDecisionMaking, poleA: 'Intuitive', poleB: 'Analytical', scoreA: radarScores.intuitive, scoreB: radarScores.analytical },
                { label: 'Behaviour', range: rangeScores.rangeBehaviour, poleA: 'Proactive', poleB: 'Reactive', scoreA: radarScores.proactive, scoreB: radarScores.reactive },
                { label: 'Leadership', range: rangeScores.rangeLeadership, poleA: 'Collaborative', poleB: 'Directive', scoreA: radarScores.collaborative, scoreB: radarScores.directive },
                { label: 'Awareness', range: rangeScores.rangeAwareness, poleA: 'Cognitive', poleB: 'Purpose', scoreA: radarScores.cognitive, scoreB: radarScores.spiritual_purpose },
              ].map((dim) => {
                const leansPole = dim.scoreA >= dim.scoreB ? dim.poleA : dim.poleB
                const underdevelopedPole = dim.scoreA <= dim.scoreB ? dim.poleA : dim.poleB
                const polarisationLabel = dim.range < 1.0
                  ? 'Balanced'
                  : dim.range <= 2.0
                  ? `Leans ${leansPole}`
                  : `Strongly ${leansPole}`
                const maxRange = Math.max(
                  rangeScores.rangeDecisionMaking,
                  rangeScores.rangeBehaviour,
                  rangeScores.rangeLeadership,
                  rangeScores.rangeAwareness
                )
                const isBiggest = dim.range === maxRange

                return (
                  <div key={dim.label} className={isBiggest ? 'card-amber' : 'card'} style={{ padding: '18px 20px' }}>
                    <p style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      letterSpacing: '0.12em',
                      color: isBiggest ? '#C17D10' : '#6B7280',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}>
                      {dim.label}
                    </p>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: isBiggest ? '#C17D10' : '#334a69',
                      marginBottom: '6px',
                      fontFamily: 'var(--font-libre)',
                    }}>
                      {polarisationLabel}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>
                      {dim.poleA}: {dim.scoreA.toFixed(1)} · {dim.poleB}: {dim.scoreB.toFixed(1)}
                    </p>
                    <p style={{ fontSize: '12px', fontWeight: isBiggest ? '600' : '400', color: isBiggest ? '#C17D10' : '#B5ADA3' }}>
                      {dim.range === 0
                        ? 'Polarisation: 0.0 - both poles equally developed'
                        : `Polarisation: ${dim.range.toFixed(1)} - your underdeveloped pole is ${underdevelopedPole}`}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Learn More */}
          {rangeScores && (
            <button
              onClick={() => setShowScoreModal(true)}
              className="anim-up-delay-4"
              style={{
                marginBottom: '20px',
                padding: '7px 20px',
                borderRadius: '999px',
                backgroundColor: 'transparent',
                color: '#9CA3AF',
                fontSize: '12px',
                fontWeight: '500',
                fontFamily: 'var(--font-inter)',
                border: '1px solid #D1D5DB',
                cursor: 'pointer',
                letterSpacing: '0.02em',
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.color = '#334a69'; e.currentTarget.style.borderColor = '#334a69' }}
              onMouseOut={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = '#D1D5DB' }}
            >
              What does this mean?
            </button>
          )}

          </> // end of Mindset path
          )}

          {/* Action Buttons */}
          <div className="anim-up-delay-4" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
            {isViewingFromChat ? (
              <>
                <button
                  onClick={() => { setShowRadar(false); setIsViewingFromChat(false) }}
                  style={{
                    padding: '14px 40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'var(--font-inter)',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(51, 74, 105, 0.4)',
                    letterSpacing: '0.01em',
                  }}
                >
                  Back to chat
                </button>
                <button
                  onClick={handleRetakeDiagnostic}
                  style={{
                    padding: '14px 32px',
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                    color: '#334a69',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'var(--font-inter)',
                    border: '1.5px solid #334a69',
                    cursor: 'pointer',
                    letterSpacing: '0.01em',
                    transition: 'all 0.15s',
                  }}
                >
                  Retake diagnostic
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowRadar(false)}
                  style={{
                    padding: '14px 40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'var(--font-inter)',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(51, 74, 105, 0.4)',
                    letterSpacing: '0.01em',
                  }}
                >
                  Start the conversation
                </button>
                <button
                  onClick={handleRetakeDiagnostic}
                  style={{
                    padding: '14px 32px',
                    borderRadius: '10px',
                    backgroundColor: 'transparent',
                    color: '#334a69',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'var(--font-inter)',
                    border: '1.5px solid #334a69',
                    cursor: 'pointer',
                    letterSpacing: '0.01em',
                    transition: 'all 0.15s',
                  }}
                >
                  Retake diagnostic
                </button>
              </>
            )}
          </div>

        </div>
      </div>
      )}

      {/* Score Modal - Mindset path */}
      {showScoreModal && !isOwnerIndex && radarScores && rangeScores && (
        <ScoreModal
          readinessScore={readinessScore ?? 0}
          radarScores={radarScores}
          rangeScores={rangeScores}
          detectedContext={detectedContext}
          prevRadarScores={prevRadarScores ?? null}
          onClose={() => setShowScoreModal(false)}
        />
      )}

      {/* Owner Score Modal - Owner's Index path */}
      {showScoreModal && isOwnerIndex && ownerScores && (
        <OwnerScoreModal
          ownerScores={ownerScores}
          prevOwnerScores={prevOwnerScores}
          onClose={() => setShowScoreModal(false)}
        />
      )}

      {/* Header */}
      <div
        className="app-header md-header"
        style={{
          padding: '0 28px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'relative',
          zIndex: 60,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '0.14em',
            color: '#1a1a1a',
            textTransform: 'uppercase',
            marginBottom: '2px',
          }}>
            {isOwnerIndex ? "The Owner's Index" : "The Reinventor's Mindset™"}
          </p>
          {!isOwnerIndex && (
            <p style={{
              fontFamily: 'var(--font-libre)',
              fontSize: '15px',
              fontWeight: '700',
              color: '#334a69',
              lineHeight: 1,
            }}>
              Index
            </p>
          )}
        </div>

        {/* Right controls - desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {readinessScore !== null && (
            <span className="phone-hide" style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#334a69',
              letterSpacing: '0.01em',
            }}>
              Adaptive Range Score&nbsp;·&nbsp;{readinessScore}<span style={{ color: '#9CA3AF', fontWeight: '400' }}>/10</span>
            </span>
          )}
          {radarScores && (
            <button
              className="phone-hide"
              onClick={() => { setShowRadar(true); setIsViewingFromChat(true) }}
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#334a69',
                border: '1.5px solid #334a69',
                background: 'transparent',
                padding: '5px 14px',
                borderRadius: '999px',
                cursor: 'pointer',
                fontFamily: 'var(--font-inter)',
              }}
            >
              View Radar
            </button>
          )}
          <div className="phone-hide">
            <ActionPlansDropdown />
          </div>
          <button
            className="phone-hide"
            onClick={handleRetakeDiagnostic}
            style={{
              fontSize: '12px',
              color: '#9CA3AF',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter)',
              transition: 'color 0.15s ease',
            }}
            onMouseOver={e => (e.currentTarget.style.color = '#334a69')}
            onMouseOut={e => (e.currentTarget.style.color = '#9CA3AF')}
          >
            Retake
          </button>
          <div className="phone-hide">
            <UserButton />
          </div>

          {/* Mobile hamburger */}
          <button
            className="mob-only"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
            }}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#334a69" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#334a69" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <>
          <div
            onClick={closeMenu}
            style={{
              position: 'absolute',
              inset: 0,
              top: '60px',
              backgroundColor: 'rgba(0,0,0,0.18)',
              zIndex: 40,
            }}
          />
          <div
            className="mob-only mobile-menu-panel"
            style={{
              position: 'absolute',
              top: '60px',
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #E2DDD6',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              zIndex: 50,
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Score */}
            {readinessScore !== null && (
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #F0EDE8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.12em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '3px' }}>
                    Adaptive Range Score
                    <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '400' }}> / 10</span>
                  </p>
                </div>
              </div>
            )}

            {/* View Radar */}
            {radarScores && (
              <button
                onClick={() => { setShowRadar(true); setIsViewingFromChat(true); closeMenu() }}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid #F0EDE8',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#334a69',
                  fontFamily: 'var(--font-inter)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                View Radar
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334a69" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}

            {/* Retake diagnostic */}
            <button
              onClick={() => { closeMenu(); handleRetakeDiagnostic() }}
              style={{
                width: '100%',
                padding: '16px 20px',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid #F0EDE8',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                color: '#334a69',
                fontFamily: 'var(--font-inter)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              Retake diagnostic
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334a69" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Action Plans */}
            <div style={{ borderBottom: '1px solid #F0EDE8' }}>
              <ActionPlansDropdown variant="menu-row" />
            </div>

            {/* Account */}
            <div style={{
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
            }}>
              <UserButton />
            </div>
          </div>
        </>
      )}

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          radarScores={radarScores}
          readinessScore={readinessScore}
          rangeScores={rangeScores}
          isReturningUser={isReturningUser}
          latestSummary={latestSummary}
          previousRadar={prevRadarScores}
          detectedContext={detectedContext}
          preDiagnosticContext={preDiagnosticContext}
        />
      </div>
    </div>
  )
}
