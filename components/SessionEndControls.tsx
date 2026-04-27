'use client'

import { useEffect, useRef, useState } from 'react'

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
    if (window.confirm('End this session and save your progress?')) {
      saveSession()
    }
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
        {saving ? 'Saving…' : 'End session'}
      </button>
    </div>
  )
}
