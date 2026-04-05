'use client'

import { useReducer, useCallback } from 'react'
import {
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Download,
  Printer,
  Pencil,
  Check,
  X,
  ChevronRight,
  Circle,
} from 'lucide-react'
import { useRef } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import { AccountData, GapRow } from '@/lib/types'
import { useWorkspace } from './WorkspaceContext'

// ── Types ──────────────────────────────────────────────────────────────────────

type PanelFields = Record<string, string>
type ReportState = Record<string, PanelFields>
type Action = { type: 'EDIT'; panel: string; field: string; value: string }

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCurrentQuarter(): string {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `Q${q} ${now.getFullYear()}`
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function stripQbrPrefix(s: string): string {
  return s.replace(/^QSR\s+Q?\d[^:]*:\s*/i, '').replace(/\s*\([^)]*\)\s*$/, '').trim()
}

function goalMatchesGapRow(goalText: string, row: GapRow): boolean {
  return (
    row.goal === goalText ||
    goalText.toLowerCase().includes(row.goal.toLowerCase().slice(0, 20)) ||
    row.goal.toLowerCase().includes(goalText.toLowerCase().slice(0, 20))
  )
}

function timingLabel(t: GapRow['whyTiming']) {
  if (t === 'Quick Win') return { label: 'Quick Win', color: '#4ade80' }
  if (t === 'Next Quarter') return { label: 'Next Quarter', color: '#facc15' }
  return { label: 'Roadmap', color: '#818cf8' }
}

// ── State ─────────────────────────────────────────────────────────────────────

function buildCeoOutcomes(account: AccountData): string[] {
  const tickets = account.ticketsClosed ?? []
  const threats = account.threatsDetected ?? []
  const outcomes: string[] = []

  const totalTickets = tickets.reduce((s, t) => s + t.value, 0)
  const totalThreats = threats.reduce((s, t) => s + t.value, 0)

  // Productivity / uptime outcome
  if (totalTickets > 0) {
    const workDays = tickets.length * 20
    const estimatedDaysProtected = workDays - Math.ceil((totalTickets * 2) / 8)
    outcomes.push(
      `Your business ran without IT interruption for approximately ${estimatedDaysProtected} of ${workDays} working days this quarter`
    )
  }

  // Security outcome
  if (totalThreats > 0) {
    outcomes.push(
      `${totalThreats} cyber threats were identified and blocked before reaching your team or data`
    )
  } else if (threats.length > 0) {
    outcomes.push(`Your environment ran threat-free throughout the quarter — zero security incidents detected`)
  }

  // Trend outcome
  const firstHalf = tickets.slice(0, Math.floor(tickets.length / 2))
  const secondHalf = tickets.slice(Math.floor(tickets.length / 2))
  if (firstHalf.length > 0 && secondHalf.length > 0) {
    const fAvg = firstHalf.reduce((s, t) => s + t.value, 0) / firstHalf.length
    const sAvg = secondHalf.reduce((s, t) => s + t.value, 0) / secondHalf.length
    if (fAvg > 0 && sAvg < fAvg) {
      const pct = Math.round(((fAvg - sAvg) / fAvg) * 100)
      outcomes.push(
        `IT issue volume dropped by ${pct}% compared to the prior period — your team experienced fewer disruptions`
      )
    }
  }

  return outcomes
}

