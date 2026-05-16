// ============================================
// THE 16 DIAGNOSTIC STATEMENTS
// Verbatim from Companion Diagnostic Content March 2026
// ============================================

export const DIAGNOSTIC_STATEMENTS = [
  // Dimension 1 - Decision Making
  {
    id: 1,
    statement: 'When facing an important decision, I tend to trust my gut before I check the data.',
    pole: 'intuitive',
    dimension: 'decision_making',
  },
  {
    id: 2,
    statement: 'I often sense the right direction before I can fully explain why.',
    pole: 'intuitive',
    dimension: 'decision_making',
  },
  {
    id: 3,
    statement: 'I feel most confident committing when I have clear evidence and sound logic behind me.',
    pole: 'analytical',
    dimension: 'decision_making',
  },
  {
    id: 4,
    statement: "I get uncomfortable when I'm asked to move before I've had time to think it through properly.",
    pole: 'analytical',
    dimension: 'decision_making',
  },
  // Dimension 2 - Behaviour
  {
    id: 5,
    statement: "I regularly create space to think about what's coming before it arrives.",
    pole: 'proactive',
    dimension: 'behaviour',
  },
  {
    id: 6,
    statement: 'I tend to initiate change rather than wait for circumstances to force it.',
    pole: 'proactive',
    dimension: 'behaviour',
  },
  {
    id: 7,
    statement: 'My best work often happens in direct response to a problem that lands on my desk.',
    pole: 'reactive',
    dimension: 'behaviour',
  },
  {
    id: 8,
    statement: "I'm most effective solving immediate challenges rather than anticipating distant ones.",
    pole: 'reactive',
    dimension: 'behaviour',
  },
  // Dimension 3 - Leadership
  {
    id: 9,
    statement: 'I naturally draw others into decisions, even when I already know what I think.',
    pole: 'collaborative',
    dimension: 'leadership',
  },
  {
    id: 10,
    statement: 'My best leadership moments involve creating conditions for others to step up, not stepping up myself.',
    pole: 'collaborative',
    dimension: 'leadership',
  },
  {
    id: 11,
    statement: "I'm most effective when I have clear authority and can move without waiting for consensus.",
    pole: 'directive',
    dimension: 'leadership',
  },
  {
    id: 12,
    statement: 'Progress accelerates when I make the call and others execute behind it.',
    pole: 'directive',
    dimension: 'leadership',
  },
  // Dimension 4 - Awareness
  {
    id: 13,
    statement: 'I make sense of uncertainty through frameworks, patterns and mental models.',
    pole: 'cognitive',
    dimension: 'awareness',
  },
  {
    id: 14,
    statement: 'When things get unclear, I reach for structure and logic before anything else.',
    pole: 'cognitive',
    dimension: 'awareness',
  },
  {
    id: 15,
    statement: "I'm driven by a sense of purpose that exists beyond outcomes or recognition.",
    pole: 'spiritual_purpose',
    dimension: 'awareness',
  },
  {
    id: 16,
    statement: 'My most important decisions tend to connect to something deeper than strategy.',
    pole: 'spiritual_purpose',
    dimension: 'awareness',
  },
]

// ============================================
// DIMENSION FRAMINGS
// Context-specific framing sentences per dimension
// Updated: Companion Change Request April 2026
// ============================================

export const DIMENSION_FRAMINGS = {
  founder: {
    decision_making:
      "Building something new means making decisions before you have full information or full authority. Let's understand how you're wired for that.",
    behaviour:
      "Whether you're starting from scratch or driving change inside a system, momentum doesn't come from permission. Let's understand whether you create it or respond to it.",
    leadership:
      "Building something means deciding how much you pull people in versus how much you just move. Let's understand your natural leadership instinct when the stakes are high.",
    awareness:
      "What sustains you through uncertainty isn't just strategy - it's knowing why you started. Let's understand what's driving you beneath the business case.",
  },
  leader: {
    decision_making:
      "Stepping into a bigger role means your decision-making style shapes an entire team's culture. Let's understand your default setting.",
    behaviour:
      "The culture of a team mirrors the behaviour of its leader. Let's understand whether you're setting the pace or responding to it.",
    leadership:
      "At the executive level, how you make decisions shapes the decision-making culture beneath you. Let's understand whether you lead through consensus or conviction.",
    awareness:
      "The leaders who last aren't just competent - they're connected to something that outlasts any role or title. Let's understand what that is for you.",
  },
  innovator: {
    decision_making:
      "Innovating inside a system means your decisions carry political weight as well as strategic weight. Let's understand how you're wired to navigate that.",
    behaviour:
      "Driving change from the inside means knowing when to push and when to hold. Let's understand your default when momentum stalls.",
    leadership:
      "Innovation inside a system requires knowing when to build consensus and when to move without it. Let's understand your natural instinct.",
    awareness:
      "What keeps an internal change agent going isn't just the initiative - it's knowing what it's really about. Let's understand what's driving you beneath the project.",
  },
}

