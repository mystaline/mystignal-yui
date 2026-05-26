import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SignalFilters } from '@/components/signals/SignalFilters'
import { SignalBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useSignals } from '@/hooks/useSignals'
import { useClearSignals } from '@/hooks/useClearSignals'
import { useMarketStatus } from '@/hooks/useMarketStatus'
import { useGridSearchTemplates } from '@/hooks/useGridSearchTemplates'
import { usePublicBacktests } from '@/hooks/usePublicBacktests'
import { useAnalyze } from '@/context/AnalyzeContext'
import { getLiveKey } from '@/lib/api/client'
import { formatIDR, clamp, formatDate } from '@/lib/utils'
import type { SignalFilterParams, TriggerAnalyzeRequest } from '@/types/signal'
import { DEFAULT_GENERIC_STRATEGY } from '@/types/backtest'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const DEFAULT_CONFIG: TriggerAnalyzeRequest = {
  minConfidence: 50,
  compositeIndex: '^JKSE',
  minATRPct: 0,       // 0 = server default (2%)
  holdDays: 15,
  useTrailingStop: false,
  trailingStopPct: 1.5,
  entryTiming: 'next_day_open',
}

const LABEL: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--mono)',
  fontSize: '0.625rem',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ink-3)',
  marginBottom: '0.375rem',
}

const SECTION: React.CSSProperties = {
  borderTop: '1px solid var(--line)',
  paddingTop: '1.25rem',
  marginTop: '1.25rem',
}

const ROW: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
}


