// Owner's Index scoring - per Diagnostic Implementation Brief, May 2026
// New methodology:
//   - dimension = ((sum_4_inverted_answers - 4) / 16) * 10
//     equivalent from pole averages: ((20 - 2*(poleA + poleB)) / 16) * 10
//   - Founder Dependency Score = average of 4 dimensions
//   - Watermark Strength = stdev of 4 dimensions scaled by /5.0 to 0-10
// Bands: Low (0-3.3), Moderate (3.4-6.6), High (6.7-10)

export interface RadarScores {
  intuitive: number
  analytical: number
  proactive: number
  reactive: number
  collaborative: number
  directive: number
  cognitive: number
  spiritual_purpose: number
  readiness_score?: number
}

export interface OwnerDimension {
  key: 'process' | 'information' | 'decision' | 'energy' | 'taste'
  label: string
  score: number          // 0-10
  levelLabel: string
  pillars: string[]
  isProtect: boolean     // true = Taste (higher = good), false = dependency (higher = problem)
}

export interface OwnerScores {
  process: number
  information: number
  decision: number
  energy: number
  taste: number
  founderDependencyScore: number   // avg of process, information, decision, energy
  watermarkStrength: number        // stdev of 4 dimensions scaled to 0-10
  dimensions: OwnerDimension[]
}

// Band labels per brief
function dependencyLabel(score: number): string {
  if (score >= 6.7) return 'High Dependency'
  if (score >= 3.4) return 'Moderate Dependency'
  return 'Low Dependency'
}

function watermarkLabel(score: number): string {
  if (score >= 6.7) return 'Defined Watermark'
  if (score >= 3.4) return 'Emerging Watermark'
  return 'Undefined Watermark'
}

// Compute a single dependency dimension from its two pole averages using the new formula
// pole averages are 1-5; sum of two poles is 2-10
// new dimension = ((20 - 2*(poleA + poleB)) / 16) * 10
function dimFromPoles(poleA: number, poleB: number): number {
  const raw = ((20 - 2 * (poleA + poleB)) / 16) * 10
  return Math.max(0, Math.min(10, raw))
}

export function computeOwnerScores(radar: RadarScores): OwnerScores {
  // Pairs per brief:
  // Process: cognitive + intuitive
  // Information: reactive + collaborative
  // Decision: directive + proactive
  // Energy: spiritual_purpose + analytical
  const process     = dimFromPoles(radar.cognitive, radar.intuitive)
  const information = dimFromPoles(radar.reactive, radar.collaborative)
  const decision    = dimFromPoles(radar.directive, radar.proactive)
  const energy      = dimFromPoles(radar.spiritual_purpose, radar.analytical)

  const founderDependencyScore = parseFloat(((process + information + decision + energy) / 4).toFixed(1))

  // Watermark Strength: prefer the stored value (set by scoreOwnerResponses via readiness_score),
  // otherwise compute from dimension spread.
  let watermarkStrength: number
  if (typeof radar.readiness_score === 'number') {
    watermarkStrength = radar.readiness_score
  } else {
    const dims = [process, information, decision, energy]
    const mean = (process + information + decision + energy) / 4
    const variance = dims.reduce((s, d) => s + Math.pow(d - mean, 2), 0) / dims.length
    const stdev = Math.sqrt(variance)
    watermarkStrength = Math.min(10, (stdev / 5.0) * 10)
  }
  watermarkStrength = parseFloat(watermarkStrength.toFixed(1))

  const taste = watermarkStrength

  const dimensions: OwnerDimension[] = [
    {
      key: 'process',
      label: 'Process Dependency',
      score: process,
      levelLabel: dependencyLabel(process),
      pillars: ['O1 - Free Yourself', 'O2 - Make It Repeatable'],
      isProtect: false,
    },
    {
      key: 'information',
      label: 'Information Dependency',
      score: information,
      levelLabel: dependencyLabel(information),
      pillars: ['O3 - Write Your Recipe', 'O4 - Make It Visible'],
      isProtect: false,
    },
    {
      key: 'decision',
      label: 'Decision Dependency',
      score: decision,
      levelLabel: dependencyLabel(decision),
      pillars: ['O5 - Raise The Average', "O6 - Don't Apologise"],
      isProtect: false,
    },
    {
      key: 'energy',
      label: 'Energy Dependency',
      score: energy,
      levelLabel: dependencyLabel(energy),
      pillars: ['O7 - Subtract To Scale', 'O8 - No Loose Ends'],
      isProtect: false,
    },
    {
      key: 'taste',
      label: 'Taste - Watermark Strength',
      score: taste,
      levelLabel: watermarkLabel(taste),
      pillars: ['O9 - Your Watermark'],
      isProtect: true,
    },
  ]

  return { process, information, decision, energy, taste, founderDependencyScore, watermarkStrength, dimensions }
}

// Subtext labels for top headline cards (per brief)
export function founderDependencyLabel(score: number): string {
  if (score >= 6.7) return 'High dependency'
  if (score >= 3.4) return 'Moderate dependency'
  return 'Highly extractable'
}

export function watermarkStrengthLabel(score: number): string {
  if (score >= 6.7) return 'Defined watermark'
  if (score >= 3.4) return 'Emerging watermark'
  return 'Undefined watermark'
}
