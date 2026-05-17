import { getSupabaseServer } from './server'
import type { RadarScores } from '@/lib/diagnostic'

// ============================================
// USER QUERIES
// ============================================

export type Product = 'owner' | 'mindset'

export async function upsertUser(id: string, email: string, name: string, product: Product = 'mindset') {
  const supabase = getSupabaseServer()
  // Only set product on insert - don't overwrite existing user's product on subsequent upserts
  const { error } = await supabase
    .from('users')
    .upsert(
      { id, email, name, product, created_at: new Date().toISOString() },
      { onConflict: 'id', ignoreDuplicates: false }
    )
  if (error) throw error
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

// ============================================
// CHAT USAGE QUERIES
// One row per user per UTC day. message_count increments on each user message.
// ============================================

export async function incrementChatUsage(userId: string, product: Product = 'mindset') {
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
    const { error } = await supabase
      .from('chat_usage')
      .insert({
        user_id: userId,
        message_count: 1,
        window_start: todayIso,
        is_authenticated_member: true,
        product,
      })
    if (error) throw error
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
}, rawTranscript: string, product: Product = 'mindset') {
  const supabase = getSupabaseServer()
  const { error } = await supabase
    .from('session_summaries')
    .insert({
      user_id: userId,
      context_detected: summary.context_detected ?? null,
      framework_explored: summary.framework_explored,
      core_tension: summary.core_tension,
      practical_action: summary.practical_action,
      open_questions: summary.open_questions,
      shift_observed: summary.shift_observed,
      raw_transcript: rawTranscript,
      product,
    })
  if (error) throw error
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
  product: Product = 'mindset'
) {
  const supabase = getSupabaseServer()
  const { error } = await supabase.from('diagnostics').insert({
    user_id: userId,
    ...scores,
    readiness_score: readinessData.readinessScore,
    range_decision_making: readinessData.rangeDecisionMaking,
    range_behaviour: readinessData.rangeBehaviour,
    range_leadership: readinessData.rangeLeadership,
    range_awareness: readinessData.rangeAwareness,
    raw_responses: rawResponses,
    product,
    ...(context ? { context_detected: context } : {}),
  })
  if (error) throw error
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
  product: Product = 'mindset'
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

  const { error } = await supabase.from('action_plans').insert({
    user_id: userId,
    context_detected: plan.context_detected ?? null,
    framework_explored: plan.framework_explored ?? null,
    core_tension: plan.core_tension ?? null,
    practical_action: plan.practical_action,
    open_questions: plan.open_questions ?? null,
    shift_observed: plan.shift_observed ?? null,
    product,
  })
  if (error) throw error

  return { deletedOldest }
}
