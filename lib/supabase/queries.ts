import { getSupabaseServer } from './server'
import type { RadarScores } from '@/lib/diagnostic'

// ============================================
// USER QUERIES
// ============================================

export type Product = 'reinventor' | 'owner' | 'owner-ironcove'

// True when an insert failed specifically because the `product` column is
// absent or rejects the value (e.g. migration not yet run, CHECK constraint).
// Lets callers retry the write without the product tag instead of losing data.
function isMissingProductColumn(error: { message?: string; code?: string }): boolean {
  const msg = (error?.message ?? '').toLowerCase()
  return (
    msg.includes('product') &&
    (msg.includes('column') ||
      msg.includes('schema cache') ||
      msg.includes('does not exist') ||
      msg.includes('violates check constraint'))
  )
}

export async function upsertUser(id: string, email: string, name: string, product: Product = 'reinventor') {
  const supabase = getSupabaseServer()
  const baseRow = { id, email, name, created_at: new Date().toISOString() }
  const { error } = await supabase
    .from('users')
    .upsert({ ...baseRow, product }, { onConflict: 'id', ignoreDuplicates: false })
  if (error) {
    if (isMissingProductColumn(error)) {
      const { error: retryError } = await supabase
        .from('users')
        .upsert(baseRow, { onConflict: 'id', ignoreDuplicates: false })
      if (retryError) throw retryError
    } else {
      throw error
    }
  }
}

// Marks a user for deletion. Data is retained for 30 days before permanent purge.
export async function softDeleteUser(userId: string) {
  const supabase = getSupabaseServer()
  const { error } = await supabase
    .from('users')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
}

// Called on user.created when someone signs up with the same email as a soft-deleted account.
// Updates the user row's ID to the new Clerk ID (ON UPDATE CASCADE re-links all child rows),
// clears deleted_at, and returns true if a restorable account was found.
export async function restoreDeletedUser(email: string, newUserId: string): Promise<boolean> {
  const supabase = getSupabaseServer()
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .not('deleted_at', 'is', null)
    .gt('deleted_at', cutoff)
    .limit(1)
    .single()

  if (error || !data) return false

  const { error: updateError } = await supabase
    .from('users')
    .update({ id: newUserId, deleted_at: null })
    .eq('id', data.id)

  if (updateError) throw updateError
  return true
}

// Hard-deletes all users whose 30-day grace period has expired.
// ON DELETE CASCADE in the DB handles session_summaries and diagnostics automatically.
export async function purgeExpiredUsers(): Promise<number> {
  const supabase = getSupabaseServer()
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('users')
    .delete()
    .not('deleted_at', 'is', null)
    .lt('deleted_at', cutoff)
    .select('id')

  if (error) throw error
  return data?.length ?? 0
}

export async function updateUserProduct(id: string, product: Product) {
  const supabase = getSupabaseServer()
  // Retry up to 4 times with backoff — the Clerk webhook that creates the user row
  // fires asynchronously and may not complete before the home page redirect lands.
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 1000 * attempt))
    }
    const { data, error } = await supabase
      .from('users')
      .update({ product })
      .eq('id', id)
      .eq('product', 'owner')
      .select('id')
    if (error) throw error
    if (data && data.length > 0) return
  }
}

// ============================================
// CHAT USAGE QUERIES
// One row per user per UTC day. message_count increments on each user message.
// ============================================

// Returns how many messages the user has sent today (UTC). 0 if no row yet.
export async function getTodayChatCount(userId: string): Promise<number> {
  const supabase = getSupabaseServer()
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  const { data, error } = await supabase
    .from('chat_usage')
    .select('message_count')
    .eq('user_id', userId)
    .gte('window_start', todayIso)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data?.message_count ?? 0
}

export async function incrementChatUsage(userId: string, product: Product = 'reinventor') {
  const supabase = getSupabaseServer()

  // Compute start of today (UTC) so each user gets one row per day
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  // Find today's row for this user
  const { data: existing, error: selectError } = await supabase
    .from('chat_usage')
    .select('id, message_count')
    .eq('user_id', userId)
    .gte('window_start', todayIso)
    .limit(1)
    .maybeSingle()

  if (selectError) throw selectError

  if (existing) {
    const { error } = await supabase
      .from('chat_usage')
      .update({ message_count: existing.message_count + 1 })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    const baseRow = {
      user_id: userId,
      message_count: 1,
      window_start: todayIso,
      is_authenticated_member: true,
    }
    const { error } = await supabase.from('chat_usage').insert({ ...baseRow, product })
    if (error) {
      if (isMissingProductColumn(error)) {
        const { error: retryError } = await supabase.from('chat_usage').insert(baseRow)
        if (retryError) throw retryError
      } else {
        throw error
      }
    }
  }
}

