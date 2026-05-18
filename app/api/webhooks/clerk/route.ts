import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { upsertUser, softDeleteUser, restoreDeletedUser } from '@/lib/supabase/queries'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET in environment variables')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If headers are missing, reject the request
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  // Get the raw body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Verify the webhook signature
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 401 })
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data

    const email = email_addresses[0]?.email_address
    const name = [first_name, last_name].filter(Boolean).join(' ') || ''

    if (!email) {
      return new Response('No email found on user', { status: 400 })
    }

    // Determine product — ironcove referral takes precedence over domain check
    const source = (evt.data.unsafe_metadata as Record<string, unknown> | undefined)?.source
    const isOwner = headerPayload.get('x-is-owner-index') === '1'
    const product: 'reinventor' | 'owner' | 'owner-ironcove' =
      source === 'ironcove' ? 'owner-ironcove' : isOwner ? 'owner' : 'reinventor'

    try {
      // Check if this email has a soft-deleted account within the 30-day window.
      // If so, restore it (re-links all session/diagnostic data to the new Clerk ID).
      const restored = await restoreDeletedUser(email, id)
      if (restored) {
        console.log(`Account restored for returning user: ${email}`)
      } else {
        await upsertUser(id, email, name, product)
        console.log(`User synced to Supabase: ${email} (product: ${product})`)
      }
    } catch (err) {
      console.error('Failed to sync user to Supabase:', err)
      return new Response('Database error', { status: 500 })
    }
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data
    if (id) {
      try {
        // Soft-delete: retain data for 30 days in case the user changes their mind.
        await softDeleteUser(id)
        console.log(`User soft-deleted (30-day grace period started): ${id}`)
      } catch (err) {
        console.error('Failed to soft-delete user:', err)
        return new Response('Database error', { status: 500 })
      }
    }
  }

  return new Response('OK', { status: 200 })
}