function buildInitialState(account: AccountData): ReportState {
  const wins = account.qbrDelivered.slice(0, 5).map(stripQbrPrefix)
  const clientRecs = account.gapRows.filter(r => r.exposeToClient)
  const ceoOutcomes = buildCeoOutcomes(account)

  return {
    header: {
      title: `${account.name} — Quarterly Strategy Review`,
      date: getFormattedDate(),
      attendees: account.stakeholders.map(s => s.name).join(', '),
      preparedBy: 'Turbotek',
    },
    delivered: Object.fromEntries([
      ['intro', `Key outcomes delivered this quarter for ${account.name}.`],
      ...wins.map((w, i) => [`item_${i}`, w]),
      ...account.businessOutcomes.slice(0, wins.length).map((o, i) => [`impact_${i}`, o.impact]),
      ...ceoOutcomes.map((o, i) => [`ceo_${i}`, o]),
    ]),
    goals: Object.fromEntries([
      ['intro', 'Strategic priorities guiding our work together.'],
      ...account.businessGoals.map((g, i) => [`goal_${i}`, g]),
    ]),
    recommendations: Object.fromEntries([
      ['intro', 'Recommended actions to strengthen your technology foundation.'],
      ...clientRecs.map((r, i) => [`rec_${i}`, r.recommendation]),
      ...clientRecs.map((r, i) => [`case_${i}`, r.impact]),
    ]),
    opportunities: Object.fromEntries([
      ['intro', 'Investments with the highest impact for your business right now.'],
      ...account.expansionOpps.map((o, i) => [`opp_${i}`, o.product]),
      ...account.expansionOpps.map((o, i) => [`value_${i}`, o.potential]),
      ...account.expansionOpps.map((o, i) => [`reason_${i}`, o.reason]),
    ]),
    beforeafter: Object.fromEntries([
      ['intro', `A snapshot of where we started and the measurable progress made this quarter.`],
      ...account.businessOutcomes.map((o, i) => [`metric_${i}`, o.metric]),
      ...account.businessOutcomes.map((o, i) => [`before_${i}`, o.before]),
      ...account.businessOutcomes.map((o, i) => [`after_${i}`, o.after]),
      ...account.businessOutcomes.map((o, i) => [`impact_${i}`, o.impact]),
    ]),
    nextsteps: {
      intro: 'Agreed actions and upcoming milestones for the coming quarter.',
      step_0: 'Send CSACT Survey',
      step_1: `Introduction to new CIO — ${account.stakeholders.find(s => /cio|cto|vp|director|chief/i.test(s.role))?.name ?? 'schedule TBD'}`,
      step_2: 'Send invitation to Turbotek Client Conference',
      step_3: `Proof of Concept — ${account.gapRows.filter(r => r.exposeToClient)[0]?.recommendation.split(' ').slice(0, 6).join(' ') ?? 'next technical initiative'}`,
      step_4: account.qbrNextSteps.find(s => !/sign|contract|agreement|renew/i.test(s)) ?? '',
    },
  }
}

function reducer(state: ReportState, action: Action): ReportState {
  return {
    ...state,
    [action.panel]: { ...state[action.panel], [action.field]: action.value },
  }
}

// ── Inline editable text ───────────────────────────────────────────────────────

function EditableText({
  value,
  onChange,
  multiline = false,
  style,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  style?: React.CSSProperties
  placeholder?: string
}) {
  const [editing, setEditing] = useReducer((_: boolean, v: boolean) => v, false)
  const [draft, setDraft] = useReducer((_: string, v: string) => v, value)
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  function startEdit() { setDraft(value); setEditing(true); setTimeout(() => ref.current?.focus(), 30) }
  function commit() { onChange(draft); setEditing(false) }
  function cancel() { setDraft(value); setEditing(false) }

  if (editing) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 4, width: '100%' }}>
        {multiline ? (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) commit(); if (e.key === 'Escape') cancel() }}
            rows={3}
            style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 4, padding: '4px 8px', fontSize: 'inherit', color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, ...style }}
          />
        ) : (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel() }}
            style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--accent)', borderRadius: 4, padding: '3px 8px', fontSize: 'inherit', color: 'var(--text-primary)', fontFamily: 'inherit', ...style }}
          />
        )}
        <button onClick={commit} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#4ade80', flexShrink: 0 }}><Check size={12} /></button>
        <button onClick={cancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#f87171', flexShrink: 0 }}><X size={12} /></button>
      </span>
    )
  }

  return (
    <span
      onClick={startEdit}
      title="Click to edit"
      style={{ cursor: 'text', display: 'inline-flex', alignItems: 'flex-start', gap: 4, borderRadius: 3, padding: '1px 3px', margin: '-1px -3px', transition: 'background 0.1s', ...style }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(87,94,207,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{placeholder ?? 'Click to edit…'}</span>}
      <Pencil size={10} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 3, opacity: 0.5 }} />
    </span>
  )
}

// ── Panel chrome ──────────────────────────────────────────────────────────────

