import { clsx } from 'clsx'
import { InfoTooltip } from './InfoTooltip'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
}

function getScoreColor(score: number) {
  if (score >= 70) return { text: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' }
  if (score >= 40) return { text: '#facc15', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)' }
  return { text: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' }
}

function getSentimentColor(score: number) {
  if (score >= 70) return { text: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' }
  if (score >= 40) return { text: '#facc15', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)' }
  return { text: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' }
}

export function RiskBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const color = getScoreColor(score)
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : size === 'lg' ? 'text-base px-3 py-1.5' : 'text-sm px-2 py-1'

  return (
    <span
      className={clsx('rounded-md font-semibold inline-flex items-center gap-1', sizeClass)}
      style={{ color: color.text, background: color.bg, border: `1px solid ${color.border}` }}
    >
      {showLabel && <span className="opacity-60 font-normal text-xs">Risk</span>}
      {score}
      <InfoTooltip
        title="Risk Score"
        definition="Composite churn risk score (0–100). Higher = more at risk. Combines login frequency drops, support ticket volume, stakeholder departures, and engagement decline."
        sources={['Salesforce', 'ServiceNow', 'MS Teams']}
      />
    </span>
  )
}

export function SentimentBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const color = getSentimentColor(score)
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : size === 'lg' ? 'text-base px-3 py-1.5' : 'text-sm px-2 py-1'

  return (
    <span
      className={clsx('rounded-md font-semibold inline-flex items-center gap-1', sizeClass)}
      style={{ color: color.text, background: color.bg, border: `1px solid ${color.border}` }}
    >
      {showLabel && <span className="opacity-60 font-normal text-xs">Sentiment</span>}
      {score}
      <InfoTooltip
        title="Sentiment Score"
        definition="Stakeholder sentiment and relationship health (0–100). Higher = more positive. Derived from email tone analysis, meeting attendance, response latency, and NPS signals."
        sources={['Email', 'MS Teams', 'Salesforce']}
      />
    </span>
  )
}

export function DataHealthBadge({ score, size = 'md', showLabel = true }: ScoreBadgeProps) {
  const color = getSentimentColor(score)
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : size === 'lg' ? 'text-base px-3 py-1.5' : 'text-sm px-2 py-1'

  return (
    <span
      className={clsx('rounded-md font-semibold inline-flex items-center gap-1', sizeClass)}
      style={{ color: color.text, background: color.bg, border: `1px solid ${color.border}` }}
    >
      {showLabel && <span className="opacity-60 font-normal text-xs">Data</span>}
      {score}
      <InfoTooltip
        title="Data Health Score"
        definition="Completeness and freshness of account data in CRM (0–100). Higher = healthier. Low scores indicate gaps in contact records, activity logs, or usage data that limit AI accuracy."
        sources={['Salesforce', 'Internal Jira']}
      />
    </span>
  )
}

interface PriorityBadgeProps {
  priority: string
}

const priorityInfo: Record<string, { definition: string }> = {
  P0: { definition: 'Critical — immediate intervention required within 48 hours. Account shows multiple churn signals. Risk of significant ARR loss if not addressed.' },
  P1: { definition: 'Elevated risk — proactive outreach needed within 1–2 weeks. One or more concerning signals detected but no immediate churn trigger.' },
  P2: { definition: 'Monitor — low immediate risk. Stable but requires ongoing attention. No urgent action required at this time.' },
  expand: { definition: 'Expansion ready — account is healthy with high adoption, positive sentiment, and available whitespace for upsell or cross-sell.' },
  maintain: { definition: 'Maintain — account is stable and in good standing. Focus on relationship depth and renewal preparation.' },
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config: Record<string, { text: string; bg: string; border: string; label: string }> = {
    P0: { text: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', label: '🚨 P0' },
    P1: { text: '#facc15', bg: 'rgba(250,204,21,0.12)', border: 'rgba(250,204,21,0.3)', label: '⚠️ P1' },
    P2: { text: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', label: '📋 P2' },
    expand: { text: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)', label: '🚀 Expand' },
    maintain: { text: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', label: '✅ Maintain' },
  }
  const c = config[priority] || config.maintain
  const info = priorityInfo[priority]
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1"
      style={{ color: c.text, background: c.bg, border: `1px solid ${c.border}` }}
    >
      {c.label}
      {info && (
        <InfoTooltip
          title={`Priority: ${c.label}`}
          definition={info.definition}
        />
      )}
    </span>
  )
}
