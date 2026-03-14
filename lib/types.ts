export type RiskLevel = 'critical' | 'elevated' | 'moderate' | 'low'
export type HealthStatus = 'red' | 'yellow' | 'green'
export type Priority = 'P0' | 'P1' | 'P2' | 'expand' | 'maintain'

export interface ValueSnapshot {
  technicalSignal: string
  businessOutcome: string
  outcomeCategory: 'Risk Mitigation' | 'Revenue Impact' | 'Efficiency Gain' | 'Compliance' | 'Operational'
  dollarValue?: string
  sources: string[]
  confidence: 'high' | 'moderate' | 'low'
}

export interface ScopeDrift {
  description: string
  sowReference: string
  source: string
  flaggedDaysAgo: number
}

export interface BlockerMatch {
  blocker: string
  solution: string
  resolvedBy: string
  matchConfidence: number
}

export interface RedFlagSignal {
  type: 'silent' | 'cold' | 'critical'
  description: string
  daysSinceContact: number
  lastTone: string
}

export interface MspTurningPoint {
  marginContribution: number        // % of MRR that's pure profit beyond cost-to-serve
  status: 'above' | 'at' | 'below' // relative to the turning point threshold
  note: string                      // brief explanation
}

export interface Account {
  id: string
  name: string
  industry: string
  arr: number
  health: HealthStatus
  riskScore: number
  sentimentScore: number
  dataHealthScore: number
  profileCompleteness: number
  priority: Priority
  renewalMonths?: number
  keySignals: string[]
  expansionPotential?: { low: number; high: number }
  notes: string
  mspTurningPoint?: MspTurningPoint
  valueSnapshot?: ValueSnapshot
  scopeDrift?: ScopeDrift
  blockerMatch?: BlockerMatch
  redFlagSignal?: RedFlagSignal
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  confidence?: 'high' | 'moderate' | 'low'
  dataGaps?: string[]
  timestamp: Date
}

export interface Source {
  name: string
  type: 'crm' | 'support' | 'communication' | 'research' | 'internal'
}

export interface FeedbackOption {
  id: string
  label: string
}