type StatusColor = 'green' | 'yellow' | 'red' | 'blue' | 'neutral'

const STATUS: Record<StatusColor, string> = {
  green: '#4ade80',
  yellow: '#facc15',
  red: '#f87171',
  blue: '#818cf8',
  neutral: '#64748b',
}

function Panel({
  title,
  status = 'neutral',
  children,
  fullWidth = false,
}: {
  title: string
  status?: StatusColor
  children: React.ReactNode
  fullWidth?: boolean
}) {
  const color = STATUS[status]
  return (
    <div
      style={{
        gridColumn: fullWidth ? '1 / -1' : undefined,
        border: '1px solid var(--border-subtle)',
        borderTop: `3px solid ${color}`,
        borderRadius: '0 0 10px 10px',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          borderBottom: '1px solid var(--border-faint)',
          background: `${color}08`,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
          {title}
        </span>
      </div>

      {/* Panel body */}
      <div style={{ padding: '12px 14px', flex: 1 }}>
        {children}
      </div>
    </div>
  )
}

function BulletRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 7 }}>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)', marginTop: 6, flexShrink: 0 }} />
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.55, flex: 1 }}>{children}</span>
    </div>
  )
}

// ── Panels ────────────────────────────────────────────────────────────────────

function DeliveredPanel({ fields, dispatch, account }: { fields: PanelFields; dispatch: React.Dispatch<Action>; account: AccountData }) {
  const edit = (f: string) => (v: string) => dispatch({ type: 'EDIT', panel: 'delivered', field: f, value: v })
  const wins = account.qbrDelivered.slice(0, 5).map(stripQbrPrefix)
  const tickets = account.ticketsClosed ?? []
  const threats = account.threatsDetected ?? []

  const totalTickets = tickets.reduce((s, t) => s + t.value, 0)
  const totalThreats = threats.reduce((s, t) => s + t.value, 0)
  const latestMonth = tickets[tickets.length - 1]
  const prevMonth = tickets[tickets.length - 2]
  const ticketTrend = latestMonth && prevMonth ? latestMonth.value - prevMonth.value : 0

  // Derived business outcome stats from ticket + threat data
  const avgMonthlyResolution = tickets.length > 0
    ? Math.round(totalTickets / tickets.length)
    : 0
  const threatFreeMonths = threats.filter(t => t.value === 0).length
  const firstHalfAvg = tickets.length >= 4
    ? (tickets.slice(0, Math.floor(tickets.length / 2)).reduce((s, t) => s + t.value, 0) / Math.floor(tickets.length / 2))
    : null
  const secondHalfAvg = tickets.length >= 4
    ? (tickets.slice(Math.floor(tickets.length / 2)).reduce((s, t) => s + t.value, 0) / Math.ceil(tickets.length / 2))
    : null
  const resolutionImprovement = firstHalfAvg && secondHalfAvg && firstHalfAvg > 0
    ? Math.round(((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100)
    : null

  const CHART_TOOLTIP_STYLE = {
    background: 'var(--surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 8,
    fontSize: '0.72rem',
    color: 'var(--text-primary)',
  }

  return (
    <Panel title="Delivered This Quarter" status="green" fullWidth>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 16, fontStyle: 'italic' }}>
        <EditableText value={fields.intro} onChange={edit('intro')} style={{ fontSize: '0.72rem' }} />
      </p>

      {/* ── Stat cards row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
        {/* Tickets closed */}
        {tickets.length > 0 && (
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border-faint)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6 }}>Tickets Resolved</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80', lineHeight: 1 }}>{totalTickets}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {ticketTrend < 0 ? `↓ ${Math.abs(ticketTrend)} vs last month` : ticketTrend > 0 ? `↑ ${ticketTrend} vs last month` : 'Stable'}
            </div>
          </div>
        )}
        {/* Threats handled */}
        {threats.length > 0 && (
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border-faint)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6 }}>Threats Blocked</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171', lineHeight: 1 }}>{totalThreats}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>Over 6 months</div>
          </div>
        )}
        {/* Avg monthly resolution */}
        {avgMonthlyResolution > 0 && (
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border-faint)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6 }}>Avg. Monthly Resolution</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80', lineHeight: 1 }}>{avgMonthlyResolution}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>tickets / month</div>
          </div>
        )}
        {/* Threat-free months */}
        {threats.length > 0 && (
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border-faint)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6 }}>Threat-Free Months</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80', lineHeight: 1 }}>{threatFreeMonths}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>of {threats.length} months</div>
          </div>
        )}
        {/* Resolution improvement trend */}
        {resolutionImprovement !== null && (
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border-faint)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6 }}>Issue Volume Trend</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: resolutionImprovement >= 0 ? '#4ade80' : '#f87171', lineHeight: 1 }}>
              {resolutionImprovement >= 0 ? '↓' : '↑'}{Math.abs(resolutionImprovement)}%
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {resolutionImprovement >= 0 ? 'fewer issues vs prior period' : 'increase vs prior period'}
            </div>
          </div>
        )}
      </div>

      {/* ── Charts row ── */}
      {(tickets.length > 0 || threats.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: tickets.length > 0 && threats.length > 0 ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 20 }}>
          {tickets.length > 0 && (
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8 }}>Tickets Resolved — Monthly</div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={tickets} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={20} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: 'rgba(87,94,207,0.06)' }} />
                  <Bar dataKey="value" name="Tickets" radius={[4, 4, 0, 0]}>
                    {tickets.map((_, i) => (
                      <Cell key={i} fill={i === tickets.length - 1 ? '#4ade80' : '#5757CF'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {threats.length > 0 && (
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8 }}>Threats Blocked — Monthly</div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={threats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-faint)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={20} allowDecimals={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="value" name="Threats" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Win checklist ── */}
      <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: 14 }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 10 }}>Key Deliverables</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
          {wins.map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
              <CheckCircle2 size={12} style={{ color: '#4ade80', flexShrink: 0, marginTop: 3 }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.45, flex: 1 }}>
                <EditableText value={fields[`item_${i}`] ?? ''} onChange={edit(`item_${i}`)} style={{ fontSize: '0.78rem', fontWeight: 600 }} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}