// ============================================
// SESSION SUMMARY QUERIES
// ============================================

export async function getLatestSummary(userId: string) {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('session_summaries')
    .select('*')
    .eq('user_id', userId)
    .order('session_date', { ascending: false })
    .limit(1)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function saveSummary(userId: string, summary: {
  context_detected?: string | null
  framework_explored: string
  core_tension: string
  practical_action: string
  open_questions: string
  shift_observed: string
}, rawTranscript: string, product: Product = 'reinventor') {
  const supabase = getSupabaseServer()
  const baseRow = {
    user_id: userId,
    context_detected: summary.context_detected ?? null,
    framework_explored: summary.framework_explored,
    core_tension: summary.core_tension,
    practical_action: summary.practical_action,
    open_questions: summary.open_questions,
    shift_observed: summary.shift_observed,
    raw_transcript: rawTranscript,
  }
  const { error } = await supabase.from('session_summaries').insert({ ...baseRow, product })
  if (error) {
    if (isMissingProductColumn(error)) {
      const { error: retryError } = await supabase.from('session_summaries').insert(baseRow)
      if (retryError) throw retryError
    } else {
      throw error
    }
  }
}

// ============================================
// DIAGNOSTIC QUERIES
// ============================================

export async function getLastTwoDiagnostics(userId: string) {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('diagnostics')
    .select('*')
    .eq('user_id', userId)
    .order('taken_at', { ascending: false })
    .limit(2)
  if (error) throw error
  return data ?? []
}

export async function saveRadar(
  userId: string,
  scores: RadarScores,
  readinessData: {
    readinessScore: number
    rangeDecisionMaking: number
    rangeBehaviour: number
    rangeLeadership: number
    rangeAwareness: number
  },
  rawResponses: { question_id: number; answer: number }[],
  context?: string | null,
  product: Product = 'reinventor'
) {
  const supabase = getSupabaseServer()
  const baseRow = {
    user_id: userId,
    ...scores,
    readiness_score: readinessData.readinessScore,
    range_decision_making: readinessData.rangeDecisionMaking,
    range_behaviour: readinessData.rangeBehaviour,
    range_leadership: readinessData.rangeLeadership,
    range_awareness: readinessData.rangeAwareness,
    raw_responses: rawResponses,
    ...(context ? { context_detected: context } : {}),
  }
  const { error } = await supabase.from('diagnostics').insert({ ...baseRow, product })
  if (error) {
    if (isMissingProductColumn(error)) {
      const { error: retryError } = await supabase.from('diagnostics').insert(baseRow)
      if (retryError) throw retryError
    } else {
      throw error
    }
  }
}

// ============================================
// ACTION PLAN QUERIES
// ============================================

export async function getActionPlans(userId: string) {
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('action_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3)
  if (error) throw error
  return data ?? []
}

export async function saveActionPlan(
  userId: string,
  plan: {
    context_detected?: string | null
    framework_explored?: string | null
    core_tension?: string | null
    practical_action: string
    open_questions?: string | null
    shift_observed?: string | null
  },
  product: Product = 'reinventor'
): Promise<{ deletedOldest: boolean }> {
  const supabase = getSupabaseServer()

  const { count, error: countError } = await supabase
    .from('action_plans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  if (countError) throw countError

  let deletedOldest = false
  if ((count ?? 0) >= 3) {
    const { data: oldest } = await supabase
      .from('action_plans')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (oldest) {
      await supabase.from('action_plans').delete().eq('id', oldest.id)
      deletedOldest = true
    }
  }

  const baseRow = {
    user_id: userId,
    context_detected: plan.context_detected ?? null,
    framework_explored: plan.framework_explored ?? null,
    core_tension: plan.core_tension ?? null,
    practical_action: plan.practical_action,
    open_questions: plan.open_questions ?? null,
    shift_observed: plan.shift_observed ?? null,
  }

  const { error } = await supabase.from('action_plans').insert({ ...baseRow, product })

  // If the product column doesn't exist (or rejects the value), still save the
  // action plan without the product tag rather than losing it entirely.
  if (error) {
    if (isMissingProductColumn(error)) {
      const { error: retryError } = await supabase.from('action_plans').insert(baseRow)
      if (retryError) throw retryError
    } else {
      throw error
    }
  }

  return { deletedOldest }
}
