'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, AlertTriangle, DollarSign, Users, Database } from 'lucide-react'
import { accountDetailData } from '@/lib/accountDetailData'

const DATA_HEALTH_DIMENSIONS = [
  { label: 'Completeness', score: 78 },
  { label: 'Accuracy', score: 85 },
  { label: 'Freshness', score: 71 },
  { label: 'Coverage', score: 69 },
  { label: 'Data Audit', score: 82 },
]

const OVERALL_HEALTH = Math.round(DATA_HEALTH_DIMENSIONS.reduce((s, d) => s + d.score, 0) / DATA_HEALTH_DIMENSIONS.length)

function healthColor(h: number) {
  return h >= 70 ? '#4ade80' : h >= 40 ? '#facc15' : '#f87171'
}

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Apply saved theme
    const saved = localStorage.getItem('alysa-theme')
    if (saved) document.documentElement.setAttribute('data-theme', saved)
    // Enable scrolling (globals.css sets overflow: hidden for the chat layout)
    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'
    return () => {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    }
  }, [])

  const avgHealth = Math.round(accountDetailData.reduce((s, a) => s + a.health, 0) / accountDetailData.length)
  const atRiskCount = accountDetailData.filter(a => a.stage === 'At Risk').length
  const totalArr = '$100M'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between" style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Chat
          </Link>
          <span style={{ color: 'var(--border-subtle)' }}>|</span>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-hover)' }}>Portfolio Dashboard</h1>
        </div>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      <div className="px-6 py-6 max-w-6xl mx-auto space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Avg Health Score', value: avgHealth.toString(), icon: <TrendingUp className="w-5 h-5" />, color: healthColor(avgHealth) },
            { label: 'At Risk Accounts', value: atRiskCount.toString(), icon: <AlertTriangle className="w-5 h-5" />, color: '#f87171' },
            { label: 'Total ARR', value: totalArr, icon: <DollarSign className="w-5 h-5" />, color: 'var(--accent)' },
            { label: 'Total Accounts', value: accountDetailData.length.toString(), icon: <Users className="w-5 h-5" />, color: 'var(--text-hover)' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                <span style={{ color: stat.color }}>{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Data Health Score */}
        <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>Data Health Score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Overall</span>
              <span className="text-xl font-bold" style={{ color: healthColor(OVERALL_HEALTH) }}>{OVERALL_HEALTH}</span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {DATA_HEALTH_DIMENSIONS.map(dim => (
              <div key={dim.label}>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  <span>{dim.label}</span>
                  <span style={{ color: healthColor(dim.score), fontWeight: 600 }}>{dim.score}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--border-subtle)' }}>
                  <div className="h-full rounded-full" style={{ width: `${dim.score}%`, background: healthColor(dim.score) }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Cards Grid */}
        <div>
          <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>ALL ACCOUNTS</div>
          <div className="grid grid-cols-2 gap-3">
            {accountDetailData.map(account => {
              const hColor = healthColor(account.health)
              const stageColor = account.stage === 'Healthy' ? '#4ade80' : account.stage === 'Monitor' ? '#facc15' : '#f87171'
              return (
                <button
                  key={account.id}
                  onClick={() => router.push(`/account/${account.id}`)}
                  className="text-left rounded-xl p-4 transition-all duration-150"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--accent-border-hover, rgba(87,94,207,0.4))'; (e.currentTarget).style.background = 'var(--surface-hover, var(--surface))' }}
                  onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--border-subtle)'; (e.currentTarget).style.background = 'var(--surface)' }}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {/* Health dot */}
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: hColor, boxShadow: `0 0 6px ${hColor}` }} />
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>{account.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{account.industry}</div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: stageColor + '22', color: stageColor, border: `1px solid ${stageColor}44` }}>
                      {account.stage}
                    </span>
                  </div>

                  {/* ARR */}
                  <div className="text-2xl font-bold mb-2" style={{ color: 'var(--text-hover)' }}>{account.arr}</div>

                  {/* Status bullet */}
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{account.statusBullet}</div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-2 pt-2 text-xs" style={{ borderTop: '1px solid var(--border-faint)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Renewal: {account.renewal}</span>
                    <span className="font-bold" style={{ color: hColor }}>Health {account.health}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
