'use client'

import { useEffect, useRef, useState } from 'react'
import { type ActionPlan, formatPlanDate, downloadActionPlanPDF } from '@/lib/actionPlanUtils'

// Renders a line that may contain inline **bold** segments
function renderBoldLine(line: string): React.ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*)/)
  if (parts.length === 1) return line
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

export default function ActionPlansDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [plans, setPlans] = useState<ActionPlan[] | null>(null) // null = not yet fetched
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Silently pre-fetch plan count so the badge is populated on mount
  useEffect(() => {
    fetch('/api/action-plans')
      .then(r => r.json())
      .then(({ plans: fetched }) => { if (Array.isArray(fetched)) setPlans(fetched) })
      .catch(() => {})
  }, [])

  async function fetchPlans() {
    setLoading(true)
    try {
      const res = await fetch('/api/action-plans')
      const { plans: fetched } = await res.json()
      setPlans(fetched ?? [])
    } catch {
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  function handleToggle() {
    if (isOpen) {
      setIsOpen(false)
      return
    }
    // Position dropdown fixed below the button
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
    setIsOpen(true)
    // Always refresh when opening
    fetchPlans()
  }

  const planCount = plans?.length ?? 0

  return (
    <>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
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
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.15s',
          letterSpacing: '0.01em',
        }}
        onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(51,74,105,0.06)' }}
        onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        Action Plans
        {planCount > 0 && (
          <span style={{
            backgroundColor: '#334a69',
            color: '#fff',
            borderRadius: '999px',
            fontSize: '10px',
            fontWeight: '700',
            padding: '1px 6px',
            lineHeight: '1.5',
          }}>
            {planCount}
          </span>
        )}
      </button>

      {/* Dropdown panel — fixed positioned so it works in any container */}
      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            ...dropdownStyle,
            width: '300px',
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {/* Panel header */}
          <div style={{
            padding: '12px 16px 11px',
            borderBottom: '1px solid #F0EDE8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <p style={{
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '0.13em',
              textTransform: 'uppercase',
              color: '#9CA3AF',
              fontFamily: 'var(--font-inter)',
            }}>
              Saved Action Plans
            </p>
            <span style={{
              fontSize: '12px',
              color: planCount >= 3 ? '#D97706' : '#C4BFB8',
              fontFamily: 'var(--font-inter)',
              fontWeight: planCount >= 3 ? '600' : '400',
            }}>
              {planCount}/3
            </span>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px', fontFamily: 'var(--font-inter)' }}>
              Loading…
            </div>
          ) : !plans || plans.length === 0 ? (
            <div style={{ padding: '28px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: 'var(--font-inter)', lineHeight: '1.65' }}>
                No saved plans yet.
                <br />
                End a session to save your first.
              </p>
            </div>
          ) : (
            <div>
              {plans.map((plan, index) => {
                const isOldest = index === plans.length - 1
                const willBeReplaced = plans.length >= 3 && isOldest
                return (
                  <button
                    key={plan.id}
                    onClick={() => { setSelectedPlan(plan); setIsOpen(false) }}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      background: 'none',
                      border: 'none',
                      borderBottom: index < plans.length - 1 ? '1px solid #F0EDE8' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.1s',
                      display: 'block',
                    }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#FAFAF9')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <p style={{
                      fontSize: '11px',
                      color: '#9CA3AF',
                      fontFamily: 'var(--font-inter)',
                      marginBottom: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      {formatPlanDate(plan.created_at)}
                      {willBeReplaced && (
                        <span style={{ color: '#D97706', fontWeight: '600', fontSize: '10px' }}>
                          oldest
                        </span>
                      )}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: '#334a69',
                      fontFamily: 'var(--font-libre)',
                      marginBottom: '5px',
                      lineHeight: '1.3',
                    }}>
                      {plan.framework_explored ?? 'Session Plan'}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#9CA3AF',
                      fontFamily: 'var(--font-inter)',
                      lineHeight: '1.45',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {plan.practical_action}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Plan detail modal */}
      {selectedPlan && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setSelectedPlan(null) }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.42)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 10000,
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
            maxWidth: '560px',
            maxHeight: '88vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Modal header */}
            <div style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid #F0EDE8',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <p style={{
                  fontSize: '11px',
                  color: '#9CA3AF',
                  fontFamily: 'var(--font-inter)',
                  marginBottom: '5px',
                }}>
                  {formatPlanDate(selectedPlan.created_at)}
                  {selectedPlan.context_detected && (
                    <span> · {selectedPlan.context_detected.charAt(0).toUpperCase() + selectedPlan.context_detected.slice(1)}</span>
                  )}
                </p>
                <h2 style={{
                  fontFamily: 'var(--font-libre)',
                  fontSize: '21px',
                  fontWeight: '700',
                  color: '#334a69',
                  lineHeight: '1.3',
                }}>
                  {selectedPlan.framework_explored ?? 'Action Plan'}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#9CA3AF',
                  flexShrink: 0,
                  marginTop: '2px',
                  borderRadius: '6px',
                  transition: 'color 0.1s',
                }}
                onMouseOver={e => (e.currentTarget.style.color = '#334a69')}
                onMouseOut={e => (e.currentTarget.style.color = '#9CA3AF')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {selectedPlan.core_tension && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-inter)', marginBottom: '8px' }}>
                    Core Tension
                  </p>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', fontFamily: 'var(--font-inter)' }}>
                    {selectedPlan.core_tension}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  backgroundColor: '#F5F3EE',
                  borderLeft: '3px solid #334a69',
                  padding: '16px 20px',
                  borderRadius: '0 10px 10px 0',
                }}>
                  {selectedPlan.practical_action.split('\n').map((line, i) => {
                    const isLabel = /^your practical action/i.test(line)
                    return (
                      <p key={i} style={{
                        fontSize: isLabel ? '10px' : '14px',
                        fontWeight: isLabel ? '700' : '400',
                        letterSpacing: isLabel ? '0.14em' : '0',
                        textTransform: isLabel ? 'uppercase' : 'none',
                        color: '#1a1a1a',
                        fontFamily: 'var(--font-inter)',
                        lineHeight: '1.75',
                        marginBottom: line === '' ? '10px' : '1px',
                      }}>
                        {renderBoldLine(line)}
                      </p>
                    )
                  })}
                </div>
              </div>

              {selectedPlan.open_questions && (
                <div style={{ marginBottom: '24px' }}>
                  <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-inter)', marginBottom: '8px' }}>
                    Open Questions
                  </p>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', fontFamily: 'var(--font-inter)' }}>
                    {selectedPlan.open_questions}
                  </p>
                </div>
              )}

              {selectedPlan.shift_observed && (
                <div style={{ marginBottom: '8px' }}>
                  <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: 'var(--font-inter)', marginBottom: '8px' }}>
                    Shift Observed
                  </p>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', fontFamily: 'var(--font-inter)' }}>
                    {selectedPlan.shift_observed}
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{
              padding: '14px 24px 18px',
              borderTop: '1px solid #F0EDE8',
              display: 'flex',
              gap: '10px',
              flexShrink: 0,
            }}>
              <button
                onClick={() => downloadActionPlanPDF(selectedPlan)}
                style={{
                  padding: '9px 20px',
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '600',
                  fontFamily: 'var(--font-inter)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(51, 74, 105, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  letterSpacing: '0.01em',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download as PDF
              </button>
              <button
                onClick={() => setSelectedPlan(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '9px',
                  backgroundColor: 'transparent',
                  color: '#9CA3AF',
                  fontSize: '13px',
                  fontWeight: '500',
                  fontFamily: 'var(--font-inter)',
                  border: '1px solid #E2DDD6',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
                onMouseOver={e => { e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#D1D5DB' }}
                onMouseOut={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = '#E2DDD6' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