export default function SignalsPage() {
  const authed = !!getLiveKey()
  const [filters, setFilters] = useState<SignalFilterParams>({ page: 1, pageSize: 20 })
  const [config, setConfig] = useState<TriggerAnalyzeRequest>(DEFAULT_CONFIG)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [selectedPublicRunId, setSelectedPublicRunId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const { mutate: clearSignals, isPending: clearing } = useClearSignals()

  const handleClearAll = useCallback(() => {
    clearSignals()
    setConfirmClear(false)
  }, [clearSignals])

  const { data, isLoading, isError, refetch } = useSignals(filters)
  const { data: market, isLoading: marketLoading } = useMarketStatus('^JKSE')
  const { data: templates } = useGridSearchTemplates()
  const { data: publicRuns = [] } = usePublicBacktests()
  const { state: analyzeState, trigger: triggerAnalyze } = useAnalyze()
  const triggering = analyzeState.phase !== 'idle' && analyzeState.phase !== 'done' && analyzeState.phase !== 'error' && analyzeState.phase !== 'bearish'

  const items = data?.data ?? []
  const buyCount  = items.filter(s => s.type === 'BUY').length
  const sellCount = items.filter(s => s.type === 'SELL').length
  const avgConf   = items.length ? items.reduce((a, s) => a + s.confidence, 0) / items.length : 0

  function applyTemplate(id: string) {
    const t = templates?.find(x => x.id === id)
    if (!t) return
    setSelectedTemplateId(id)
    const p = t.workflowParams ?? {}
    setConfig(c => ({
      ...c,
      ...(p.minConfidence      != null && { minConfidence:   p.minConfidence }),
      ...(p.compositeIndex     != null && { compositeIndex:  p.compositeIndex }),
      ...(p.minATRPct          != null && { minATRPct:       p.minATRPct }),
      ...(p.holdDays           != null && { holdDays:        p.holdDays }),
      ...(p.useTrailingStop    != null && { useTrailingStop: p.useTrailingStop }),
      ...(p.trailingStopPct    != null && { trailingStopPct: p.trailingStopPct }),
      ...(p.entryTiming        != null && { entryTiming:     p.entryTiming }),
    }))
  }

  function clearTemplate() {
    setSelectedTemplateId(null)
    setConfig(DEFAULT_CONFIG)
  }

  const effectivePublicRunId = selectedPublicRunId

  function handleTrigger() {
    let req: TriggerAnalyzeRequest
    if (authed && selectedTemplateId != null) {
      // private: resolve all params server-side from stored template
      req = { ...DEFAULT_CONFIG, backtestTemplateId: Number(selectedTemplateId) }
    } else if (!authed) {
      // public: all params come from the selected saved run — user must have run a backtest first
      const selectedRun = publicRuns.find(r => r.workflowId === effectivePublicRunId)
      req = {
        ...DEFAULT_CONFIG,
        ...(selectedRun?.signalParams && {
          minConfidence: selectedRun.signalParams.minConfidence,
          compositeIndex: selectedRun.signalParams.compositeIndex,
          entryTiming: selectedRun.signalParams.entryTiming,
        }),
        strategyConfig: selectedRun?.strategyConfig ?? DEFAULT_GENERIC_STRATEGY,
      }
    } else {
      req = { ...config, backtestTemplateId: undefined }
    }
    triggerAnalyze(req)
    setPanelOpen(false)
  }

  // Market status badge
  const marketBadge = marketLoading ? null : market ? (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.25rem 0.625rem', borderRadius: '1.25rem',
      background: market.bullish ? 'rgba(74,222,128,.12)' : 'rgba(239,68,68,.12)',
      border: `1px solid ${market.bullish ? 'rgba(74,222,128,.3)' : 'rgba(239,68,68,.3)'}`,
      fontFamily: 'var(--mono)', fontSize: '0.6875rem', fontWeight: 700,
      color: market.bullish ? 'var(--up)' : 'var(--down)',
    }}>
      <span style={{ fontSize: '0.5625rem' }}>{market.bullish ? '●' : '●'}</span>
      IHSG {market.bullish ? 'BULLISH' : 'BEARISH'} · {market.lastClose.toFixed(0)} / EMA50 {market.ema50.toFixed(0)}
    </span>
  ) : null

  return (
    <div>
      {/* Page header */}
      <div className="pg-head">
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span>Signal feed · {data?.total ?? '—'} signals</span>
            {marketBadge}
          </div>
          <h1>Signals<em>.</em></h1>
        </div>
        <div className="pg-actions">
          <button
            className="btn"
            onClick={() => setConfirmClear(true)}
            disabled={clearing}
            style={{ color: 'var(--down)', borderColor: 'rgba(239,68,68,.3)' }}
          >
            {clearing ? 'Clearing…' : 'Clear All'}
          </button>
          <button
            className="btn"
            onClick={() => setPanelOpen(v => !v)}
            style={{ background: panelOpen ? 'var(--accent)' : undefined, color: panelOpen ? '#000' : undefined }}
          >
            {panelOpen ? '✕ Close' : '⚡ Run Analysis'}
          </button>
        </div>
      </div>

      {/* Analyze panel */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              margin: '0 0 1.5rem',
              background: 'var(--bg-2)',
              border: '1px solid var(--line)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
            }}>
              <h4 style={{ marginBottom: '1.25rem', color: 'var(--ink)' }}>Analysis Configuration</h4>

              {/* Private: grid search template picker */}
              {authed && templates && templates.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={LABEL}>Grid Search Template</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select
                      value={selectedTemplateId ?? ''}
                      onChange={e => { if (e.target.value) applyTemplate(e.target.value); else clearTemplate() }}
                      className="input-field"
                      style={{ flex: 1 }}
                    >
                      <option value="">— custom config —</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.strategyName} · ROI {t.profitPercentage.toFixed(1)}% · WR {t.winRate.toFixed(1)}%
                        </option>
                      ))}
                    </select>
                    {selectedTemplateId != null && (
                      <button
                        className="btn"
                        onClick={clearTemplate}
                        style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', color: 'var(--ink-3)' }}
                        title="Clear template — switch to custom config"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '0.625rem', color: 'var(--ink-3)', marginTop: '0.25rem' }}>
                    {selectedTemplateId != null
                      ? 'Template selected — only the ID is sent; backend resolves params'
                      : 'Select a template or configure manually below'}
                  </div>
                </div>
              )}

              {/* Public: saved backtest picker — all signal params locked to selected run */}
              {!authed && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={LABEL}>Backtest run</label>
                  {publicRuns.length === 0 ? (
                    <div style={{
                      padding: '0.75rem 1rem', borderRadius: '0.5rem',
                      background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.25)',
                      fontFamily: 'var(--mono)', fontSize: '0.75rem', color: '#fbbf24',
                    }}>
                      Run a backtest first — signal generation uses your backtest's strategy config
                    </div>
                  ) : (
                    <>
                      <select
                        value={effectivePublicRunId ?? ''}
                        onChange={e => setSelectedPublicRunId(e.target.value || null)}
                        className="input-field"
                        style={{ width: '100%', borderColor: !effectivePublicRunId ? 'rgba(251,191,36,.5)' : undefined }}
                      >
                        <option value="" disabled>— select a backtest run —</option>
                        {publicRuns.map(r => (
                          <option key={r.workflowId} value={r.workflowId}>
                            Run {r.workflowId.slice(-12)} · {formatDate(r.startDate)}→{formatDate(r.endDate)} · ROI {r.roiPct >= 0 ? '+' : ''}{r.roiPct.toFixed(1)}%
                          </option>
                        ))}
                      </select>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.625rem', color: effectivePublicRunId ? 'var(--ink-3)' : '#fbbf24', marginTop: '0.25rem' }}>
                        {effectivePublicRunId ? 'All signal parameters locked to this run\'s config' : 'Select a run to enable signal generation'}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Locked summary — private only, when template selected */}
              {authed && selectedTemplateId != null && (() => {
                const run = !authed ? publicRuns.find(r => r.workflowId === effectivePublicRunId) : null
                const sp = run?.signalParams
                const sc = run?.strategyConfig
                return (
                  <div style={{ ...SECTION, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.625rem', color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      All parameters locked from selected run
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px' }}>
                      {(authed
                        ? [{ label: 'Source', value: 'grid search template (backend resolves)' }]
                        : [
                            { label: 'Min Conf', value: sp ? `${sp.minConfidence}%` : 'default' },
                            { label: 'Market',   value: sp?.compositeIndex || 'none' },
                            { label: 'Entry',    value: sp?.entryTiming || 'next_day_open' },
                            { label: 'Hold',     value: sc ? `${sc.holdDays}d` : 'default' },
                            { label: 'Trail',    value: sc?.useTrailingStop ? `${sc.trailingStopPct}%` : 'off' },
                            { label: 'RSI',      value: sc?.rsi.enabled ? `period ${sc.rsi.period}, OS ${sc.rsi.oversoldThreshold}` : 'off' },
                            { label: 'EMA',      value: sc?.ema.enabled ? `${sc.ema.fastPeriod}/${sc.ema.slowPeriod}` : 'off' },
                            { label: 'Volume',   value: sc?.volume.enabled ? `spike ×${sc.volume.spikeThreshold}` : 'off' },
                          ]
                      ).map(({ label, value }) => (
                        <span key={label} style={{ fontFamily: 'var(--mono)', fontSize: '0.6875rem', color: 'var(--ink-2)' }}>
                          <span style={{ color: 'var(--ink-3)' }}>{label}: </span>{value}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Manual config — only for private users without a template selected */}
              {authed && selectedTemplateId == null && <>

              {/* Min Confidence */}
              <div style={SECTION}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
                  <label style={LABEL}>Min Confidence</label>
                  <div style={{ fontFamily: 'var(--display)', fontSize: '2.25rem', color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {config.minConfidence}<em style={{ fontSize: '1.125rem', color: 'var(--ink-2)' }}>%</em>
                  </div>
                </div>
                <input
                  type="range" min={20} max={90} step={5}
                  value={config.minConfidence}
                  onChange={e => setConfig(c => ({ ...c, minConfidence: Number(e.target.value) }))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '0.625rem', color: 'var(--ink-3)', marginTop: '0.25rem', letterSpacing: '0.06em' }}>
                  <span>20%</span><span>90%</span>
                </div>
              </div>

              {/* ATR Filter */}
              <div style={SECTION}>
                <div style={ROW}>
                  <div>
                    <div style={{ ...LABEL, marginBottom: 2 }}>Min ATR%</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6875rem', color: 'var(--ink-3)' }}>Skip low-volatility stocks · 0 = default (2%)</div>
                  </div>
                  <input
                    type="number" min={0} max={5} step={0.5}
                    value={config.minATRPct}
                    onChange={e => setConfig(c => ({ ...c, minATRPct: Number(e.target.value) }))}
                    className="input-field"
                    style={{ width: '5rem', textAlign: 'right' }}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Read-only strategy params strip */}
              <div style={{ ...SECTION, display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.625rem', color: 'var(--ink-3)' }}>locked from template —</span>
                {[
                  { label: 'Market',   value: config.compositeIndex || 'none' },
                  { label: 'Hold',     value: config.holdDays > 0 ? `${config.holdDays}d` : 'off' },
                  { label: 'Trail',    value: config.useTrailingStop ? `${config.trailingStopPct}%` : 'off' },
                  { label: 'Entry',    value: config.entryTiming || 'next_day_open' },
                ].map(({ label, value }) => (
                  <span key={label} style={{
                    fontFamily: 'var(--mono)', fontSize: '0.6875rem',
                    color: 'var(--ink-2)',
                  }}>
                    <span style={{ color: 'var(--ink-3)' }}>{label}: </span>{value}
                  </span>
                ))}
              </div>

              </> /* end manual config */}

              {/* Backtest mismatch warning — only shown in custom mode */}
              {selectedTemplateId == null && templates && templates.length > 0 && (() => {
                const matched = templates.some(t => {
                  const p = t.workflowParams ?? {}
                  return (
                    (p.compositeIndex  ?? '')    === config.compositeIndex &&
                    (p.minATRPct       ?? 0)     === config.minATRPct &&
                    (p.holdDays        ?? 0)     === config.holdDays &&
                    (p.useTrailingStop ?? false) === config.useTrailingStop &&
                    (p.trailingStopPct ?? 0)     === config.trailingStopPct &&
                    (p.entryTiming     ?? '')    === config.entryTiming
                  )
                })
                return !matched ? (
                  <div style={{
                    padding: '0.625rem 0.875rem', borderRadius: '0.5rem', marginBottom: '1rem',
                    background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.25)',
                    fontFamily: 'var(--mono)', fontSize: '0.75rem', color: '#fbbf24',
                  }}>
                    ⚠️ No backtest matches this config — generated signals won't have a source ROI attribution
                  </div>
                ) : null
              })()}

              {/* Market status warning */}
              {market && !market.bullish && config.compositeIndex === '^JKSE' && (
                <div style={{
                  padding: '0.625rem 0.875rem', borderRadius: '0.5rem', marginBottom: '1rem',
                  background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
                  fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--down)',
                }}>
                  ⚠️ IHSG is currently bearish (close {market.lastClose.toFixed(0)} &lt; EMA50 {market.ema50.toFixed(0)}) — analysis will return 0 signals
                </div>
              )}

              <button
                className="btn"
                onClick={handleTrigger}
                disabled={triggering || (!authed && !effectivePublicRunId)}
                title={!authed && !effectivePublicRunId ? 'Select a backtest run first' : undefined}
                style={{ minWidth: 160 }}
              >
                {triggering ? '⏳ Running…' : '⚡ Run Analysis Now'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aggregate strip */}
      <div className="agg-strip">
        <div className="c">
          <div className="l">Total</div>
          <div className="v">{data?.total ?? '—'}</div>
        </div>
        <div className="c">
          <div className="l">Buy</div>
          <div className="v" style={{ color: 'var(--up)' }}>{items.length ? buyCount : '—'}</div>
        </div>
        <div className="c">
          <div className="l">Sell</div>
          <div className="v" style={{ color: 'var(--down)' }}>{items.length ? sellCount : '—'}</div>
        </div>
        <div className="c">
          <div className="l">Avg Confidence</div>
          <div className="v">
            {items.length ? <>{avgConf.toFixed(1)}<span style={{ fontSize: '1.125rem', color: 'var(--ink-2)' }}>%</span></> : '—'}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bt-filter">
        <SignalFilters params={filters} onChange={p => setFilters({ ...p, page: 1, pageSize: 20 })} />
      </div>

      {/* Content */}
      {isLoading && <div style={{ padding: '2.5rem' }}><LoadingState rows={6} /></div>}
      {isError && <div style={{ padding: '2.5rem' }}><ErrorState message="Failed to load signals" onRetry={refetch} /></div>}

      <AnimatePresence mode="wait">
        {!isLoading && data && (
          <motion.div
            key={JSON.stringify(filters)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {items.length === 0 ? (
              <div style={{ padding: '3.75rem 2.5rem', fontFamily: 'var(--mono)', fontSize: '0.875rem', color: 'var(--ink-3)' }}>
                No signals match filters.
              </div>
            ) : (
              <>
                <table className="tt">
                  <thead>
                    <tr>
                      <th style={{ width: '4.25rem' }}>Type</th>
                      <th>Symbol</th>
                      <th className="num">Entry</th>
                      <th className="num">Latest</th>
                      <th className="num">Gap</th>
                      <th className="num">Target</th>
                      <th className="num">Stop</th>
                      <th className="num">R/R</th>
                      <th style={{ width: '10rem' }}>Confidence</th>
                      <th style={{ width: '4rem' }}>Age</th>
                      <th style={{ width: '5rem' }}>Status</th>
                      <th style={{ width: '8.75rem' }}>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(s => {
                      const strategy = s.reason?.startsWith('Swing') ? 'swing' : 'trend'
                      const ageLabel = (s.daysOld ?? 0) === 0
                        ? '< 1d'
                        : `${s.daysOld}d`
                      const validity = s.validityTag ?? 'Unknown'
                      const validityColor: Record<string, string> = {
                        Valid:   'var(--up)',
                        Chased:  'var(--ink-3)',
                        'SL Hit': 'var(--down)',
                        Stale:   'var(--ink-3)',
                        Unknown: 'var(--ink-3)',
                      }
                      const gapColor = (s.priceGapPct ?? 0) >= 0 ? 'var(--up)' : 'var(--down)'
                      const isStale = validity === 'Stale' || validity === 'SL Hit'
                      return (
                        <tr key={s.id} style={{ opacity: isStale ? 0.45 : 1 }}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1875rem', alignItems: 'flex-start' }}>
                              <SignalBadge type={s.type} size="sm" />
                              <span title={s.reason} style={{
                                fontFamily: 'var(--mono)', fontSize: '0.625rem', fontWeight: 600,
                                padding: '0.0625rem 0.3125rem', borderRadius: '0.1875rem',
                                background: strategy === 'swing' ? 'rgba(139,92,246,.15)' : 'rgba(59,130,246,.15)',
                                color: strategy === 'swing' ? '#a78bfa' : '#60a5fa',
                                cursor: 'default',
                              }}>
                                {strategy}
                              </span>
                            </div>
                          </td>
                          <td className="sym" title={s.reason}>{s.symbol}</td>
                          <td className="num dim">{formatIDR(s.price)}</td>
                          <td className="num" style={{ color: s.latestClose ? 'var(--ink)' : 'var(--ink-3)' }}>
                            {s.latestClose ? formatIDR(s.latestClose) : '—'}
                          </td>
                          <td className="num" style={{ color: s.priceGapPct != null ? gapColor : 'var(--ink-3)' }}>
                            {s.priceGapPct != null
                              ? `${s.priceGapPct >= 0 ? '+' : ''}${s.priceGapPct.toFixed(1)}%`
                              : '—'}
                          </td>
                          <td className="num" style={{ color: s.targetPrice ? 'var(--up)' : 'var(--ink-3)' }}>
                            {s.targetPrice ? formatIDR(s.targetPrice) : '—'}
                          </td>
                          <td className="num" style={{ color: s.stopLoss ? 'var(--down)' : 'var(--ink-3)' }}>
                            {s.stopLoss ? formatIDR(s.stopLoss) : '—'}
                          </td>
                          <td className="num dim">{s.riskRewardRatio ? s.riskRewardRatio.toFixed(2) : '—'}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ flex: 1, height: '0.125rem', background: 'var(--line)', borderRadius: '0.0625rem', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${clamp(s.confidence, 0, 100)}%`, background: 'var(--accent)', borderRadius: 1 }} />
                              </div>
                              <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--ink-2)', width: '2rem', textAlign: 'right' }}>
                                {s.confidence.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="mono" style={{ fontSize: '0.6875rem', color: 'var(--ink-3)' }}>{ageLabel}</td>
                          <td>
                            <span style={{
                              fontFamily: 'var(--mono)', fontSize: '0.6875rem', fontWeight: 600,
                              padding: '0.125rem 0.4375rem', borderRadius: '0.25rem',
                              background: `color-mix(in srgb, ${validityColor[validity] ?? 'var(--ink-3)'} 12%, transparent)`,
                              color: validityColor[validity] ?? 'var(--ink-3)',
                              border: `1px solid color-mix(in srgb, ${validityColor[validity] ?? 'var(--ink-3)'} 25%, transparent)`,
                            }}>
                              {validity}
                            </span>
                          </td>
                          <td>
                            {s.sourceStrategy ? (
                              <div title={`${s.sourceStrategy} · WR ${s.sourceWinRate?.toFixed(1) ?? '—'}%`} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.625rem', color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '8.125rem' }}>
                                  {s.sourceStrategy.replace('Daily Swing Trading - ', '')}
                                </span>
                                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.6875rem', fontWeight: 700, color: (s.sourceROI ?? 0) >= 0 ? 'var(--up)' : 'var(--down)' }}>
                                  ROI {s.sourceROI != null ? `${s.sourceROI >= 0 ? '+' : ''}${s.sourceROI.toFixed(1)}%` : '—'}
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: '0.6875rem' }}>—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {data.totalPages > 1 && (
                  <div style={{ padding: '1rem 2.5rem', borderTop: '1px solid var(--line)' }}>
                    <Pagination
                      page={filters.page ?? 1}
                      totalPages={data.totalPages}
                      total={data.total}
                      pageSize={20}
                      onPageChange={p => setFilters(f => ({ ...f, page: p }))}
                    />
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmClear}
        title="Clear all signals?"
        message="This will permanently delete all signals. This cannot be undone."
        confirmLabel="Clear All"
        danger
        onConfirm={handleClearAll}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  )
}