// ============================================
// OWNER'S INDEX - 16 DIAGNOSTIC STATEMENTS
// Business-dependency questions. Higher answer = more independent.
// ============================================

export const OWNER_DIAGNOSTIC_STATEMENTS = [
  // Process Dependency
  // Cognitive pole - O1: Free Yourself
  { id: 1, statement: 'My business has documented processes that run without my direct involvement.', pole: 'cognitive', dimension: 'decision_making' },
  { id: 2, statement: 'A competent operator could step into my role and keep day-to-day operations running within 90 days.', pole: 'cognitive', dimension: 'decision_making' },
  // Intuitive pole - O2: Make It Repeatable
  { id: 3, statement: 'The way we deliver our core product or service follows a repeatable system, not my personal habits.', pole: 'intuitive', dimension: 'decision_making' },
  { id: 4, statement: "Our quality standards are embedded in checklists and processes, not in my instinct for when something isn't right.", pole: 'intuitive', dimension: 'decision_making' },

  // Information Dependency
  // Reactive pole - O3: Write Your Recipe
  { id: 5, statement: 'Our pricing logic, supplier terms and key client preferences are stored in systems my team can access without me.', pole: 'reactive', dimension: 'behaviour' },
  { id: 6, statement: 'A new employee can become fully productive using documented materials rather than shadowing me.', pole: 'reactive', dimension: 'behaviour' },
  // Collaborative pole - O4: Make It Visible
  { id: 7, statement: 'My team can read the early warning signals in the business - client churn risk, team issues, market shifts - without relying on my intuition.', pole: 'collaborative', dimension: 'behaviour' },
  { id: 8, statement: 'We have dashboards or reporting that surface the information I used to carry in my head.', pole: 'collaborative', dimension: 'behaviour' },

  // Decision Dependency
  // Directive pole - O5: Raise The Average
  { id: 9, statement: 'My team makes most operational decisions without escalating to me.', pole: 'directive', dimension: 'leadership' },
  { id: 10, statement: 'Someone other than me has authority to approve significant financial commitments.', pole: 'directive', dimension: 'leadership' },
  // Pro-active pole - O6: Don't Apologise
  { id: 11, statement: "I accept that my team's decisions at 80% of my standard are better than bottlenecking every decision through me.", pole: 'proactive', dimension: 'leadership' },
  { id: 12, statement: 'I have deliberately stopped reviewing work that my team can handle to an acceptable level.', pole: 'proactive', dimension: 'leadership' },

  // Energy Dependency
  // Spiritual pole - O7: Subtract To Scale
  { id: 13, statement: 'The majority of my week is spent on work that genuinely requires my specific expertise and judgment.', pole: 'spiritual_purpose', dimension: 'awareness' },
  { id: 14, statement: "I have actively eliminated tasks from my week over the past 12 months that didn't require me personally.", pole: 'spiritual_purpose', dimension: 'awareness' },
  // Analytical pole - O8: No Loose Ends
  { id: 15, statement: 'When I hand something off, the transfer is complete - clear brief, context, authority and follow-up structure.', pole: 'analytical', dimension: 'awareness' },
  { id: 16, statement: "My team does not come back to me on tasks I've already delegated because the handover was incomplete.", pole: 'analytical', dimension: 'awareness' },
]

// ============================================
// OWNER'S INDEX - DIMENSION FRAMINGS
// Shown before each block of 4 questions
// ============================================

export const OWNER_DIMENSION_FRAMINGS = {
  decision_making:
    "Every business encodes its founder's decision-making habits - the gut calls, the instincts, the shortcuts that work but aren't written down. Let's measure how much of that lives in systems versus in your head.",
  behaviour:
    "Most founders started by doing everything themselves. The question is whether the business has outgrown that - whether you're still reacting to every problem personally or whether you've built the muscle to hand things off cleanly. Let's find out.",
  leadership:
    "A buyer doesn't acquire a founder - they acquire a team. Let's measure whether your people can read the business, make decisions and operate at a standard that holds without you in the room.",
  awareness:
    "The hardest thing for a founder to see clearly is where their own time goes - and whether the work consuming their week is the work that actually requires them. Let's map where your energy is going versus where it should be.",
}

// ============================================
// SCORING LOGIC
// ============================================

export interface RadarScores {
  intuitive: number
  analytical: number
  proactive: number
  reactive: number
  collaborative: number
  directive: number
  cognitive: number
  spiritual_purpose: number
}

export interface ReadinessScores {
  radarScores: RadarScores
  rangeDecisionMaking: number
  rangeBehaviour: number
  rangeLeadership: number
  rangeAwareness: number
  readinessScore: number
}

