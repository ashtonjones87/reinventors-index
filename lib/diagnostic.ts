// ============================================
// THE 4 DIAGNOSTIC STATEMENTS
// One question per dimension — best representative from each pair.
// High score (5) = stated pole; low score (1) = opposite pole.
// ============================================

export const DIAGNOSTIC_STATEMENTS = [
  {
    id: 1,
    statement: 'When facing an important decision, I trust my gut before I check the data.',
    pole: 'intuitive',        // high → intuitive | low → analytical
    dimension: 'decision_making',
  },
  {
    id: 2,
    statement: 'I tend to initiate change rather than wait for circumstances to force it.',
    pole: 'proactive',        // high → proactive | low → reactive
    dimension: 'behaviour',
  },
  {
    id: 3,
    statement: 'I naturally draw others into decisions, even when I already know what I think.',
    pole: 'collaborative',    // high → collaborative | low → directive
    dimension: 'leadership',
  },
  {
    id: 4,
    statement: 'I make sense of uncertainty through frameworks, patterns, and mental models.',
    pole: 'cognitive',        // high → cognitive | low → spiritual_purpose
    dimension: 'awareness',
  },
]

// ============================================
// DIMENSION FRAMINGS
// ============================================

export const DIMENSION_FRAMINGS = {
  building: {
    decision_making:
      "Building something new means making decisions before you have full information. Let's understand how you're wired for that.",
    behaviour:
      "Whether you're starting from scratch or driving change inside a system, momentum doesn't come from permission. Let's understand whether you create it or respond to it.",
    leadership:
      "Building something means deciding how much you pull people in versus how much you just move. Let's understand your natural instinct.",
    awareness:
      "What sustains you through uncertainty isn't just strategy — it's knowing why you started. Let's understand what's driving you beneath the business case.",
  },
  leading: {
    decision_making:
      "Stepping into a bigger role means your decision-making style shapes an entire team's culture. Let's understand your default setting.",
    behaviour:
      "The culture of a team mirrors the behaviour of its leader. Let's understand whether you're setting the pace or responding to it.",
    leadership:
      "At the executive level, how you make decisions shapes the decision-making culture beneath you. Let's understand whether you lead through consensus or conviction.",
    awareness:
      "The leaders who last aren't just competent — they're connected to something that outlasts any role or title. Let's understand what that is for you.",
  },
  transitioning: {
    decision_making:
      "Inflection points strip away the structures that used to guide your decisions. Let's understand how you make choices when the familiar frameworks are gone.",
    behaviour:
      "When everything shifts, some people freeze and some people move. Let's understand your default when the ground changes beneath you.",
    leadership:
      "Transition reshapes how you relate to others. Let's understand what's changing in how you lead.",
    awareness:
      "The hardest part of an inflection point isn't what you're moving toward — it's understanding what you're leaving behind. Let's look at what's anchoring you now.",
  },
}

// ============================================
// SCORING LOGIC
// 4 answers (1–5 each). High score = stated pole; low = opposite pole.
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
  // Each answer (1–5) sets one pole; its complement (6 – answer) sets the opposite pole.
  const radarScores: RadarScores = {
    intuitive:        answers[0],
    analytical:       6 - answers[0],
    proactive:        answers[1],
    reactive:         6 - answers[1],
    collaborative:    answers[2],
    directive:        6 - answers[2],
    cognitive:        answers[3],
    spiritual_purpose: 6 - answers[3],
  }

  // Range = gap between opposite poles in each dimension (0 = balanced, 4 = fully polarised)
  const rangeDecisionMaking = Math.abs(radarScores.intuitive - radarScores.analytical)
  const rangeBehaviour      = Math.abs(radarScores.proactive - radarScores.reactive)
  const rangeLeadership     = Math.abs(radarScores.collaborative - radarScores.directive)
  const rangeAwareness      = Math.abs(radarScores.spiritual_purpose - radarScores.cognitive)

  // Reinventor's Readiness Score (0–10, higher = more balanced / adaptable)
  const totalRange    = rangeDecisionMaking + rangeBehaviour + rangeLeadership + rangeAwareness
  const readinessScore = Math.round((10 - (totalRange * 10) / 16) * 10) / 10

  return {
    radarScores,
    rangeDecisionMaking,
    rangeBehaviour,
    rangeLeadership,
    rangeAwareness,
    readinessScore,
  }
}