function BeforeAfterPanel({ fields, dispatch, account }: { fields: PanelFields; dispatch: React.Dispatch<Action>; account: AccountData }) {
  const edit = (f: string) => (v: string) => dispatch({ type: 'EDIT', panel: 'beforeafter', field: f, value: v })
  const outcomes = account.businessOutcomes

  return (
    <Panel title="Progress Snapshot — Before & After" status="green" fullWidth>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12, fontStyle: 'italic' }}>
        <EditableText value={fields.intro} onChange={edit('intro')} style={{ fontSize: '0.72rem' }} />
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {outcomes.map((_, i) => (
          <div key={i} style={{ borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border-faint)', overflow: 'hidden' }}>
            {/* Metric label */}
            <div style={{ padding: '7px 12px', borderBottom: '1px solid var(--border-faint)', background: 'var(--accent-bg-soft)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <EditableText value={fields[`metric_${i}`] ?? ''} onChange={edit(`metric_${i}`)} style={{ fontSize: '0.7rem', fontWeight: 700 }} />
              </span>
            </div>
            {/* Before → After */}
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{ flex: 1, padding: '10px 12px', borderRight: '1px solid var(--border-faint)' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#f87171', marginBottom: 4 }}>Before</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <EditableText value={fields[`before_${i}`] ?? ''} onChange={edit(`before_${i}`)} style={{ fontSize: '0.82rem', fontWeight: 600 }} />
                </div>
              </div>
              <div style={{ flex: 1, padding: '10px 12px' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#4ade80', marginBottom: 4 }}>After</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <EditableText value={fields[`after_${i}`] ?? ''} onChange={edit(`after_${i}`)} style={{ fontSize: '0.82rem', fontWeight: 600 }} />
                </div>
              </div>
            </div>
            {/* Impact */}
            <div style={{ padding: '6px 12px 10px', borderTop: '1px solid var(--border-faint)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                <TrendingUp size={10} style={{ color: 'var(--accent)', marginTop: 3, flexShrink: 0 }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45, fontStyle: 'italic' }}>
                  <EditableText value={fields[`impact_${i}`] ?? ''} onChange={edit(`impact_${i}`)} style={{ fontSize: '0.72rem' }} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function GoalsPanel({ fields, dispatch }: { fields: PanelFields; dispatch: React.Dispatch<Action> }) {
  const edit = (f: string) => (v: string) => dispatch({ type: 'EDIT', panel: 'goals', field: f, value: v })
  const { state: ws } = useWorkspace()

  const allCovered = ws.goals.every(g => g.initiatives.some(i => i.projectIds.length > 0))
  const status: StatusColor = allCovered ? 'green' : 'yellow'

  return (
    <Panel title="Business Priorities" status={status}>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, fontStyle: 'italic' }}>
        <EditableText value={fields.intro} onChange={edit('intro')} style={{ fontSize: '0.72rem' }} />
      </p>
      {ws.goals.map((goal, i) => {
        const covered = goal.initiatives.some(init => init.projectIds.length > 0)
        // Collect mapped chip labels for this goal
        const mappedChips = goal.initiatives.flatMap(init =>
          init.projectIds.map(pid => ws.allChips.find(c => c.id === pid)).filter(Boolean)
        ) as typeof ws.allChips
        // Collect initiative texts
        const initiatives = goal.initiatives.filter(init => init.text)

        return (
          <div key={goal.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < ws.goals.length - 1 ? '1px solid var(--border-faint)' : 'none' }}>
            {/* Goal text */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 6 }}>
              {covered
                ? <CheckCircle2 size={12} style={{ color: '#4ade80', flexShrink: 0, marginTop: 3 }} />
                : <Circle size={12} style={{ color: '#facc15', flexShrink: 0, marginTop: 3 }} />
              }
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45, flex: 1 }}>
                {goal.text}
              </span>
            </div>
            {/* Initiative (alignment note) */}
            {initiatives.map(init => (
              <div key={init.id} style={{ marginLeft: 19, marginBottom: 5, fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600, marginRight: 4 }}>→</span>
                {init.text}
              </div>
            ))}
            {/* Mapped project chips */}
            {mappedChips.length > 0 && (
              <div style={{ marginLeft: 19, display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
                {mappedChips.map(chip => (
                  <span key={chip.id} style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 5, background: 'var(--accent-bg-soft)', color: 'var(--accent)', border: '1px solid var(--accent-border)', fontWeight: 500 }}>
                    {chip.label.length > 55 ? chip.label.slice(0, 55) + '…' : chip.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </Panel>
  )
}

function RecommendationsPanel({ fields, dispatch, account }: { fields: PanelFields; dispatch: React.Dispatch<Action>; account: AccountData }) {
  const edit = (f: string) => (v: string) => dispatch({ type: 'EDIT', panel: 'recommendations', field: f, value: v })
  const recs = account.gapRows.filter(r => r.exposeToClient)

  return (
    <Panel title="Recommended Actions" status={recs.length > 0 ? 'yellow' : 'neutral'}>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, fontStyle: 'italic' }}>
        <EditableText value={fields.intro} onChange={edit('intro')} style={{ fontSize: '0.72rem' }} />
      </p>
      {recs.length === 0 ? (
        <BulletRow>No recommendations at this time.</BulletRow>
      ) : (
        recs.map((rec, i) => {
          return (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)', marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    <EditableText value={fields[`rec_${i}`] ?? ''} onChange={edit(`rec_${i}`)} style={{ fontSize: '0.8rem', fontWeight: 600 }} />
                  </span>
                </div>
              </div>
              <div style={{ marginLeft: 11, marginTop: 3, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45, fontStyle: 'italic' }}>
                <EditableText value={fields[`case_${i}`] ?? ''} onChange={edit(`case_${i}`)} multiline style={{ fontSize: '0.72rem' }} />
              </div>
            </div>
          )
        })
      )}
    </Panel>
  )
}

function OpportunitiesPanel({ fields, dispatch, account }: { fields: PanelFields; dispatch: React.Dispatch<Action>; account: AccountData }) {
  const edit = (f: string) => (v: string) => dispatch({ type: 'EDIT', panel: 'opportunities', field: f, value: v })

  return (
    <Panel title="Growth Opportunities" status="blue">
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, fontStyle: 'italic' }}>
        <EditableText value={fields.intro} onChange={edit('intro')} style={{ fontSize: '0.72rem' }} />
      </p>
      {account.expansionOpps.map((opp, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#818cf8', marginTop: 1, flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
              <EditableText value={fields[`opp_${i}`] ?? opp.product} onChange={edit(`opp_${i}`)} style={{ fontSize: '0.8rem', fontWeight: 600 }} />
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#818cf8', flexShrink: 0 }}>
              <EditableText value={fields[`value_${i}`] ?? opp.potential} onChange={edit(`value_${i}`)} style={{ fontSize: '0.68rem', fontWeight: 700, color: '#818cf8' }} />
            </span>
          </div>
          <div style={{ marginLeft: 11, marginTop: 3, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45, fontStyle: 'italic' }}>
            <EditableText value={fields[`reason_${i}`] ?? opp.reason} onChange={edit(`reason_${i}`)} multiline style={{ fontSize: '0.72rem' }} />
          </div>
        </div>
      ))}
    </Panel>
  )
}

function NextStepsPanel({ fields, dispatch }: { fields: PanelFields; dispatch: React.Dispatch<Action> }) {
  const edit = (f: string) => (v: string) => dispatch({ type: 'EDIT', panel: 'nextsteps', field: f, value: v })
  const stepKeys = ['step_0', 'step_1', 'step_2', 'step_3', 'step_4'].filter(k => fields[k])

  return (
    <Panel title="Next Steps" status="green">
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, fontStyle: 'italic' }}>
        <EditableText value={fields.intro} onChange={edit('intro')} style={{ fontSize: '0.72rem' }} />
      </p>
      {stepKeys.map(k => (
        <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 7 }}>
          <ChevronRight size={11} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 3 }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>
            <EditableText value={fields[k] ?? ''} onChange={edit(k)} style={{ fontSize: '0.78rem' }} />
          </span>
        </div>
      ))}
    </Panel>
  )
}

// ── Export helpers ─────────────────────────────────────────────────────────────

function exportPdf() {
  const styleId = 'qsr-print-style'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @media print {
        body > * { display: none !important; }
        #qsr-print-root { display: block !important; }
        .no-print { display: none !important; }
        button { display: none !important; }
        #qsr-print-root { font-size: 11px; }
      }
    `
    document.head.appendChild(style)
  }
  window.print()
}

async function exportPptx(account: AccountData, state: ReportState) {
  const { header, delivered, goals, recommendations, opportunities, nextsteps } = state
  const MUTED = '94a3b8'
  const wins = account.qbrDelivered.slice(0, 5).map(stripQbrPrefix)
  const clientRecs = account.gapRows.filter(r => r.exposeToClient)

  const slides = [
    {
      num: 1, title: 'Quarterly Strategy Review',
      lines: [
        { text: header.title ?? '', bold: true, size: 20, color: 'FFFFFF' },
        { text: `${header.date ?? ''} · ${header.preparedBy ?? 'Turbotek'}`, color: MUTED, size: 9 },
        { label: 'Prepared for', text: header.attendees ?? '' },
      ],
    },
    {
      num: 2, title: 'Delivered This Quarter',
      lines: [
        { text: delivered.intro ?? '', color: MUTED },
        ...wins.flatMap((_, i): { text: string; bold?: boolean; size?: number; color?: string }[] => [
          { text: `✓  ${delivered[`item_${i}`] ?? ''}`, bold: true, color: '4ade80' },
          ...(delivered[`impact_${i}`] ? [{ text: `   ${delivered[`impact_${i}`]}`, size: 9, color: MUTED }] : []),
        ]),
      ],
    },
    {
      num: 3, title: 'Business Priorities',
      lines: [
        { text: goals.intro ?? '', color: MUTED },
        ...account.businessGoals.map((_, i) => ({ text: `•  ${goals[`goal_${i}`] ?? ''}`, bold: true })),
      ],
    },
    {
      num: 4, title: 'Recommended Actions',
      lines: [
        { text: recommendations.intro ?? '', color: MUTED },
        ...clientRecs.flatMap((_, i): { text: string; bold?: boolean; size?: number; color?: string }[] => [
          { text: `•  ${recommendations[`rec_${i}`] ?? ''}`, bold: true },
          { text: `   ${recommendations[`case_${i}`] ?? ''}`, size: 9, color: MUTED },
        ]),
      ],
    },
    {
      num: 5, title: 'Growth Opportunities',
      lines: [
        { text: opportunities.intro ?? '', color: MUTED },
        ...account.expansionOpps.flatMap((_, i): { text: string; bold?: boolean; size?: number; color?: string }[] => [
          { text: `•  ${opportunities[`opp_${i}`] ?? ''}  (${opportunities[`value_${i}`] ?? ''})`, bold: true },
          { text: `   ${opportunities[`reason_${i}`] ?? ''}`, size: 9, color: MUTED },
        ]),
      ],
    },
    {
      num: 6, title: 'Next Steps & Upcoming Dates',
      lines: [
        { text: nextsteps.intro ?? '', color: MUTED },
        ...account.qbrNextSteps.map((_, i) => ({ text: `›  ${nextsteps[`step_${i}`] ?? ''}`, bold: true })),
        ...(account.renewalDates.length > 0
          ? [{ label: 'Agreement Dates', text: account.renewalDates.map(r => `${r.vendor}: ${r.date}`).join('   ·   ') }]
          : []),
      ],
    },
  ]

  const q = getCurrentQuarter()
  const res = await fetch('/api/export-pptx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountName: account.name, quarter: q, slides }),
  })

  if (!res.ok) throw new Error('PPT export failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${account.name.replace(/\s+/g, '_')}_QSR_${q}.pptx`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Main tab ───────────────────────────────────────────────────────────────────

export function QBRExecBriefTab({ account }: { account: AccountData }) {
  const [state, dispatch] = useReducer(reducer, account, buildInitialState)

  const handlePptx = useCallback(() => {
    exportPptx(account, state).catch(console.error)
  }, [account, state])

  const { header } = state
  const editHeader = (f: string) => (v: string) => dispatch({ type: 'EDIT', panel: 'header', field: f, value: v })

  return (
    <div id="qsr-print-root">

      {/* Export toolbar */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: 'auto' }}>
          Client-facing · Click any text to edit
        </span>
        <button
          onClick={exportPdf}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500 }}
        >
          <Printer size={13} /> PDF
        </button>
        <button
          onClick={handlePptx}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'var(--accent)', border: 'none', color: '#fff', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
        >
          <Download size={13} /> PPT
        </button>
      </div>

      {/* Report header */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: '20px 24px 16px',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 6 }}>
          <EditableText value={header.title} onChange={editHeader('title')} style={{ fontSize: '1.5rem', fontWeight: 800 }} />
        </div>
        <div style={{ fontSize: '0.84rem', color: 'var(--accent)', fontWeight: 500, marginBottom: 10 }}>
          <EditableText value={header.date} onChange={editHeader('date')} style={{ fontSize: '0.84rem' }} />
          {header.attendees && (
            <>
              <span style={{ color: 'var(--text-muted)', margin: '0 8px' }}>·</span>
              <EditableText value={header.attendees} onChange={editHeader('attendees')} style={{ fontSize: '0.84rem' }} />
            </>
          )}
        </div>
        <div style={{ borderTop: '3px solid var(--accent)', borderRadius: 2 }} />
        <div style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Prepared by{' '}
          <EditableText value={header.preparedBy} onChange={editHeader('preparedBy')} style={{ fontSize: '0.72rem' }} />
          {' · '}
          {account.arr} · Renewal {account.renewal}
        </div>
      </div>

      {/* 2-column panel grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}
      >
        <DeliveredPanel       fields={state.delivered}        dispatch={dispatch} account={account} />
        <GoalsPanel           fields={state.goals}            dispatch={dispatch} />
        <BeforeAfterPanel     fields={state.beforeafter}      dispatch={dispatch} account={account} />
        <RecommendationsPanel fields={state.recommendations}  dispatch={dispatch} account={account} />
        <NextStepsPanel       fields={state.nextsteps}        dispatch={dispatch} />
      </div>

    </div>
  )
}
