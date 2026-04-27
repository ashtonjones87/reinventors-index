import ReactMarkdown from 'react-markdown'
import { Message } from '@/hooks/useChat'

interface MessageBubbleProps {
  message: Message
}

// Convert em dashes and en dashes to plain hyphens
function normaliseText(text: string): string {
  return text
    .replace(/-/g, ' - ')  // em dash -
    .replace(/–/g, ' - ')  // en dash –
    .replace(/ - /g, ' - ')     // normalise spacing around hyphens
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (!isUser && !message.content) return null

  const content = isUser ? message.content : normaliseText(message.content)

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      marginBottom: '20px',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      alignItems: 'flex-end',
      gap: '10px',
    }}>
      {!isUser && (
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #334a69 0%, #1e3a5f 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginBottom: '2px',
          boxShadow: '0 2px 8px rgba(51,74,105,0.22)',
        }}>
          <span style={{ color: '#FFFFFF', fontSize: '10px', fontFamily: 'var(--font-libre)', fontWeight: '700' }}>I</span>
        </div>
      )}
      <div
        className={`md-bubble ${isUser ? 'bubble-user' : 'bubble-ai'}`}
        style={{
          maxWidth: '72%',
          padding: '13px 17px',
          fontSize: '14px',
          lineHeight: '1.7',
          fontFamily: 'var(--font-inter)',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          backgroundColor: isUser ? undefined : '#FFFFFF',
          color: isUser ? '#FFFFFF' : '#1a1a1a',
          border: isUser ? 'none' : '1.5px solid #E2DDD6',
        }}
      >
        {isUser ? (
          content
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p style={{ margin: '0 0 8px 0', lineHeight: '1.7' }}>{children}</p>
              ),
              strong: ({ children }) => (
                <strong style={{ fontWeight: '700', color: '#334a69' }}>{children}</strong>
              ),
              em: ({ children }) => (
                <em style={{ fontStyle: 'italic' }}>{children}</em>
              ),
              h1: ({ children }) => (
                <h1 style={{ fontFamily: 'var(--font-libre)', fontSize: '18px', fontWeight: '700', color: '#334a69', margin: '12px 0 6px', lineHeight: '1.3' }}>{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 style={{ fontFamily: 'var(--font-libre)', fontSize: '16px', fontWeight: '700', color: '#334a69', margin: '10px 0 5px', lineHeight: '1.3' }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 style={{ fontFamily: 'var(--font-libre)', fontSize: '15px', fontWeight: '700', color: '#334a69', margin: '8px 0 4px', lineHeight: '1.3' }}>{children}</h3>
              ),
              ul: ({ children }) => (
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{ margin: '8px 0', paddingLeft: '20px' }}>{children}</ol>
              ),
              li: ({ children }) => (
                <li style={{ marginBottom: '4px', lineHeight: '1.7' }}>{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote style={{ borderLeft: '3px solid #2A7B7B', paddingLeft: '12px', margin: '8px 0', color: '#6B7280', fontStyle: 'italic' }}>{children}</blockquote>
              ),
              code: ({ children }) => (
                <code style={{ backgroundColor: '#F5F3EE', padding: '1px 5px', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace' }}>{children}</code>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}
