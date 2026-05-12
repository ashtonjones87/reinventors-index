// Owner's Index scoring - derived from Mindset radar pole scores
// Each pole is 0–5 (averaged from 2 questions). Pairs sum to 0–10.

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
  score: number          // 0–10
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
  watermarkStrength: number        // = taste
  dimensions: OwnerDimension[]
}

function dependencyLabel(score: number): string {
  if (score >= 7) return 'High Dependency'
  if (score >= 4) return 'Moderate Dependency'
  return 'Low Dependency'
}

function watermarkLabel(score: number): string {
  if (score >= 7) return 'Strong Watermark'
  if (score >= 4) return 'Defined Watermark'
  return 'Emerging Watermark'
}

export function computeOwnerScores(radar: RadarScores): OwnerScores {
  const process     = Math.min(10, Math.max(0, 10 - (radar.cognitive + radar.intuitive)))
  const information = Math.min(10, Math.max(0, 10 - (radar.reactive + radar.collaborative)))
  const decision    = Math.min(10, Math.max(0, 10 - (radar.directive + radar.proactive)))
  const energy      = Math.min(10, Math.max(0, 10 - (radar.spiritual_purpose + radar.analytical)))
  const taste       = radar.readiness_score ?? 5

  const founderDependencyScore = parseFloat(((process + information + decision + energy) / 4).toFixed(1))
  const watermarkStrength = taste

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
      pillars: ['O5 - Raise The Average', 'O6 - Don\'t Apologise'],
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

export function founderDependencyLabel(score: number): string {
  if (score >= 7) return 'High dependency'
  if (score >= 4) return 'Moderate dependency'
  return 'Highly extractable'
}

export function watermarkStrengthLabel(score: number): string {
  if (score >= 7) return 'Strong watermark'
  if (score >= 4) return 'Defined watermark'
  return 'Emerging watermark'
}
