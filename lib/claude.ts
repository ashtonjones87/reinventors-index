import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

function getApiKey(): string {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY

  // Turbopack dev-server workaround: process.env is not populated for this key
  // This is server-side only - the key never reaches the browser
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8')
    const match = raw.match(/^ANTHROPIC_API_KEY=(.+)$/m)
    if (match?.[1]) return match[1].trim()
  } catch {}

  throw new Error('ANTHROPIC_API_KEY not found')
}

export function createAnthropicClient() {
  return new Anthropic({ apiKey: getApiKey() })
}
