import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatedChartContainer } from '@/motion/AnimatedChartContainer'
import { EquityCurve } from '@/components/charts/EquityCurve'
import { LoadingState } from '@/components/ui/LoadingState'
import { useStaggerReady } from '@/hooks/useStaggerReady'
import { getPublicBacktest } from '@/lib/idb'
import { formatIDR, formatNumber, formatDate } from '@/lib/utils'
import type { PublicBacktestResult } from '@/types/backtest'

export default function PublicBacktestPage() {
  const { workflowId = '' } = useParams<{ workflowId: string }>()
  const [detail, setDetail] = useState<PublicBacktestResult | null>(null)
  const [loading, setLoading] = useState(true)
  const chartReady = useStaggerReady(!loading && !!detail)

  useEffect(() => {
    if (!workflowId) { setLoading(false); return }
    getPublicBacktest(workflowId).then(r => {
      setDetail(r ?? null)
      setLoading(false)
    })
  }, [workflowId])

  if (loading) return <div style={{ padding: 40 }}><LoadingState rows={8} /></div>

  if (!detail) return (
    <div style={{ padding: 40, maxWidth: 520 }}>
      <div className="pg-head">
        <div><h1>Result Not Found<em>.</em></h1></div>
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink-2)', marginBottom: 20 }}>
        Backtest results are stored only in your browser. This result is not available — it may still be
        processing, or your browser data was cleared.
      </div>
      <a href="/backtests/public/run" className="btn primary">Run new backtest</a>
    </div>
  )

  const m = detail.metadata
  const a = detail.aggregate
  const up = a.roiPct >= 0

  return (
    <div>
      <div className="pg-head">
        <div>
          <div className="eyebrow">Public Backtest · {workflowId.slice(-8)}</div>
          <h1>Backtest Result<em>.</em></h1>
        </div>
        <div className="pg-actions">
          <a href="/backtests/public/run" className="btn">+ New Run</a>
        </div>
      </div>

      <div className="detail-hero">
        <div className="title-block">
          <div className="eyebrow">Parametric Strategy · {m.timeframe} · ISSI</div>
          <h2>{m.strategy}<em>.</em></h2>
          <p className="dek">
            Run from {formatDate(m.startDate)} through {formatDate(m.endDate)},
            starting with {formatIDR(a.initialCapital)} of simulated capital over {a.totalTrades} trades.
          </p>
          <div className="chips">
            <span className="chip">{m.timeframe.toUpperCase()}</span>
            <span className="chip">Public</span>
            <span className="chip">ISSI Universe</span>
          </div>
        </div>
        <div className="roi-stat">
          <div className="eyebrow">Return on Capital</div>
          <div className={`big ${up ? 'up' : 'down'}`}>
            {up ? '+' : ''}{a.roiPct.toFixed(1)}<em>%</em>
          </div>
          <div className="sub">{formatIDR(a.totalInvested)} invested → <strong>{formatIDR(a.finalCapital)}</strong></div>
          <div className="cap">Net P&L {a.netProfit >= 0 ? '+' : ''}{formatIDR(a.netProfit)}</div>
        </div>
      </div>

      <div className="kpi-row">
        <div className="k good">
          <div className="l">Win Rate</div>
          <div className="v">{a.winRatePct.toFixed(1)}%</div>
          <div className="minibar"><div className="f" style={{ width: `${a.winRatePct}%` }} /></div>
          <div className="s">{a.winningTrades}W · {a.losingTrades}L</div>
        </div>
        <div className="k good">
          <div className="l">Profit Factor</div>
          <div className="v">{formatNumber(a.profitFactor)}</div>
          <div className="minibar"><div className="f" style={{ width: `${Math.min(100, a.profitFactor * 30)}%` }} /></div>
          <div className="s">Gross win ÷ loss</div>
        </div>
        <div className="k">
          <div className="l">Sharpe</div>
          <div className="v">{formatNumber(a.sharpeRatio)}</div>
          <div className="minibar"><div className="f" style={{ width: `${Math.min(100, a.sharpeRatio * 30)}%` }} /></div>
          <div className="s">Risk-adjusted</div>
        </div>
        <div className="k bad">
          <div className="l">Max Drawdown</div>
          <div className="v">−{a.maxDrawdownPct.toFixed(1)}%</div>
          <div className="minibar"><div className="f" style={{ width: `${Math.min(100, a.maxDrawdownPct * 2)}%` }} /></div>
          <div className="s">Peak → trough</div>
        </div>
        <div className="k">
          <div className="l">Avg Win</div>
          <div className="v" style={{ color: 'var(--up)', fontSize: 22 }}>{formatIDR(a.avgWin)}</div>
          <div className="s">Best {formatIDR(a.largestWin)}</div>
        </div>
        <div className="k">
          <div className="l">Avg Loss</div>
          <div className="v" style={{ color: 'var(--down)', fontSize: 22 }}>{formatIDR(Math.abs(a.avgLoss))}</div>
          <div className="s">Worst {formatIDR(Math.abs(a.largestLoss))}</div>
        </div>
      </div>

      <div className="neon-content" style={{ gridTemplateColumns: '1fr' }}>
        <div className="neon-card">
          <h4>
            Capital Growth
            <span className="r">{formatDate(m.startDate)} → {formatDate(m.endDate)}</span>
          </h4>
          <AnimatedChartContainer isReady={chartReady}>
            <EquityCurve data={detail.capitalHistory} height={260} />
          </AnimatedChartContainer>
        </div>
      </div>

      <div style={{ padding: '0 40px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>
          Simulation only — not financial advice. Past backtest performance does not guarantee future results.
        </p>
        <a href="/backtests/public/run" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)' }}>
          Run your own backtest →
        </a>
      </div>
    </div>
  )
}
