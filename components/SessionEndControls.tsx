'use client'

import { useEffect, useRef, useState } from 'react'
import { type ActionPlan, formatPlanDate, downloadActionPlanPDF } from '@/lib/actionPlanUtils'

interface SessionEndControlsProps {
  messages: { role: string; content: string }[]
  onSessionSaved: () => void
  detectedContext?: string | null
}

const SAVE_TIMEOUT_MS = 15_000

export default function SessionEndControls({ messages, onSessionSaved, detectedContext }: SessionEndControlsProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [limitWarning, setLimitWarning] = useState<{ oldest: ActionPlan } | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const warningRef = useRef<NodeJS.Timeout | null>(null)
  const savedRef = useRef(false) // for beforeunload guard

  async function saveSession(auto = false) {
    if (saving || savedRef.current) return

    // Skip if no real conversation happened
    if (messages.filter(m => m.role === 'user').length === 0) {
      onSessionSaved()
      return
    }

    setSaving(true)
    setError(null)
    setShowWarning(false)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), SAVE_TIMEOUT_MS)

    try {
      const res = await fetch('/api/session-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context_detected: detectedContext ?? null }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) throw new Error('Failed to save')

      savedRef.current = true
      setSaved(true)
      onSessionSaved()
    } catch (err: any) {
      clearTimeout(timeoutId)

      if (err.name === 'AbortError') {
        setError('Save timed out. Please try again.')
      } else if (auto) {
        setError('Auto-save failed. Please end the session manually.')
      } else {
        setError('Session could not be saved. Please try again.')
      }
      setSaving(false)
    }
  }

  function handleEndSession() {
    if (saving || savedRef.current) return
    if (messages.filter(m => m.role === 'user').length === 0) {
      saveSession()
      return
    }
    // Check if user already has 3 action plans before confirming save
    fetch('/api/action-plans')
      .then(r => r.json())
      .then(({ plans }) => {
        if (Array.isArray(plans) && plans.length >= 3) {
          // Oldest is last in the desc-sorted array
          const oldest: ActionPlan = plans[plans.length - 1]
          setLimitWarning({ oldest })
        } else {
          if (window.confirm('Save your action plan and end this session?')) {
            saveSession()
          }
        }
      })
      .catch(() => {
        // Fetch failed — proceed with normal confirm
        if (window.confirm('Save your action plan and end this session?')) {
          saveSession()
        }
      })
  }

  function resetTimer() {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    setShowWarning(false)

    warningRef.current = setTimeout(() => setShowWarning(true), 9 * 60 * 1000)
    timerRef.current = setTimeout(() => saveSession(true), 10 * 60 * 1000)
  }

  // Reset inactivity timer whenever messages change
  useEffect(() => {
    if (messages.length > 0) resetTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
    }
  }, [messages])

  // Auto-save when user navigates away / closes tab
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (savedRef.current || messages.filter(m => m.role === 'user').length === 0) return
      // Trigger best-effort save (beacon API - works even as page unloads)
      try {
        navigator.sendBeacon(
          '/api/session-summary',
          new Blob([JSON.stringify({ messages, context_detected: detectedContext ?? null })], { type: 'application/json' })
        )
      } catch {}
      // Show browser's native "leave page?" dialog
      e.preventDefault()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [messages])

  if (saved) {
    return (
      <div className="anim-fade" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '7px',
        padding: '6px 0',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2A7B7B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#2A7B7B',
          fontFamily: 'var(--font-inter)',
          letterSpacing: '0.01em',
        }}>
          Session saved
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>

      {/* Inactivity warning */}
      {showWarning && (
        <div className="anim-fade" style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#FEFCE8',
          border: '1px solid #FDE68A',
          borderRadius: '10px',
          padding: '10px 16px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#92400E', fontSize: '13px', fontWeight: '500' }}>
            Your session will auto-save in 1 minute due to inactivity.
          </p>
        </div>
      )}

      {/* Error banner with retry */}
      {error && (
        <div className="anim-fade" style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '10px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <p style={{ color: '#DC2626', fontSize: '13px' }}>{error}</p>
          <button
            onClick={() => saveSession()}
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
            Retry
          </button>
        </div>
      )}

      {/* End session button */}
      <button
        onClick={handleEndSession}
        disabled={saving}
        style={{
          padding: '12px 32px',
          borderRadius: '10px',
          backgroundColor: 'transparent',
          color: saving ? '#9CA3AF' : '#334a69',
          fontSize: '13px',
          fontWeight: '600',
          fontFamily: 'var(--font-inter)',
          border: saving ? '1.5px solid #D1D5DB' : '1.5px solid #334a69',
          cursor: saving ? 'not-allowed' : 'pointer',
          letterSpacing: '0.01em',
          transition: 'all 0.15s',
        }}
      >
        {saving ? 'Saving…' : 'Save Action Plan'}
      </button>

      {/* Plan limit warning overlay */}
      {limitWarning && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.42)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
            width: '100%',
            maxWidth: '440px',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #F0EDE8' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-libre)',
                  fontSize: '17px',
                  fontWeight: '700',
                  color: '#334a69',
                }}>
                  Plan limit reached
                </h3>
              </div>
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                lineHeight: '1.6',
                fontFamily: 'var(--font-inter)',
              }}>
                You have 3 saved action plans. Saving this session will delete your oldest plan:
              </p>
              <div style={{
                marginTop: '12px',
                backgroundColor: '#F5F3EE',
                borderRadius: '10px',
                padding: '12px 16px',
              }}>
                <p style={{
                  fontSize: '11px',
                  color: '#9CA3AF',
                  fontFamily: 'var(--font-inter)',
                  marginBottom: '3px',
                }}>
                  {formatPlanDate(limitWarning.oldest.created_at)}
                </p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#334a69',
                  fontFamily: 'var(--font-libre)',
                }}>
                  {limitWarning.oldest.framework_explored ?? 'Session Plan'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => { downloadActionPlanPDF(limitWarning.oldest); setLimitWarning(null); saveSession() }}
                style={{
                  width: '100%',
                  padding: '11px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'var(--font-inter)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(51, 74, 105, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  letterSpacing: '0.01em',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download PDF &amp; save session
              </button>
              <button
                onClick={() => { setLimitWarning(null); saveSession() }}
                style={{
                  width: '100%',
                  padding: '11px 20px',
                  borderRadius: '10px',
                  background: 'transparent',
                  color: '#334a69',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'var(--font-inter)',
                  border: '1.5px solid #334a69',
                  cursor: 'pointer',
                  letterSpacing: '0.01em',
                }}
              >
                Continue without downloading
              </button>
              <button
                onClick={() => setLimitWarning(null)}
                style={{
                  width: '100%',
                  padding: '9px 20px',
                  borderRadius: '10px',
                  background: 'transparent',
                  color: '#9CA3AF',
                  fontSize: '13px',
                  fontWeight: '500',
                  fontFamily: 'var(--font-inter)',
                  border: '1px solid #E2DDD6',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
