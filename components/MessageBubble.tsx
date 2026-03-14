'use client'

import { useState } from 'react'
import { ChatMessage } from '@/lib/types'
import { SourcesPanel } from './SourcesPanel'
import { FeedbackBar } from './FeedbackBar'

interface MessageBubbleProps {
  message: ChatMessage
  isLast?: boolean
  onFeedback?: (messageId: string, type: string, detail?: string) => void
  onFollowUp?: (question: string) => void
}

// ── Parsers ──────────────────────────────────────────────────────────────────

function extractBlock(content: string, tag: string): string {
  const re = new RegExp(`---${tag}---([\\s\\S]*?)---END ${tag}---`)
  const m = content.match(re)
  return m ? m[1].trim() : ''
}

function stripBlocks(content: string): string {
  return content
    .replace(/---SOURCES---[\s\S]*?---END SOURCES---/g, '')
    .replace(/---NEXT STEPS---[\s\S]*?---END NEXT STEPS---/g, '')
    .replace(/---EXPLORE---[\s\S]*?---END EXPLORE---/g, '')
    .replace(/---FEEDBACK---[\s\S]*?---END FEEDBACK---/g, '')
    .trim()
}

function extractSources(content: string): { sources: string[]; confidence: 'high' | 'moderate' | 'low'; gaps: string[] } {
  const block = extractBlock(content, 'SOURCES')
  if (!block) return { sources: ['Salesforce', 'ServiceNow', 'MS Teams'], confidence: 'moderate', gaps: [] }

  const sourceMatch = block.match(/Data Used:\s*([^\n]+)/)
  const confMatch   = block.match(/Confidence:\s*([^\n]+)/)
  const gapMatch    = block.match(/Data Gaps:\s*([^\n]+)/)

  const sources = sourceMatch ? sourceMatch[1].split(/[,·]/).map(s => s.trim()).filter(Boolean) : []
  const confText = confMatch ? confMatch[1].toLowerCase() : ''
  const confidence: 'high' | 'moderate' | 'low' = confText.includes('high') ? 'high' : confText.includes('low') ? 'low' : 'moderate'
  const gaps = gapMatch ? gapMatch[1].split(/[,·]/).map(s => s.trim()).filter(s => s && s !== 'None significant') : []

  return { sources, confidence, gaps }
}

function parseNextSteps(content: string): string[] {
  const block = extractBlock(content, 'NEXT STEPS')
  if (!block) return []
  return block.split('\n').map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
}

function parseExploreQuestions(content: string): string[] {
  const block = extractBlock(content, 'EXPLORE')
  if (!block) return []
  return block.split('\n').map(l => l.replace(/^[-•]\s*/, '').trim()).filter(Boolean)
}

// ── Inline + block markdown renderer ─────────────────────────────────────────

