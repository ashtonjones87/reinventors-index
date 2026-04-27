'use client'

import { useState, useCallback, useRef } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export type ChatErrorType = 'timeout' | 'network' | 'ratelimit' | 'auth' | 'server'

export interface ChatError {
  message: string
  retryable: boolean
  type: ChatErrorType
}

const STREAM_TIMEOUT_MS = 30_000

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<ChatError | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Streams a response from the API for a given messages array.
  // messagesForApi must NOT include an empty assistant placeholder.
  const doStream = useCallback(async (messagesForApi: Message[]) => {
    setIsStreaming(true)
    setError(null)

    // Show empty assistant bubble immediately
    setMessages([...messagesForApi, { role: 'assistant', content: '' }])

    abortRef.current = new AbortController()
    const timeoutId = setTimeout(() => abortRef.current?.abort('timeout'), STREAM_TIMEOUT_MS)

    const stripEmptyAssistant = () => {
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.role === 'assistant' && last.content === '') return prev.slice(0, -1)
        return prev
      })
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForApi }),
        signal: abortRef.current.signal,
      })

      clearTimeout(timeoutId)

      if (response.status === 401) {
        stripEmptyAssistant()
        setError({ message: 'Session expired. Please refresh the page.', retryable: false, type: 'auth' })
        return
      }
      if (response.status === 429) {
        stripEmptyAssistant()
        setError({ message: 'Too many requests. Please wait a moment and try again.', retryable: true, type: 'ratelimit' })
        return
      }
      if (!response.ok || !response.body) {
        stripEmptyAssistant()
        setError({ message: 'Something went wrong on our end. Try again.', retryable: true, type: 'server' })
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let hasReceivedData = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        hasReceivedData = true

        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + chunk }
          }
          return updated
        })
      }

      // Stream closed without any data - treat as server error
      if (!hasReceivedData) {
        stripEmptyAssistant()
        setError({ message: 'No response received. Try again.', retryable: true, type: 'server' })
      }
    } catch (err: any) {
      clearTimeout(timeoutId)

      // Keep any partial content that was streamed
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        // Only strip if truly empty - if partial content exists, leave it so user can see what arrived
        if (last?.role === 'assistant' && last.content === '') return prev.slice(0, -1)
        return prev
      })

      if (err.name === 'AbortError' || err === 'timeout') {
        setError({ message: 'Response timed out. Please try again.', retryable: true, type: 'timeout' })
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setError({ message: 'No internet connection. Check your network and try again.', retryable: true, type: 'network' })
      } else {
        setError({ message: 'Connection lost mid-response. Try again.', retryable: true, type: 'network' })
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [])

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim() || isStreaming) return
    const messagesForApi = [...messages, { role: 'user' as const, content: userInput }]
    setMessages(messagesForApi) // show user message immediately
    await doStream(messagesForApi)
  }, [messages, isStreaming, doStream])

  // Retry: messages already contains the last user message (empty assistant was stripped on error)
  const retryLastMessage = useCallback(async () => {
    if (isStreaming) return
    // Strip any partial assistant message at the end before retrying
    const cleanMessages = messages[messages.length - 1]?.role === 'assistant'
      ? messages.slice(0, -1)
      : messages
    if (cleanMessages.length === 0) return
    await doStream(cleanMessages)
  }, [messages, isStreaming, doStream])

  const clearMessages = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setError(null)
  }, [])

  return { messages, isStreaming, error, sendMessage, retryLastMessage, clearMessages }
}
