'use client'

import { useState } from 'react'
import { CheckCircle2, ArrowRight, ShieldAlert, Lightbulb, FileText, Download, Minimize2, Maximize2, Pencil, Check, X, Plus, Trash2, GripVertical } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { SectionChat } from './SectionChat'
import { AccountData } from '@/lib/types'

type Mode = 'standard' | 'executive'

function getCurrentQuarter() {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `Q${q} ${now.getFullYear()}`
}

// Editable plain-text list section
function EditableList({
  items,
  onChange,
  icon,
  iconColor,
}: {
  items: string[]
  onChange: (items: string[]) => void
  icon: React.ReactNode
  iconColor: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(items)

  function save() {
    onChange(draft.filter(d => d.trim() !== ''))
    setEditing(false)
  }

  function cancel() {
    setDraft(items)
    setEditing(false)
  }

  function updateItem(i: number, val: string) {
    setDraft(prev => prev.map((d, idx) => idx === i ? val : d))
  }

  function removeItem(i: number) {
    setDraft(prev => prev.filter((_, idx) => idx !== i))
  }

  function addItem() {
    setDraft(prev => [...prev, ''])
  }

  if (editing) {
    return (
      <div className="space-y-2">
        {draft.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <GripVertical className="w-3.5 h-3.5 mt-2 flex-shrink-0" style={{ color: 'var(--text-faint)' }} />
            <textarea
              className="flex-1 text-sm rounded-lg px-2.5 py-1.5 resize-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.3))',
                color: 'var(--text-primary)',
                outline: 'none',
                minHeight: '36px',
              }}
              value={item}
              rows={1}
              onChange={e => updateItem(i, e.target.value)}
            />
            <button onClick={() => removeItem(i)} className="mt-1.5 flex-shrink-0" style={{ color: '#f87171' }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg w-full justify-center"
          style={{ background: 'var(--bg)', border: '1px dashed var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          <Plus className="w-3 h-3" /> Add item
        </button>
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={save}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <Check className="w-3 h-3" /> Save
          </button>
          <button
            onClick={cancel}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            <X className="w-3 h-3" /> Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1.5 group/list">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 text-sm">
          <span className="flex-shrink-0 mt-0.5" style={{ color: iconColor }}>{icon}</span>
          <span style={{ color: 'var(--text-primary)' }}>{item}</span>
        </div>
      ))}
      <button
        onClick={() => { setDraft(items); setEditing(true) }}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg mt-2 opacity-0 group-hover/list:opacity-100 transition-opacity"
        style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
      >
        <Pencil className="w-3 h-3" /> Edit section
      </button>
    </div>
  )
}

// Editable numbered list (for priorities)
function EditableNumberedList({
  items,
  onChange,
}: {
  items: string[]
  onChange: (items: string[]) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(items)

  function save() {
    onChange(draft.filter(d => d.trim() !== ''))
    setEditing(false)
  }

  function cancel() {
    setDraft(items)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="space-y-2">
        {draft.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-1.5" style={{ background: 'rgba(87,94,207,0.15)', color: 'var(--accent)' }}>{i + 1}</span>
            <textarea
              className="flex-1 text-sm rounded-lg px-2.5 py-1.5 resize-none"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.3))',
                color: 'var(--text-primary)',
                outline: 'none',
                minHeight: '36px',
              }}
              value={item}
              rows={1}
              onChange={e => setDraft(prev => prev.map((d, idx) => idx === i ? e.target.value : d))}
            />
            <button onClick={() => setDraft(prev => prev.filter((_, idx) => idx !== i))} className="mt-1.5 flex-shrink-0" style={{ color: '#f87171' }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          onClick={() => setDraft(prev => [...prev, ''])}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg w-full justify-center"
          style={{ background: 'var(--bg)', border: '1px dashed var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          <Plus className="w-3 h-3" /> Add item
        </button>
        <div className="flex items-center gap-2 pt-1">
          <button onClick={save} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--accent)', color: '#fff' }}>
            <Check className="w-3 h-3" /> Save
          </button>
          <button onClick={cancel} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            <X className="w-3 h-3" /> Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2 group/list">
      <ol className="space-y-2">
        {items.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(87,94,207,0.15)', color: 'var(--accent)' }}>{i + 1}</span>
            <span style={{ color: 'var(--text-primary)' }}>{p}</span>
          </li>
        ))}
      </ol>
      <button
        onClick={() => { setDraft(items); setEditing(true) }}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg mt-1 opacity-0 group-hover/list:opacity-100 transition-opacity"
        style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
      >
        <Pencil className="w-3 h-3" /> Edit section
      </button>
    </div>
  )
}

