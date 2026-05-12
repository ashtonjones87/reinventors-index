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
