import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AnimatedChartContainer } from '@/motion/AnimatedChartContainer'
import { EquityCurve } from '@/components/charts/EquityCurve'
import { LoadingState } from '@/components/ui/LoadingState'
import { useStaggerReady } from '@/hooks/useStaggerReady'
import { usePublicBacktest } from '@/context/PublicBacktestContext'
import { getPublicBacktestEntry } from '@/lib/idb'
import { formatIDR, formatNumber, formatDate } from '@/lib/utils'
import type { PublicBacktestResult, GenericStrategyConfigDTO } from '@/types/backtest'
import type { PublicSignalParams } from '@/lib/idb'

// Hardcoded demo result — shown when workflowId === 'demo' (used for portfolio embed)
const DEMO_RESULT: PublicBacktestResult = {
  metadata: {
    id: 'demo',
    strategy: 'Generic Parametric',
    timeframe: '1d',
    startDate: '2023-12-29',
    endDate: '2026-05-18',
    source: 'grid_search',
  },
  aggregate: {
    initialCapital: 500_000,
    totalInvested: 15_000_000,
    finalCapital: 31_397_940,
    netProfit: 16_397_940,
    roiPct: 109.32,
    totalTrades: 71,
    winningTrades: 41,
    losingTrades: 30,
    winRatePct: 57.69,
    avgWin: 760_000,
    avgLoss: 495_000,
    largestWin: 2_100_000,
    largestLoss: 980_000,
    profitFactor: 2.10,
    sharpeRatio: 0.408,
    maxDrawdownPct: 8.31,
  },
  capitalHistory: [
    { period: 0,  date: '2023-12-29', capital: 500_000 },
    { period: 1,  date: '2024-01-29', capital: 1_080_000 },
    { period: 2,  date: '2024-02-29', capital: 1_960_000 },
    { period: 3,  date: '2024-03-29', capital: 2_890_000 },
    { period: 4,  date: '2024-04-29', capital: 3_620_000 },
    { period: 5,  date: '2024-05-29', capital: 4_130_000 },
    { period: 6,  date: '2024-06-29', capital: 3_850_000 },
    { period: 7,  date: '2024-07-29', capital: 4_600_000 },
    { period: 8,  date: '2024-08-29', capital: 5_850_000 },
    { period: 9,  date: '2024-09-29', capital: 7_300_000 },
    { period: 10, date: '2024-10-29', capital: 8_900_000 },
    { period: 11, date: '2024-11-29', capital: 10_400_000 },
    { period: 12, date: '2024-12-29', capital: 11_800_000 },
    { period: 13, date: '2025-01-29', capital: 12_900_000 },
    { period: 14, date: '2025-02-28', capital: 14_100_000 },
    { period: 15, date: '2025-03-29', capital: 15_500_000 },
    { period: 16, date: '2025-04-29', capital: 14_250_000 },
    { period: 17, date: '2025-05-29', capital: 15_700_000 },
    { period: 18, date: '2025-06-29', capital: 17_300_000 },
    { period: 19, date: '2025-07-29', capital: 19_200_000 },
    { period: 20, date: '2025-08-29', capital: 20_600_000 },
    { period: 21, date: '2025-09-29', capital: 21_900_000 },
    { period: 22, date: '2025-10-29', capital: 23_200_000 },
    { period: 23, date: '2025-11-29', capital: 24_700_000 },
    { period: 24, date: '2025-12-29', capital: 25_900_000 },
    { period: 25, date: '2026-01-29', capital: 26_300_000 },
    { period: 26, date: '2026-02-28', capital: 27_600_000 },
    { period: 27, date: '2026-03-29', capital: 29_000_000 },
    { period: 28, date: '2026-04-29', capital: 30_300_000 },
    { period: 29, date: '2026-05-18', capital: 31_397_940 },
  ],
}

const DEMO_SIGNAL_PARAMS: PublicSignalParams = {
  compositeIndex: '^JKSE',
  minConfidence: 65,
  entryTiming: 'next_day_open',
}

function ParamGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '1rem' }}>
      {rows.map(({ label, value }) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.75rem' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
            {label}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ink-2)', textAlign: 'right' }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function PublicBacktestPage() {
  const { workflowId = '' } = useParams<{ workflowId: string }>()
  const { state } = usePublicBacktest()
  const [detail, setDetail] = useState<PublicBacktestResult | null>(workflowId === 'demo' ? DEMO_RESULT : null)
  const [strategyConfig, setStrategyConfig] = useState<GenericStrategyConfigDTO | null>(null)
  const [signalParams, setSignalParams] = useState<PublicSignalParams | null>(workflowId === 'demo' ? DEMO_SIGNAL_PARAMS : null)
  const [loading, setLoading] = useState(workflowId !== 'demo')

  const isActiveJob = state.workflowId === workflowId
  const inProgress = isActiveJob && !['idle', 'done', 'error', 'expired'].includes(state.phase)

  useEffect(() => {
    if (workflowId === 'demo' || !workflowId) { setLoading(false); return }
    getPublicBacktestEntry(workflowId).then(entry => {
      if (entry) {
        setDetail(prev => prev ?? entry.result)
        setStrategyConfig(entry.strategyConfig ?? null)
        setSignalParams(entry.signalParams ?? null)
      }
      setLoading(false)
    })
  }, [workflowId])

  // When context finishes for this exact workflowId, populate result immediately
  // (before IDB write completes — result is in context state already).
  useEffect(() => {
    if (isActiveJob && state.phase === 'done' && state.result) {
      setDetail(state.result)
      setStrategyConfig(state.strategyConfig)
      setSignalParams(state.signalParams)
      setLoading(false)
    }
  }, [workflowId, isActiveJob, state.phase, state.result, state.strategyConfig, state.signalParams])

  const chartReady = useStaggerReady(!loading && !!detail)

  if (loading || inProgress) return (
    <div style={{ padding: '2.5rem' }}>
      <div className="pg-head">
        <div>
          <div className="eyebrow">Public Backtest · {workflowId.slice(-8)}</div>
          <h1>Running<em>.</em></h1>
        </div>
      </div>
      {inProgress && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: '1.25rem' }}>
          {state.label || 'Processing…'} — results will appear here automatically.
        </div>
      )}
      <LoadingState rows={8} />
    </div>
  )

  if (!detail) return (
    <div style={{ padding: '2.5rem', maxWidth: '32.5rem' }}>
      <div className="pg-head">
        <div><h1>Result Not Found<em>.</em></h1></div>
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8125rem', color: 'var(--ink-2)', marginBottom: '1.25rem' }}>
        Backtest results are stored only in your browser. This result is not available — it may still be
        processing, or your browser data was cleared.
      </div>
      <Link to="/backtests/run" className="btn primary">Run new backtest</Link>
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
          <Link to="/backtests/run" className="btn">+ New Run</Link>
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
            {signalParams?.compositeIndex
              ? <span className="chip">{signalParams.compositeIndex.replace('^', '')} filter</span>
              : <span className="chip" style={{ opacity: 0.5 }}>no index filter</span>}
            {signalParams?.entryTiming && (
              <span className="chip">
                {signalParams.entryTiming === 'prev_close_next_open' ? 'prev close → next open'
                  : signalParams.entryTiming === 'next_day_open' ? 'next day open'
                  : signalParams.entryTiming}
              </span>
            )}
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
          <div className="v" style={{ color: 'var(--up)', fontSize: '1.375rem' }}>{formatIDR(a.avgWin)}</div>
          <div className="s">Best {formatIDR(a.largestWin)}</div>
        </div>
        <div className="k">
          <div className="l">Avg Loss</div>
          <div className="v" style={{ color: 'var(--down)', fontSize: '1.375rem' }}>{formatIDR(Math.abs(a.avgLoss))}</div>
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

      {(strategyConfig || signalParams) && (
        <div className="neon-content" style={{ gridTemplateColumns: '1fr 1fr', padding: '0 2.5rem 1.5rem' }}>
          {signalParams && (
            <div className="neon-card">
              <h4>Signal Parameters</h4>
              <ParamGrid rows={[
                { label: 'Market Filter', value: signalParams.compositeIndex ? signalParams.compositeIndex.replace('^', '') + ' (IHSG composite)' : '— none' },
                { label: 'Min Confidence', value: `${signalParams.minConfidence}%` },
                { label: 'Entry Timing', value: signalParams.entryTiming === 'prev_close_next_open' ? 'Prev close → next open' : signalParams.entryTiming === 'next_day_open' ? 'Next day open' : signalParams.entryTiming },
              ]} />
            </div>
          )}
          {strategyConfig && (
            <div className="neon-card">
              <h4>Strategy Config</h4>
              <ParamGrid rows={[
                { label: 'Hold Days', value: `${strategyConfig.holdDays} days` },
                { label: 'SL Multiplier', value: `${strategyConfig.slMultiplier}×` },
                { label: 'TP Multiplier', value: `${strategyConfig.tpMultiplier}×` },
                { label: 'Trailing Stop', value: strategyConfig.useTrailingStop ? `${strategyConfig.trailingStopPct}%` : 'off' },
                { label: 'RSI', value: strategyConfig.rsi.enabled ? `period ${strategyConfig.rsi.period}, OS < ${strategyConfig.rsi.oversoldThreshold}` : 'off' },
                { label: 'EMA', value: strategyConfig.ema.enabled ? `${strategyConfig.ema.fastPeriod} / ${strategyConfig.ema.slowPeriod}` : 'off' },
                { label: 'Volume', value: strategyConfig.volume.enabled ? `spike ×${strategyConfig.volume.spikeThreshold}` : 'off' },
                { label: 'ATR Filter', value: strategyConfig.atrFilter.enabled ? `period ${strategyConfig.atrFilter.period}, min ${strategyConfig.atrFilter.minAtrPct}%` : 'off' },
              ]} />
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '0 2.5rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.6875rem', color: 'var(--ink-3)' }}>
          Simulation only — not financial advice. Past backtest performance does not guarantee future results.
        </p>
        <Link to="/backtests/run" style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--accent)' }}>
          Run your own backtest →
        </Link>
      </div>
    </div>
  )
}
