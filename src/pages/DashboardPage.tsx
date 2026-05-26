import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { getLiveKey } from '@/lib/api/client'
import { useCancelTrade, useTradeSummary, useTradeList } from '@/hooks/useTrades'
import { usePublicBacktests } from '@/hooks/usePublicBacktests'
import { JournalSummaryStrip } from '@/components/journal/JournalSummaryStrip'
import { OpenPositionsTable } from '@/components/journal/OpenPositionsTable'
import { LogTradePanel } from '@/components/journal/LogTradePanel'
import { CloseTradeModal } from '@/components/journal/CloseTradeModal'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatDate } from '@/lib/utils'
import type { JournalTrade } from '@/types/trade'

const KPI: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: '0.75rem',
  padding: '1.25rem 1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
}

function PublicDashboard() {
  const navigate = useNavigate()
  const { data: runs = [], isLoading } = usePublicBacktests()

  if (isLoading) return <LoadingState rows={4} height="h-16" />

  if (runs.length === 0) return (
    <div style={{ padding: '3.75rem 0', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8125rem', color: 'var(--ink-3)', marginBottom: '1.25rem' }}>
        No backtests yet. Run one to see your KPIs here.
      </div>
      <button className="btn primary" onClick={() => navigate('/backtests/run')}>
        Run your first backtest →
      </button>
    </div>
  )

  const bestRoi = runs.reduce((a, b) => a.roiPct > b.roiPct ? a : b)
  const bestWr = runs.reduce((a, b) => a.winRatePct > b.winRatePct ? a : b)
  const profitable = runs.filter(r => r.roiPct > 0).length
  const totalTrades = runs.reduce((s, r) => s + r.totalTrades, 0)

  const kpis = [
    { label: 'Best ROI', value: `${bestRoi.roiPct >= 0 ? '+' : ''}${bestRoi.roiPct.toFixed(1)}%`, color: bestRoi.roiPct >= 0 ? 'var(--up)' : 'var(--down)', sub: `Run ${bestRoi.workflowId.slice(-8)}` },
    { label: 'Best Win Rate', value: `${bestWr.winRatePct.toFixed(1)}%`, color: 'var(--ink-1)', sub: `Run ${bestWr.workflowId.slice(-8)}` },
    { label: 'Profitable Runs', value: `${profitable} / ${runs.length}`, color: profitable > 0 ? 'var(--up)' : 'var(--ink-3)', sub: profitable === runs.length ? 'all runs profitable' : `${runs.length - profitable} unprofitable` },
    { label: 'Trades Simulated', value: totalTrades.toLocaleString(), color: 'var(--accent)', sub: `across ${runs.length} run${runs.length !== 1 ? 's' : ''}` },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
        {kpis.map(k => (
          <div key={k.label} style={KPI}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: '2rem', fontWeight: 700, color: k.color, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{k.value}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6875rem', color: 'var(--ink-3)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Recent Runs</span>
        <Link to="/backtests" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--mono)' }}>View all →</Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {runs.slice(0, 5).map(r => {
          const up = r.roiPct >= 0
          return (
            <div key={r.workflowId}
              onClick={() => navigate(`/backtests/public/${r.workflowId}`)}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '0.5rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink-1)' }}>Run {r.workflowId.slice(-12)}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6875rem', color: 'var(--ink-3)', marginTop: '0.125rem' }}>{formatDate(r.startDate)} → {formatDate(r.endDate)}</div>
              </div>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.25rem', fontWeight: 700, color: up ? 'var(--up)' : 'var(--down)', letterSpacing: '-0.02em', minWidth: '4.5rem', textAlign: 'right' }}>
                {up ? '+' : ''}{r.roiPct.toFixed(1)}%
              </div>
              <div style={{ display: 'flex', gap: '1rem', fontFamily: 'var(--mono)', fontSize: '0.6875rem', color: 'var(--ink-2)' }}>
                <span><span style={{ color: 'var(--ink-3)' }}>WR </span>{r.winRatePct.toFixed(0)}%</span>
                <span><span style={{ color: 'var(--ink-3)' }}>T </span>{r.totalTrades}</span>
              </div>
              <div style={{ color: 'var(--ink-3)', fontSize: '0.875rem' }}>→</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PrivateDashboard() {
  const [logOpen, setLogOpen] = useState(false)
  const [closeTarget, setCloseTarget] = useState<JournalTrade | null>(null)

  const { data: summary, isLoading: summaryLoading } = useTradeSummary()
  const { data: trades, isLoading: tradesLoading } = useTradeList({ status: 'Open', page: 1, pageSize: 5 })
  const { mutate: cancel } = useCancelTrade()

  const openTrades = trades?.data ?? []

  return (
    <>
      <JournalSummaryStrip summary={summary} isLoading={summaryLoading} />

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Open Positions</span>
          <Link to="/trade" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>
        <OpenPositionsTable
          trades={openTrades}
          isLoading={tradesLoading}
          onClose={setCloseTarget}
          onCancel={id => cancel(id)}
        />
      </div>

      <LogTradePanel open={logOpen} onClose={() => setLogOpen(false)} />
      {closeTarget && (
        <CloseTradeModal trade={closeTarget} onClose={() => setCloseTarget(null)} />
      )}

      {/* Floating log button rendered via page header — trigger from parent */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem' }}>
        <button
          className="btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.625rem 1.125rem' }}
          onClick={() => setLogOpen(true)}
        >
          <Plus size={15} /> Log Trade
        </button>
      </div>
    </>
  )
}

export default function DashboardPage() {
  const authed = !!getLiveKey()

  return (
    <div style={{ padding: '2rem 1.75rem', maxWidth: '75rem', margin: '0 auto' }}>
      <div className="pg-head" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="display" style={{ fontSize: '1.75rem', lineHeight: 1 }}>
            Dashboard<em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>.</em>
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            {authed ? 'Trade overview · sharia universe' : 'Backtest overview · saved in this browser'}
          </p>
        </div>
        {!authed && (
          <div className="pg-actions">
            <button className="btn primary" onClick={() => window.location.href = '/backtests/run'}>+ New Run</button>
          </div>
        )}
      </div>

      {authed ? <PrivateDashboard /> : <PublicDashboard />}
    </div>
  )
}