export function scoreResponses(answers: number[]): ReadinessScores {
  // Each pole is the average of its two questions
  const radarScores: RadarScores = {
    intuitive: (answers[0] + answers[1]) / 2,
    analytical: (answers[2] + answers[3]) / 2,
    proactive: (answers[4] + answers[5]) / 2,
    reactive: (answers[6] + answers[7]) / 2,
    collaborative: (answers[8] + answers[9]) / 2,
    directive: (answers[10] + answers[11]) / 2,
    cognitive: (answers[12] + answers[13]) / 2,
    spiritual_purpose: (answers[14] + answers[15]) / 2,
  }

  // Range scores - absolute gap between the two poles per dimension
  const rangeDecisionMaking = Math.abs(
    radarScores.intuitive - radarScores.analytical
  )
  const rangeBehaviour = Math.abs(
    radarScores.proactive - radarScores.reactive
  )
  const rangeLeadership = Math.abs(
    radarScores.collaborative - radarScores.directive
  )
  const rangeAwareness = Math.abs(
    radarScores.spiritual_purpose - radarScores.cognitive
  )

  // Reinventor's Readiness Score (0–10, higher is better)
  const totalRange =
    rangeDecisionMaking + rangeBehaviour + rangeLeadership + rangeAwareness
  const readinessScore =
    Math.round((10 - (totalRange * 10) / 16) * 10) / 10

  return {
    radarScores,
    rangeDecisionMaking,
    rangeBehaviour,
    rangeLeadership,
    rangeAwareness,
    readinessScore,
  }
}

// ============================================
// OWNER'S INDEX SCORING
// Per Owner's Index Diagnostic Implementation Brief - May 2026
// invert (6 - raw), sum per dimension, scale to 0-10
// Watermark = stdev of 4 dimension scores, scaled to 0-10
// ============================================

export interface OwnerDiagnosticResult {
  radarScores: RadarScores
  process: number
  information: number
  decision: number
  energy: number
  founderDependencyScore: number
  watermarkStrength: number
  rangeDecisionMaking: number
  rangeBehaviour: number
  rangeLeadership: number
  rangeAwareness: number
  readinessScore: number
}

export function scoreOwnerResponses(answers: number[]): OwnerDiagnosticResult {
  // Owner's Index pole mapping (per brief):
  // Q1-2 -> Cognitive (Process), Q3-4 -> Intuitive (Process)
  // Q5-6 -> Reactive (Information), Q7-8 -> Collaborative (Information)
  // Q9-10 -> Directive (Decision), Q11-12 -> Pro-active (Decision)
  // Q13-14 -> Spiritual (Energy), Q15-16 -> Analytical (Energy)
  const radarScores: RadarScores = {
    cognitive: (answers[0] + answers[1]) / 2,
    intuitive: (answers[2] + answers[3]) / 2,
    reactive: (answers[4] + answers[5]) / 2,
    collaborative: (answers[6] + answers[7]) / 2,
    directive: (answers[8] + answers[9]) / 2,
    proactive: (answers[10] + answers[11]) / 2,
    spiritual_purpose: (answers[12] + answers[13]) / 2,
    analytical: (answers[14] + answers[15]) / 2,
  }

  // Dimension score - invert each answer (6 - raw), sum 4, scale (sum - 4) / 16 * 10
  function dimScore(qStart: number): number {
    const sumInverted = answers.slice(qStart, qStart + 4).reduce((s, a) => s + (6 - a), 0)
    const raw = ((sumInverted - 4) / 16) * 10
    return Math.max(0, Math.min(10, raw))
  }

  const process = dimScore(0)
  const information = dimScore(4)
  const decision = dimScore(8)
  const energy = dimScore(12)

  // Founder Dependency Score = average of 4 dimensions
  const founderDependencyScore = (process + information + decision + energy) / 4

  // Watermark Strength = stdev of 4 dimensions scaled by 5.0 (max practical stdev)
  const dims = [process, information, decision, energy]
  const variance = dims.reduce((s, d) => s + Math.pow(d - founderDependencyScore, 2), 0) / dims.length
  const stdev = Math.sqrt(variance)
  const watermarkStrength = Math.min(10, (stdev / 5.0) * 10)

  // Range scores kept for storage parity with Mindset (used by saveRadar shape)
  const rangeDecisionMaking = Math.abs(radarScores.cognitive - radarScores.intuitive)
  const rangeBehaviour = Math.abs(radarScores.reactive - radarScores.collaborative)
  const rangeLeadership = Math.abs(radarScores.directive - radarScores.proactive)
  const rangeAwareness = Math.abs(radarScores.spiritual_purpose - radarScores.analytical)

  return {
    radarScores,
    process,
    information,
    decision,
    energy,
    founderDependencyScore,
    watermarkStrength,
    rangeDecisionMaking,
    rangeBehaviour,
    rangeLeadership,
    rangeAwareness,
    // Store watermarkStrength in readiness_score field so computeOwnerScores can read it back
    readinessScore: watermarkStrength,
  }
}