// Inline editable text field
function EditableText({
  value,
  onChange,
  className,
  style,
}: {
  value: string
  onChange: (val: string) => void
  className?: string
  style?: React.CSSProperties
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function save() {
    onChange(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 flex-1">
        <input
          autoFocus
          className={`flex-1 rounded-lg px-2.5 py-1 ${className ?? ''}`}
          style={{ background: 'var(--bg)', border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.3))', color: 'var(--text-primary)', outline: 'none', ...style }}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        />
        <button onClick={save} style={{ color: '#4ade80' }}><Check className="w-4 h-4" /></button>
        <button onClick={() => setEditing(false)} style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
      </div>
    )
  }

  return (
    <div
      className={`group/text flex items-center gap-2 cursor-pointer ${className ?? ''}`}
      style={style}
      onClick={() => { setDraft(value); setEditing(true) }}
    >
      <span>{value}</span>
      <Pencil className="w-3 h-3 opacity-0 group-hover/text:opacity-60 transition-opacity flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
    </div>
  )
}

export function QBRExecBriefTab({ account }: { account: AccountData }) {
  const [mode, setMode] = useState<Mode>('standard')

  // Editable title & agenda
  const [title, setTitle] = useState(`Quarterly Strategic Review — ${account.name}`)
  const [subtitle, setSubtitle] = useState(getCurrentQuarter())

  const defaultAgenda = [
    'Goals review — what you said matters this quarter',
    'What we delivered against those goals',
    'Risks we are actively managing',
    'Opportunities to improve outcomes',
    'Next steps and decisions required',
  ]
  const [agenda, setAgenda] = useState(defaultAgenda)
  const [editingAgenda, setEditingAgenda] = useState(false)
  const [agendaDraft, setAgendaDraft] = useState(defaultAgenda)

  // Editable section content (local copies)
  const [priorities, setPriorities]       = useState(account.qbrPriorities)
  const [delivered, setDelivered]         = useState(account.qbrDelivered)
  const [nextSteps, setNextSteps]         = useState(account.qbrNextSteps)
  const [risks, setRisks]                 = useState(account.qbrRisks)
  const [opportunities, setOpportunities] = useState(account.qbrOpportunities)

  // Editable slide titles
  const [titlePriorities, setTitlePriorities]       = useState('What You Said Matters This Quarter')
  const [titleDelivered, setTitleDelivered]         = useState('What We Delivered')
  const [titleNextSteps, setTitleNextSteps]         = useState('Next Steps & Decisions')
  const [titleRisks, setTitleRisks]                 = useState("Risks We're Managing")
  const [titleOpportunities, setTitleOpportunities] = useState('Opportunities to Improve Outcomes')
  const [titleOutcomes, setTitleOutcomes]           = useState('Outcomes Delivered')

  return (
    <div className="space-y-4">

      {/* Title block */}
      <div className="rounded-xl px-5 py-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
        <EditableText
          value={title}
          onChange={setTitle}
          className="text-lg font-bold"
          style={{ color: 'var(--text-hover)' }}
        />
        <EditableText
          value={subtitle}
          onChange={setSubtitle}
          className="text-sm mt-0.5"
          style={{ color: 'var(--accent)' }}
        />

        {/* Agenda */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-faint)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>AGENDA</span>
            {!editingAgenda && (
              <button
                onClick={() => { setAgendaDraft(agenda); setEditingAgenda(true) }}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded"
                style={{ color: 'var(--text-muted)', background: 'var(--bg)', border: '1px solid var(--border-faint)' }}
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          {editingAgenda ? (
            <div className="space-y-1.5">
              {agendaDraft.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs w-4 text-right flex-shrink-0" style={{ color: 'var(--text-faint)' }}>{i + 1}.</span>
                  <input
                    className="flex-1 text-sm rounded px-2 py-1"
                    style={{ background: 'var(--bg)', border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.3))', color: 'var(--text-primary)', outline: 'none' }}
                    value={item}
                    onChange={e => setAgendaDraft(prev => prev.map((d, idx) => idx === i ? e.target.value : d))}
                  />
                  <button onClick={() => setAgendaDraft(prev => prev.filter((_, idx) => idx !== i))} style={{ color: '#f87171' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setAgendaDraft(prev => [...prev, ''])}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded w-full justify-center mt-1"
                style={{ background: 'var(--bg)', border: '1px dashed var(--border-subtle)', color: 'var(--text-muted)' }}
              >
                <Plus className="w-3 h-3" /> Add item
              </button>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setAgenda(agendaDraft.filter(d => d.trim())); setEditingAgenda(false) }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  <Check className="w-3 h-3" /> Save
                </button>
                <button
                  onClick={() => setEditingAgenda(false)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <ol className="space-y-1">
              {agenda.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-xs mt-0.5 w-4 text-right flex-shrink-0" style={{ color: 'var(--text-faint)' }}>{i + 1}.</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{item}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('executive')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: mode === 'executive' ? 'var(--accent)' : 'var(--surface)',
              color: mode === 'executive' ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${mode === 'executive' ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            <Minimize2 className="w-3.5 h-3.5" /> Executive (1–2 slides)
          </button>
          <button
            onClick={() => setMode('standard')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: mode === 'standard' ? 'var(--accent)' : 'var(--surface)',
              color: mode === 'standard' ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${mode === 'standard' ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            <Maximize2 className="w-3.5 h-3.5" /> Standard (6–8 slides)
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            <FileText className="w-3.5 h-3.5" /> Export PPT
          </button>
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Content grid */}
      <div className={`grid gap-4 ${mode === 'executive' ? 'grid-cols-2' : 'grid-cols-3'}`}>

        {/* What You Said Matters */}
        <CollapsibleCard
          title={titlePriorities}
          onTitleChange={setTitlePriorities}
          icon={<FileText className="w-4 h-4" />}
          defaultOpen
          infoSources={['Fathom', 'CRM']}
          infoDefinition="Priorities captured from QSR prep calls, strategy sessions, and CRM account notes."
        >
          <EditableNumberedList items={priorities} onChange={setPriorities} />
          <SectionChat
            sectionTitle="What You Said Matters This Quarter"
            accountName={account.name}
            context={`Client priorities this quarter:\n${priorities.join('\n')}`}
            compact
          />
        </CollapsibleCard>

        {/* What We Delivered */}
        <CollapsibleCard
          title={titleDelivered}
          onTitleChange={setTitleDelivered}
          icon={<CheckCircle2 className="w-4 h-4" />}
          defaultOpen
          infoSources={['Autotask', 'Kaseya RMM']}
          infoDefinition="Completed deliverables pulled from closed Autotask tickets and RMM project completions."
        >
          <EditableList
            items={delivered}
            onChange={setDelivered}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            iconColor="#4ade80"
          />
          <SectionChat
            sectionTitle="What We Delivered"
            accountName={account.name}
            context={`Delivered this quarter:\n${delivered.join('\n')}`}
            compact
          />
        </CollapsibleCard>

        {/* Next Steps */}
        <CollapsibleCard
          title={titleNextSteps}
          onTitleChange={setTitleNextSteps}
          icon={<ArrowRight className="w-4 h-4" />}
          defaultOpen
          infoSources={['Fathom', 'Autotask']}
          infoDefinition="Next steps agreed in recent meetings and open action items in Autotask."
        >
          <EditableList
            items={nextSteps}
            onChange={setNextSteps}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            iconColor="var(--accent)"
          />
          <SectionChat
            sectionTitle="Next Steps & Decisions"
            accountName={account.name}
            context={`Next steps:\n${nextSteps.join('\n')}`}
            compact
          />
        </CollapsibleCard>

        {/* Standard mode only */}
        {mode === 'standard' && (
          <>
            {/* Risks */}
            <CollapsibleCard
              title={titleRisks}
              onTitleChange={setTitleRisks}
              icon={<ShieldAlert className="w-4 h-4" />}
              infoSources={['Kaseya RMM', 'IT Glue']}
              infoDefinition="Active risk signals from RMM monitoring and IT Glue assessments."
            >
              <EditableList
                items={risks}
                onChange={setRisks}
                icon={<ShieldAlert className="w-3.5 h-3.5" />}
                iconColor="#f87171"
              />
              <SectionChat
                sectionTitle="Risks We're Managing"
                accountName={account.name}
                context={`Current risks:\n${risks.join('\n')}`}
                compact
              />
            </CollapsibleCard>

            {/* Opportunities */}
            <CollapsibleCard
              title={titleOpportunities}
              onTitleChange={setTitleOpportunities}
              icon={<Lightbulb className="w-4 h-4" />}
              infoSources={['Gap Analysis Engine', 'Forrester']}
              infoDefinition="Strategic opportunities surfaced from gap analysis and backed by third-party research."
            >
              <EditableList
                items={opportunities}
                onChange={setOpportunities}
                icon={<Lightbulb className="w-3.5 h-3.5" />}
                iconColor="#facc15"
              />
              <SectionChat
                sectionTitle="Opportunities to Improve Outcomes"
                accountName={account.name}
                context={`Opportunities:\n${opportunities.join('\n')}`}
                compact
              />
            </CollapsibleCard>

            {/* Outcomes Delivered */}
            <CollapsibleCard
              title={titleOutcomes}
              onTitleChange={setTitleOutcomes}
              infoSources={['Autotask', 'Kaseya RMM', 'Fathom']}
              infoDefinition="Before/after outcome metrics captured from project completions, ticket resolution data, and client-confirmed outcomes."
            >
              <div className="space-y-2">
                {account.businessOutcomes.map((o, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>{o.metric}</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Before</div>
                        <div style={{ color: '#f87171', fontWeight: 600 }}>{o.before}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>After</div>
                        <div style={{ color: '#4ade80', fontWeight: 600 }}>{o.after}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Impact</div>
                        <div style={{ color: 'var(--accent)', fontWeight: 600 }}>{o.impact}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <SectionChat
                sectionTitle="Outcomes Delivered"
                accountName={account.name}
                context={account.businessOutcomes.map(o => `${o.metric}: ${o.before} → ${o.after} (${o.impact})`).join('\n')}
                compact
              />
            </CollapsibleCard>
          </>
        )}
      </div>
    </div>
  )
}
