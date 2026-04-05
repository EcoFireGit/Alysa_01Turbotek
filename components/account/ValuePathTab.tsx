'use client'

import {
  Building2, Users, Target, Zap, Handshake,
  Activity, TrendingUp, Sparkles,
} from 'lucide-react'
import { AccountData } from '@/lib/types'
import { InfoTooltip } from '@/components/InfoTooltip'
import { StrategicAlignmentWorkspace } from './StrategicAlignmentWorkspace'

// ── Source helpers ────────────────────────────────────────────────────────────

const SOURCE_KEYWORDS: { keyword: string; label: string; color: string }[] = [
  { keyword: 'linkedin',      label: 'LinkedIn',       color: '#0a66c2' },
  { keyword: 'fathom',        label: 'Fathom',         color: '#7c3aed' },
  { keyword: 'it glue',       label: 'IT Glue',        color: '#f59e0b' },
  { keyword: 'thread ai',     label: 'Thread AI',      color: '#0ea5e9' },
  { keyword: 'thread',        label: 'Thread AI',      color: '#0ea5e9' },
  { keyword: 'kaseya',        label: 'Kaseya RMM',     color: '#16a34a' },
  { keyword: 'autotask',      label: 'Autotask PSA',   color: '#f97316' },
  { keyword: 'public record', label: 'Public Record',  color: '#94a3b8' },
  { keyword: 'nps',           label: 'NPS Survey',     color: '#8b5cf6' },
  { keyword: 'connectwise',   label: 'ConnectWise',    color: '#e11d48' },
]

function parseSources(text: string) {
  const lower = text.toLowerCase()
  const seen = new Set<string>()
  return SOURCE_KEYWORDS.filter(s => {
    if (lower.includes(s.keyword) && !seen.has(s.label)) { seen.add(s.label); return true }
    return false
  })
}

function SourceTag({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
      style={{ background: color + '18', color, border: `1px solid ${color}33`, fontSize: '10px' }}>
      {label}
    </span>
  )
}

// ── Industry profiles ─────────────────────────────────────────────────────────

const INDUSTRY_PROFILES: Record<string, {
  segment: string
  valueProposition: string
  keyActivities: string[]
}> = {
  'Legal': {
    segment: 'Individuals, businesses, and institutions requiring legal counsel, representation, contract management, and compliance guidance.',
    valueProposition: 'Delivering expert legal outcomes that protect client rights, minimise liability, and enable confident business decisions in a secure and confidential environment.',
    keyActivities: ['Matter intake and case management', 'Document drafting, review, and e-discovery', 'Client communication and billing', 'Court filings and regulatory compliance'],
  },
  'Healthcare': {
    segment: 'Patients, insurers, and healthcare networks requiring clinical care, diagnostics, billing, and compliance-driven health record management.',
    valueProposition: 'Providing quality patient care while maintaining regulatory compliance, protecting PHI, and enabling clinical teams to operate efficiently across locations.',
    keyActivities: ['Patient scheduling and clinical care delivery', 'EHR documentation and billing', 'HIPAA-compliant data management', 'Insurance claims and prior authorisations'],
  },
  'Manufacturing': {
    segment: 'OEM partners, distributors, and enterprise buyers requiring fabricated components, assemblies, or finished goods with reliable lead times.',
    valueProposition: 'Delivering high-quality manufactured output on-time through efficient production operations, quality control, and supply chain resilience.',
    keyActivities: ['Production scheduling and floor operations', 'Inventory and supply chain management', 'Quality assurance and compliance', 'Customer order fulfilment and logistics'],
  },
  'Financial Services': {
    segment: 'Individuals and businesses requiring banking, investment advisory, insurance, or lending services with regulatory transparency.',
    valueProposition: 'Growing and protecting client wealth through compliant, trusted financial products while meeting strict regulatory reporting obligations.',
    keyActivities: ['Client portfolio and account management', 'Regulatory reporting and compliance', 'Transaction processing and reconciliation', 'Risk assessment and product advisory'],
  },
  'Technology': {
    segment: 'Businesses and consumers requiring software products, IT services, or digital transformation support.',
    valueProposition: 'Accelerating client digital outcomes through innovative technology, fast delivery cycles, and reliable support ecosystems.',
    keyActivities: ['Product development and release management', 'Customer onboarding and technical support', 'Infrastructure operations and uptime management', 'Sales engineering and solution design'],
  },
  'Construction': {
    segment: 'Property developers, municipalities, and general contractors requiring construction, engineering, and project management services.',
    valueProposition: 'Delivering safe, on-budget construction projects through disciplined project management, skilled labour, and compliant materials sourcing.',
    keyActivities: ['Project planning and scheduling', 'Subcontractor and materials management', 'On-site safety and compliance', 'Client reporting and milestone sign-off'],
  },
  'Professional Services': {
    segment: 'Businesses and institutions requiring specialised consulting, advisory, or managed service expertise.',
    valueProposition: 'Enabling client outcomes through specialised expertise, accountable delivery, and long-term advisory relationships.',
    keyActivities: ['Engagement scoping and delivery management', 'Subject matter expertise and deliverable production', 'Client QBRs and relationship management', 'Hiring and capability development'],
  },
}

