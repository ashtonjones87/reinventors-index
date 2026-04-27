'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useChat } from '@/hooks/useChat'
import MessageBubble from './MessageBubble'
import SessionEndControls from './SessionEndControls'

const SIGNAL_DIAGNOSTIC_READY = '[DIAGNOSTIC_READY]'
const SIGNAL_CONTEXT = /\[CONTEXT:(founder|leader|innovator)\]/
const PRE_DIAGNOSTIC_MAX_AI_MESSAGES = 4

interface ChatWindowProps {
  radarScores: any
  readinessScore: number | null
  rangeScores: any
  isReturningUser: boolean
  latestSummary: any
  previousRadar: any
  detectedContext?: string | null
  preDiagnosticContext?: string | null
  preDiagnostic?: boolean
  onDiagnosticReady?: (context: string | null) => void
}

function stripSignals(text: string): string {
  return text
    .replace(/\[DIAGNOSTIC_READY\]/g, '')
    .replace(/\[CONTEXT:\w+\]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export default function ChatWindow({
  radarScores,
  readinessScore,
  rangeScores,
  isReturningUser,
  latestSummary,
  previousRadar,
  detectedContext,
  preDiagnosticContext,
  preDiagnostic = false,
  onDiagnosticReady,
}: ChatWindowProps) {
  const { messages, isStreaming, error, sendMessage, retryLastMessage } = useChat(
    preDiagnosticContext ? { preDiagnosticContext } : undefined
  )
  const [input, setInput] = useState('')
  const [sessionEnded, setSessionEnded] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const diagnosticTriggeredRef = useRef(false)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  // Online / offline detection
  useEffect(() => {
    function handleOnline() { setIsOnline(true) }
    function handleOffline() { setIsOnline(false) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Detect [DIAGNOSTIC_READY] / [CONTEXT:xxx] signals, or force-trigger after 4 AI messages
  useEffect(() => {
    if (!preDiagnostic || !onDiagnosticReady || isStreaming || diagnosticTriggeredRef.current) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.role !== 'assistant') return

    const hasReadySignal = lastMsg.content.includes(SIGNAL_DIAGNOSTIC_READY)
    const aiMessages = messages.filter(m => m.role === 'assistant')
    const hitCap = aiMessages.length >= PRE_DIAGNOSTIC_MAX_AI_MESSAGES

    if (hasReadySignal || hitCap) {
      // Find most recent context signal across all messages
      let context: string | null = null
      for (let i = messages.length - 1; i >= 0; i--) {
        const match = messages[i].content.match(SIGNAL_CONTEXT)
        if (match) { context = match[1]; break }
      }
      diagnosticTriggeredRef.current = true
      onDiagnosticReady(context)
    }
  }, [messages, isStreaming, preDiagnostic, onDiagnosticReady])

  async function handleSend() {
    if (!input.trim() || isStreaming || sessionEnded) return
    const message = input.trim()
    setInput('')
    await sendMessage(message)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = !!input.trim() && !isStreaming && !sessionEnded && isOnline

  return (
    <div className="flex flex-col h-full">

      {/* Offline banner */}
      {!isOnline && (
        <div className="anim-fade" style={{
          backgroundColor: '#FEF3C7',
          borderBottom: '1px solid #FDE68A',
          padding: '8px 24px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '13px', color: '#92400E', fontWeight: '500' }}>
            You&apos;re offline. Reconnect to continue the conversation.
          </p>
        </div>
      )}

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto md-px sm-px"
        style={{ backgroundColor: '#F5F3EE', padding: '32px 24px' }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="anim-up" style={{ textAlign: 'center', marginTop: '96px', marginBottom: '40px' }}>
              <div style={{
                width: '40px',
                height: '2px',
                background: 'linear-gradient(90deg, #334a69, #2A7B7B)',
                borderRadius: '999px',
                margin: '0 auto 20px',
                opacity: 0.5,
              }} />
              <p style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.14em',
                color: '#1a1a1a',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                The Reinventor&apos;s Mindset™
              </p>
              {preDiagnostic ? (
                <>
                  <p style={{
                    fontFamily: 'var(--font-libre)',
                    fontSize: '24px',
                    color: '#334a69',
                    lineHeight: '1.4',
                    letterSpacing: '-0.2px',
                    marginBottom: '12px',
                  }}>
                    You&apos;re here because something&apos;s shifting - or needs to.
                  </p>
                  <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: '1.65', maxWidth: '440px', margin: '0 auto' }}>
                    Good. That&apos;s where the work starts.
                    Before we get into it, I want to understand where you are right now.
                    Tell me what&apos;s going on - what brought you here today?
                  </p>
                </>
              ) : (
                <>
                  <p style={{
                    fontFamily: 'var(--font-libre)',
                    fontSize: '24px',
                    color: '#334a69',
                    lineHeight: '1.4',
                    letterSpacing: '-0.2px',
                  }}>
                    What are you wrestling with?
                  </p>
                  <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '12px', lineHeight: '1.6' }}>
                    This is your space. Take your time.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Messages - strip signals from display */}
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={
                message.role === 'assistant'
                  ? { ...message, content: stripSignals(message.content) }
                  : message
              }
            />
          ))}

          {/* Typing indicator */}
          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '10px',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(51,74,105,0.25)',
              }}>
                <span style={{ color: '#FFFFFF', fontSize: '10px', fontFamily: 'var(--font-libre)', fontWeight: '700' }}>I</span>
              </div>
              <div className="bubble-ai" style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #E2DDD6',
                borderRadius: '18px 18px 18px 4px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          {/* Error card */}
          {error && (
            <div className="anim-fade" style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              padding: '12px 18px',
              margin: '12px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: '500' }}>{error.message}</p>
              </div>
              {error.retryable && (
                <button
                  onClick={retryLastMessage}
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
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.07)' }}
                  onMouseOut={e => { e.currentTarget.style.background = 'none' }}
                >
                  Retry
                </button>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Session end controls - not shown in pre-diagnostic phase */}
      {!preDiagnostic && messages.length > 0 && !sessionEnded && (
        <div style={{
          backgroundColor: '#F5F3EE',
          padding: '8px 24px 0',
          maxWidth: '680px',
          margin: '0 auto',
          width: '100%',
        }}>
          <SessionEndControls
            messages={messages}
            onSessionSaved={() => setSessionEnded(true)}
            detectedContext={detectedContext}
          />
        </div>
      )}

      {/* Session ended confirmation */}
      {sessionEnded && (
        <div className="anim-fade" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          padding: '10px 24px',
          backgroundColor: '#F5F3EE',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2A7B7B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#2A7B7B', fontFamily: 'var(--font-inter)' }}>
            Session saved
          </span>
        </div>
      )}

      {/* Input bar */}
      <div
        className="md-px sm-px"
        style={{
          backgroundColor: '#F5F3EE',
          borderTop: '1px solid rgba(226, 221, 214, 0.8)',
          padding: '16px 24px 22px',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              sessionEnded ? 'Session ended.' :
              !isOnline ? 'Reconnect to continue…' :
              preDiagnostic ? 'Tell me what\'s going on…' :
              'What are you wrestling with?'
            }
            rows={1}
            disabled={isStreaming || sessionEnded || !isOnline}
            style={{
              flex: 1,
              resize: 'none',
              border: 'none',
              borderBottom: '1.5px solid #E2DDD6',
              padding: '9px 0',
              fontSize: '15px',
              fontFamily: 'var(--font-inter)',
              color: '#1a1a1a',
              backgroundColor: 'transparent',
              outline: 'none',
              maxHeight: '120px',
              overflowY: 'auto',
              lineHeight: '1.6',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{
              padding: '9px 22px',
              borderRadius: '9px',
              background: canSend
                ? 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)'
                : '#E8E4DE',
              color: canSend ? '#FFFFFF' : '#9CA3AF',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'var(--font-inter)',
              border: 'none',
              cursor: canSend ? 'pointer' : 'not-allowed',
              flexShrink: 0,
              letterSpacing: '0.03em',
              boxShadow: canSend ? '0 3px 12px rgba(51,74,105,0.35)' : 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={e => { if (canSend) e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={e => { e.currentTarget.style.transform = '' }}
          >
            {isStreaming ? '···' : 'Send'}
          </button>
        </div>
        <div style={{ marginTop: '8px' }}>
          <p style={{
            fontSize: '11px',
            color: '#C4BFB8',
            letterSpacing: '0.01em',
            textAlign: 'center',
          }}>
            Enter to send · Shift+Enter for new line
          </p>
          <div style={{ textAlign: 'right', marginTop: '4px' }}>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '11px',
                color: '#C4BFB8',
                textDecoration: 'none',
                letterSpacing: '0.01em',
                transition: 'color 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.color = '#334a69' }}
              onMouseOut={e => { e.currentTarget.style.color = '#C4BFB8' }}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