function inlineFormat(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: 'var(--text-hover)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} style={{ background: 'var(--accent-bg-medium)', color: 'var(--accent-light)', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.8em', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>
    return part
  })
}

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <button
        className="flex items-center gap-2 w-full text-left"
        style={{ color: 'var(--text-hover)', marginBottom: open ? '0.35rem' : 0 }}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const result: JSX.Element[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      // Collapsible section — collect content until next ## or end
      const title = line.slice(3)
      const sectionLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('## ') && !lines[i].startsWith('# ')) {
        sectionLines.push(lines[i])
        i++
      }
      result.push(
        <CollapsibleSection key={`sec-${i}`} title={title}>
          {renderMarkdown(sectionLines.join('\n'))}
        </CollapsibleSection>
      )
      continue
    }
    else if (line.startsWith('### ')) {
      result.push(
        <div key={i} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0.6rem 0 0.25rem' }}>
          {line.slice(4)}
        </div>
      )
    }
    else if (line === '---' || line === '***') {
      result.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.6rem 0' }} />)
    }
    else if (line.startsWith('> ')) {
      result.push(
        <blockquote key={i} style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '0.75rem', margin: '0.4rem 0', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.875rem' }}>
          {inlineFormat(line.slice(2))}
        </blockquote>
      )
    }
    else if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      result.push(
        <pre key={i} style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', overflowX: 'auto', margin: '0.5rem 0', fontSize: '0.78rem' }}>
          <code style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{codeLines.join('\n')}</code>
        </pre>
      )
    }
    else if (line.includes('|') && line.trim().startsWith('|')) {
      const tableLines: string[] = [line]
      i++
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      i--
      const rows = tableLines
        .filter(l => !l.match(/^\|[\s\-|]+\|$/))
        .map(l => l.split('|').slice(1, -1).map(c => c.trim()))
      if (rows.length > 0) {
        result.push(
          <div key={i} style={{ overflowX: 'auto', margin: '0.6rem 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr>
                  {rows[0].map((cell, ci) => (
                    <th key={ci} style={{ textAlign: 'left', padding: '0.4rem 0.7rem', background: 'var(--accent-bg)', color: 'var(--text-hover)', fontWeight: 600, borderBottom: '1px solid var(--accent-border-medium)', whiteSpace: 'nowrap' }}>
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: '1px solid var(--border-faint)' }}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: '0.35rem 0.7rem', color: 'var(--text-primary)' }}>
                        {inlineFormat(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    }
    else if (line.match(/^[-*]\s/)) {
      const items: string[] = [line.replace(/^[-*]\s/, '')]
      i++
      while (i < lines.length && lines[i].match(/^[-*]\s/)) {
        items.push(lines[i].replace(/^[-*]\s/, ''))
        i++
      }
      i--
      result.push(
        <ul key={i} style={{ margin: '0.25rem 0', paddingLeft: '1.1rem', listStyleType: 'disc' }}>
          {items.map((item, li) => (
            <li key={li} style={{ color: 'var(--text-primary)', marginBottom: '0.15rem', fontSize: '0.875rem', lineHeight: 1.55 }}>
              {inlineFormat(item)}
            </li>
          ))}
        </ul>
      )
    }
    else if (line.match(/^\d+\.\s/)) {
      const items: string[] = [line.replace(/^\d+\.\s/, '')]
      i++
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      i--
      result.push(
        <ol key={i} style={{ margin: '0.25rem 0', paddingLeft: '1.1rem' }}>
          {items.map((item, li) => (
            <li key={li} style={{ color: 'var(--text-primary)', marginBottom: '0.15rem', fontSize: '0.875rem', lineHeight: 1.55 }}>
              {inlineFormat(item)}
            </li>
          ))}
        </ol>
      )
    }
    else if (line.trim() === '') {
      // skip
    }
    else if (line.trim()) {
      result.push(
        <p key={i} style={{ color: 'var(--text-primary)', lineHeight: 1.6, margin: '0.25rem 0', fontSize: '0.875rem' }}>
          {inlineFormat(line)}
        </p>
      )
    }

    i++
  }
  return result
}

// ── Next Steps card ───────────────────────────────────────────────────────────

const EMAIL_KEYWORDS    = /email|outreach|reach out|re-engage|follow.?up|introduc|contact|message|notify/i
const SCRIPT_KEYWORDS   = /call|meeting|conversation|qbr|present|discuss|brief|sync|walk.?through|pitch/i
const TEMPLATE_KEYWORDS = /plan|summary|report|playbook|document|prepare|create|draft|build|outline|brief/i

function detectArtifact(step: string): { label: string; icon: string; prompt: string } {
  const t = step.toLowerCase()
  if (EMAIL_KEYWORDS.test(t))
    return { label: 'Draft Email',    icon: '✉️', prompt: `Draft a professional client email to action this step: "${step}"` }
  if (SCRIPT_KEYWORDS.test(t))
    return { label: 'Draft Script',   icon: '💬', prompt: `Draft a concise call or meeting script to action this step: "${step}"` }
  if (TEMPLATE_KEYWORDS.test(t))
    return { label: 'Draft Template', icon: '📄', prompt: `Draft a structured template to action this step: "${step}"` }
  return   { label: 'Draft',          icon: '✍️', prompt: `Draft the appropriate artifact to action this step: "${step}"` }
}

function NextStepsCard({ steps, onDraft }: { steps: string[]; onDraft?: (prompt: string) => void }) {
  if (!steps.length) return null
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--accent-border-medium)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent-light)' }}>
          RECOMMENDED NEXT STEPS
        </span>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const parts = step.split(' — ')
          const action = parts[0]
          const who    = parts[1]
          const when   = parts[2]
          const artifact = detectArtifact(action)
          return (
            <div key={i} className="rounded-lg p-2.5" style={{ background: 'var(--surface-deep)', border: '1px solid var(--border-faint)' }}>
              <div className="flex items-start gap-2.5">
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{ background: 'var(--accent-bg-hover)', color: 'var(--accent-light)', border: '1px solid var(--accent-border-strong)' }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: 'var(--text-hover)' }}>
                    {inlineFormat(action)}
                  </div>
                  {(who || when) && (
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {who && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
                          {who}
                        </span>
                      )}
                      {when && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)' }}>
                          {when}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {onDraft && (
                <div className="mt-2 flex justify-end">
                  <button
                    className="text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all"
                    style={{
                      background: 'var(--accent-bg-soft)',
                      color: 'var(--accent-light)',
                      border: '1px solid var(--accent-border)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget).style.background = 'var(--accent-bg-hover)'
                      ;(e.currentTarget).style.borderColor = 'var(--accent-border-hover)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget).style.background = 'var(--accent-bg-soft)'
                      ;(e.currentTarget).style.borderColor = 'var(--accent-border)'
                    }}
                    onClick={() => onDraft(artifact.prompt)}
                  >
                    <span>{artifact.icon}</span>
                    {artifact.label}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Explore questions ─────────────────────────────────────────────────────────

function ExploreQuestions({ questions, onAsk }: { questions: string[]; onAsk: (q: string) => void }) {
  if (!questions.length) return null
  return (
    <div>
      <div className="text-xs mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em', fontWeight: 600 }}>
        EXPLORE FURTHER
      </div>
      <div className="flex flex-col gap-1.5">
        {questions.map((q, i) => (
          <button
            key={i}
            className="text-left text-xs px-3 py-2 rounded-lg transition-all duration-150 flex items-center gap-2"
            style={{
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={e => {
              (e.currentTarget).style.borderColor = 'var(--accent-border-hover)'
              ;(e.currentTarget).style.color = 'var(--accent-light)'
              ;(e.currentTarget).style.background = 'var(--accent-bg)'
            }}
            onMouseLeave={e => {
              (e.currentTarget).style.borderColor = 'var(--border-subtle)'
              ;(e.currentTarget).style.color = 'var(--text-secondary)'
              ;(e.currentTarget).style.background = 'var(--surface)'
            }}
            onClick={() => onAsk(q)}
          >
            <span style={{ color: 'var(--accent)', fontSize: '0.7rem' }}>→</span>
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function MessageBubble({ message, isLast, onFeedback, onFollowUp }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div
          className="max-w-lg rounded-2xl px-4 py-3 text-sm"
          style={{
            background: 'var(--accent-bg-hover)',
            color: 'var(--text-hover)',
            border: '1px solid var(--accent-border-medium)',
          }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  const displayContent  = stripBlocks(message.content)
  const { sources, confidence, gaps } = extractSources(message.content)
  const nextSteps       = parseNextSteps(message.content)
  const exploreQs       = parseExploreQuestions(message.content)
  const isStreaming     = message.content.endsWith('…') || message.content === ''

  return (
    <div className="mb-6 space-y-3">
      {/* Avatar + main content */}
      <div className="flex gap-3">
        <div
          className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
          style={{ background: 'var(--accent-bg-hover)', color: 'var(--accent-light)', border: '1px solid var(--accent-border-strong)' }}
        >
          A
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          {renderMarkdown(displayContent)}
        </div>
      </div>

      {/* Structured cards + meta — only when fully streamed */}
      {!isStreaming && (
        <div className="ml-10 space-y-3">
          {nextSteps.length > 0 && <NextStepsCard steps={nextSteps} onDraft={onFollowUp} />}

          <SourcesPanel sources={sources} confidence={confidence} dataGaps={gaps} />

          {exploreQs.length > 0 && onFollowUp && (
            <ExploreQuestions questions={exploreQs} onAsk={onFollowUp} />
          )}

          {isLast && (
            <FeedbackBar onFeedback={(type, detail) => onFeedback?.(message.id, type, detail)} />
          )}
        </div>
      )}
    </div>
  )
}
