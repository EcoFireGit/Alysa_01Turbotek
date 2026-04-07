export interface Stakeholder {
  name: string
  role: string
  sentiment: 'Champion' | 'Advocate' | 'Neutral' | 'Detractor'
}

export interface GapRow {
  goal: string
  currentReality: string
  gap: string
  impact: string
  recommendation: string
  confidence: 'High' | 'Medium' | 'Low'
  exposeToClient: boolean
  whyTiming: 'Quick Win' | 'Next Quarter' | 'Long-term'
  estimatedValue: number
  outcomeType: 'Risk Reduction' | 'Productivity Gain' | 'Strategic Alignment' | 'Compliance'
}

export interface IndustryResearch {
  finding: string
  source: string
  year: string
  relevance: string
}

export interface Play {
  title: string
  owner: string
  steps: string[]
  targetOutcome: string
  nextTouchpoint: string
  status: 'Not Started' | 'In Progress' | 'Done'
}

export interface ExpansionOpp {
  product: string
  potential: string
  confidence: 'High' | 'Medium' | 'Low'
  reason: string
}

export interface Outcome {
  recommendation: string
  accurate: boolean | null
  result: 'Saved Cost' | 'De-risked Renewal' | 'Expansion Booked' | 'Improved Satisfaction' | null
  note: string
  sourceGapIndex?: number
  sourcePlayIndex?: number
}

export interface InferredItem {
  category: string
  inference: string
  confidence: number
  confirmed: boolean | null
}

export interface TechStackItem {
  name: string
  category: string
  isOurWalletShare: boolean
  confidence: 'Confirmed' | 'High' | 'Medium' | 'Low'
  competingVendors?: string[]
  sources: string[]
}

export interface AccountData {
  id: string
  name: string
  health: number
  arr: string
  stage: 'Healthy' | 'Monitor' | 'At Risk'
  renewal: string
  industry: string
  profileCompleteness: number
  walletShare: number
  topPriorities: string[]
  nextBestConversation: string
  stakeholders: Stakeholder[]
  businessGoals: string[]
  constraints: string[]
  currentEnvironment: string[]
  riskPosture: string[]
  renewalDates: { vendor: string; date: string }[]
  satisfactionSignals: string[]
  budgetBand: string
  recentIntel: string[]
  inferences: InferredItem[]
  techStack: string[]
  techStackDetails: TechStackItem[]
  expansionOpps: ExpansionOpp[]
  customerSaid: string[]
  customerSaidMeta?: { source: string; timestamp: string }[]
  weObserved: string[]
  weInfer: string[]
  gapRows: GapRow[]
  narrative: string
  plays: Play[]
  discoveryPlays: { title: string; template: string }[]
  businessOutcomes: { metric: string; before: string; after: string; impact: string }[]
  qbrPriorities: string[]
  qbrDelivered: string[]
  qbrRisks: string[]
  qbrOpportunities: string[]
  qbrNextSteps: string[]
  industryInsights: string[]
  industryResearch?: IndustryResearch[]
  stickinessSignals?: string[]
  outcomes: Outcome[]
  ticketsClosed?: { month: string; value: number }[]
  threatsDetected?: { month: string; value: number }[]
  statusBullet: string
}

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