function getIndustryProfile(industry: string) {
  for (const key of Object.keys(INDUSTRY_PROFILES)) {
    if (industry.toLowerCase().includes(key.toLowerCase())) return INDUSTRY_PROFILES[key]
  }
  return INDUSTRY_PROFILES['Professional Services']
}

// ── Sentiment badge ───────────────────────────────────────────────────────────

const SENTIMENT_COLORS: Record<string, string> = {
  Champion:  '#4ade80',
  Advocate:  '#86efac',
  Neutral:   '#facc15',
  Detractor: '#f87171',
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const color = SENTIMENT_COLORS[sentiment] ?? '#94a3b8'
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: color + '22', color, border: `1px solid ${color}44` }}>
      {sentiment}
    </span>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ number, icon, title, subtitle, children, isLast = false }: {
  number: number; icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode; isLast?: boolean
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Step {number}
            </span>
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-hover)' }}>{title}</h3>
        </div>
      </div>
      <p className="text-xs mb-4 ml-11" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      <div className="ml-11">{children}</div>
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl p-4"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${accent ? accent + '44' : 'var(--border-subtle)'}`,
      }}>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ValuePathTab({ account }: { account: AccountData }) {
  const profile = getIndustryProfile(account.industry)



  // MRR calculation
  const mrrValue = (() => {
    const raw = account.arr.replace(/[^0-9.]/g, '')
    const isK = account.arr.toLowerCase().includes('k')
    const annual = parseFloat(raw) * (isK ? 1000 : 1)
    const mrr = Math.round(annual / 12)
    return mrr >= 1000 ? `$${(mrr / 1000).toFixed(1)}K/mo` : `$${mrr}/mo`
  })()

  const snapshotMetrics = [
    {
      label: 'MRR',
      value: mrrValue,
      tooltip: 'Monthly Recurring Revenue — ARR divided by 12. Represents your predictable monthly billing for this account.',
      color: 'var(--accent)',
    },
    {
      label: 'Health Score',
      value: String(account.health),
      tooltip: 'Composite score (0–100) derived from ticket satisfaction, NPS responses, meeting engagement, and churn signals.',
      color: account.health >= 70 ? '#4ade80' : account.health >= 40 ? '#facc15' : '#f87171',
    },
    {
      label: 'Wallet Share',
      value: `${account.walletShare}%`,
      tooltip: 'Estimated percentage of the client\'s total IT spend managed by Turbotek vs. other vendors.',
      color: account.walletShare >= 60 ? '#4ade80' : account.walletShare >= 35 ? '#facc15' : '#f87171',
    },
    {
      label: 'Renewal',
      value: account.renewal,
      tooltip: 'Date when the primary MSP agreement is up for renewal. Plan re-engagement 90 days prior.',
      color: 'var(--text-primary)',
    },
    {
      label: 'Profile',
      value: `${account.profileCompleteness}%`,
      tooltip: 'How complete the account profile is. Below 50% means gaps in goals, stakeholders, or environment data that reduce recommendation quality.',
      color: account.profileCompleteness >= 70 ? '#4ade80' : account.profileCompleteness >= 50 ? '#facc15' : '#f87171',
    },
    {
      label: 'Budget Band',
      value: account.budgetBand,
      tooltip: 'Estimated total annual IT spend across all vendors. Used to gauge whitespace and wallet share opportunity.',
      color: 'var(--text-secondary)',
    },
  ]

  // Key partners from tech stack
  const ourPartners = account.techStackDetails.filter(t => t.isOurWalletShare)
  const externalPartners = account.techStackDetails.filter(t => !t.isOurWalletShare)

  return (
    <div className="max-w-5xl mx-auto py-2">

      {/* ── SECTION 1: Account Baseline ── */}
      <Section
        number={1}
        icon={<Activity className="w-4 h-4" />}
        title="Account Baseline"
        subtitle="Key account metrics at a glance — the foundation for every value conversation."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {snapshotMetrics.map(m => (
            <Card key={m.label}>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                <InfoTooltip title={m.label} definition={m.tooltip} />
              </div>
              <div className="text-lg font-bold truncate" style={{ color: m.color }}>{m.value}</div>
            </Card>
          ))}
        </div>

        {/* Status bullet */}
        <div className="rounded-lg px-4 py-3 flex items-start gap-2"
          style={{ background: 'var(--accent-bg-soft, rgba(87,94,207,0.07))', border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.18))' }}>
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{account.statusBullet}</p>
        </div>
      </Section>

      {/* ── SECTION 2: Client Business Summary ── */}
      <Section
        number={2}
        icon={<Building2 className="w-4 h-4" />}
        title="Client Business Summary"
        subtitle="Who the client is, who they serve, and how their business operates — context that sharpens every recommendation."
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Stakeholder Map — spans full height on left */}
          <div className="lg:col-span-1">
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-hover)' }}>Stakeholder Map</span>
              </div>
              <div className="flex flex-col gap-3">
                {account.stakeholders.map(s => {
                  const sentColor = SENTIMENT_COLORS[s.sentiment] ?? '#94a3b8'
                  const signals = account.satisfactionSignals
                  const sourceData = parseSources(signals.join(' '))
                  return (
                    <div key={s.name} className="flex flex-col gap-1 pb-3"
                      style={{ borderBottom: '1px solid var(--border-faint)' }}>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{s.name}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.role}</div>
                        </div>
                        <SentimentBadge sentiment={s.sentiment} />
                      </div>
                      {sourceData.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>via</span>
                          {sourceData.map(src => <SourceTag key={src.label} label={src.label} color={src.color} />)}
                        </div>
                      )}
                      <div className="text-xs mt-1 p-2 rounded"
                        style={{ background: sentColor + '0f', color: 'var(--text-secondary)', border: `1px solid ${sentColor}22` }}>
                        {s.sentiment === 'Champion'  && 'Strong advocate — involve in QBR and expansion conversations.'}
                        {s.sentiment === 'Advocate'  && 'Supportive — keep engaged and feed with outcome data.'}
                        {s.sentiment === 'Neutral'   && 'Disengaged or non-responsive — prioritise re-engagement with value proof.'}
                        {s.sentiment === 'Detractor' && 'At-risk relationship — address concerns directly and escalate if unresolved.'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          {/* Right column: 4 business model panels */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Client Segment */}
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 flex-shrink-0" style={{ color: '#a5b4fc' }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-hover)' }}>Client Segment</span>
                <InfoTooltip title="Client Segment" definition="Who the client's business ultimately serves — their end customers and market." />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>{account.industry} · </span>
                {profile.segment}
              </p>
            </Card>

            {/* Value Proposition */}
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: '#facc15' }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-hover)' }}>Client's Value Proposition</span>
                <InfoTooltip title="Value Proposition" definition="The core promise the client delivers to their customers — what keeps their business relevant and competitive." />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile.valueProposition}</p>
              {account.businessGoals.slice(0, 1).map((g, i) => (
                <div key={i} className="mt-2 text-xs px-3 py-2 rounded-lg"
                  style={{ background: 'var(--accent-bg-soft, rgba(87,94,207,0.07))', color: 'var(--text-muted)', border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.15))' }}>
                  Top stated goal: &quot;{g}&quot;
                </div>
              ))}
            </Card>

            {/* Key Activities */}
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 flex-shrink-0" style={{ color: '#4ade80' }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-hover)' }}>Key Activities</span>
                <InfoTooltip title="Key Activities" definition="The critical operational activities the client must execute well to deliver on their value proposition." />
              </div>
              <ul className="flex flex-col gap-1.5">
                {profile.keyActivities.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#4ade80' }} />
                    {a}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Key Partners */}
            <Card>
              <div className="flex items-center gap-2 mb-2">
                <Handshake className="w-4 h-4 flex-shrink-0" style={{ color: '#f97316' }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-hover)' }}>Key Partners</span>
                <InfoTooltip title="Key Partners" definition="Technology vendors and service partners the client relies on to operate — tracked from IT Glue, Autotask, and environment scans." />
              </div>
              <div className="flex flex-col gap-2">
                {ourPartners.length > 0 && (
                  <div>
                    <div className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>Turbotek-Managed</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ourPartners.map(p => (
                        <span key={p.name} className="text-xs px-2 py-1 rounded-lg font-medium"
                          style={{ background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {externalPartners.length > 0 && (
                  <div>
                    <div className="text-xs mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>External / Not Under Management</div>
                    <div className="flex flex-wrap gap-1.5">
                      {externalPartners.map(p => (
                        <span key={p.name} className="text-xs px-2 py-1 rounded-lg font-medium"
                          style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {ourPartners.length === 0 && externalPartners.length === 0 && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No tech stack data recorded yet.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* ── SECTION 3 ── */}
      <StrategicAlignmentWorkspace account={account} />

    </div>
  )
}
