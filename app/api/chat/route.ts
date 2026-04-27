import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { createAnthropicClient } from '@/lib/claude'
import { buildSystemPrompt, buildPreDiagnosticPrompt } from '@/lib/prompts/assembler'
import {
  getLatestSummary,
  getLastTwoDiagnostics,
} from '@/lib/supabase/queries'

const CLAUDE_TIMEOUT_MS = 25_000

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return new Response('Unauthorised', { status: 401 })
  }

  try {
    const body = await req.json()
    const { messages, preDiagnosticContext } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Invalid messages', { status: 400 })
    }

    const validMessages = messages.every(
      (m: any) =>
        m &&
        typeof m.role === 'string' &&
        ['user', 'assistant'].includes(m.role) &&
        typeof m.content === 'string'
    )
    if (!validMessages) {
      return new Response('Malformed messages', { status: 400 })
    }

    const [latestSummary, diagnostics] = await Promise.all([
      getLatestSummary(userId),
      getLastTwoDiagnostics(userId),
    ])

    const currentRadar = diagnostics[0] ?? null

    const systemPrompt = diagnostics.length === 0
      ? buildPreDiagnosticPrompt({ previousSummary: latestSummary })
      : buildSystemPrompt({
          previousSummary: latestSummary,
          radarScores: currentRadar,
          contextDetected: currentRadar?.context_detected ?? null,
          preDiagnosticContext: typeof preDiagnosticContext === 'string' ? preDiagnosticContext : null,
        })

    const anthropic = createAnthropicClient()
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), CLAUDE_TIMEOUT_MS)

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const claudeStream = anthropic.messages.stream(
            {
              model: 'claude-sonnet-4-6',
              max_tokens: 2048,
              system: systemPrompt,
              messages: messages,
            },
            { signal: abortController.signal }
          )

          claudeStream.on('text', (text) => {
            controller.enqueue(new TextEncoder().encode(text))
          })

          claudeStream.on('finalMessage', () => {
            clearTimeout(timeoutId)
            controller.close()
          })

          claudeStream.on('error', (error: any) => {
            clearTimeout(timeoutId)
            console.error('Claude stream error:', error)
            controller.error(error)
          })
        } catch (error) {
          clearTimeout(timeoutId)
          console.error('Claude API error:', error)
          controller.error(error)
        }
      },
      cancel() {
        clearTimeout(timeoutId)
        abortController.abort()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error: any) {
    console.error('Chat route error:', error)

    if (error?.status === 429) {
      return new Response('Rate limited', { status: 429 })
    }
    return new Response('Internal server error', { status: 500 })
  }
}
