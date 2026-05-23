import { useState } from 'react'
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
import { useAnalyze } from '@/context/AnalyzeContext'
import { formatIDR, clamp } from '@/lib/utils'
import type { SignalFilterParams, TriggerAnalyzeRequest } from '@/types/signal'

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
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ink-3)',
  marginBottom: 6,
}

const SECTION: React.CSSProperties = {
  borderTop: '1px solid var(--line)',
  paddingTop: 20,
  marginTop: 20,
}

const ROW: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
}


export default function SignalsPage() {
  const [filters, setFilters] = useState<SignalFilterParams>({ page: 1, pageSize: 20 })
  const [config, setConfig] = useState<TriggerAnalyzeRequest>(DEFAULT_CONFIG)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const { mutate: clearSignals, isPending: clearing } = useClearSignals()

  const handleClearAll = () => {
    if (!window.confirm('Delete all signals? This cannot be undone.')) return
    clearSignals()
  }

  const { data, isLoading, isError, refetch } = useSignals(filters)
  const { data: market, isLoading: marketLoading } = useMarketStatus('^JKSE')
  const { data: templates } = useGridSearchTemplates()
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

  function handleTrigger() {
    // template mode: send only the ID — backend resolves all params from the stored template
    // custom mode: send the full config
    const req: TriggerAnalyzeRequest = selectedTemplateId != null
      ? { ...DEFAULT_CONFIG, backtestTemplateId: Number(selectedTemplateId) }
      : { ...config, backtestTemplateId: undefined }
    triggerAnalyze(req)
    setPanelOpen(false)
  }

  // Market status badge
  const marketBadge = marketLoading ? null : market ? (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 20,
      background: market.bullish ? 'rgba(74,222,128,.12)' : 'rgba(239,68,68,.12)',
      border: `1px solid ${market.bullish ? 'rgba(74,222,128,.3)' : 'rgba(239,68,68,.3)'}`,
      fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
      color: market.bullish ? 'var(--up)' : 'var(--down)',
    }}>
      <span style={{ fontSize: 9 }}>{market.bullish ? '●' : '●'}</span>
      IHSG {market.bullish ? 'BULLISH' : 'BEARISH'} · {market.lastClose.toFixed(0)} / EMA50 {market.ema50.toFixed(0)}
    </span>
  ) : null

  return (
    <div>
      {/* Page header */}
      <div className="pg-head">
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Signal feed · {data?.total ?? '—'} signals</span>
            {marketBadge}
          </div>
          <h1>Signals<em>.</em></h1>
        </div>
        <div className="pg-actions">
          <button
            className="btn"
            onClick={handleClearAll}
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
              margin: '0 0 24px',
              background: 'var(--bg-2)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              padding: 24,
            }}>
              <h4 style={{ marginBottom: 20, color: 'var(--ink)' }}>Analysis Configuration</h4>

              {/* Template picker */}
              {templates && templates.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <label style={LABEL}>Grid Search Template</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
                        style={{ padding: '6px 10px', fontSize: 12, color: 'var(--ink-3)' }}
                        title="Clear template — switch to custom config"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
                    {selectedTemplateId != null
                      ? 'Template selected — only the ID is sent; backend resolves params'
                      : 'Select a template or configure manually below'}
                  </div>
                </div>
              )}

              {/* Min Confidence */}
              <div style={SECTION}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
                  <label style={LABEL}>Min Confidence</label>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 36, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {config.minConfidence}<em style={{ fontSize: 18, color: 'var(--ink-2)' }}>%</em>
                  </div>
                </div>
                <input
                  type="range" min={20} max={90} step={5}
                  value={config.minConfidence}
                  onChange={e => setConfig(c => ({ ...c, minConfidence: Number(e.target.value) }))}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 4, letterSpacing: '0.06em' }}>
                  <span>20%</span><span>90%</span>
                </div>
              </div>

              {/* ATR Filter */}
              <div style={SECTION}>
                <div style={ROW}>
                  <div>
                    <div style={{ ...LABEL, marginBottom: 2 }}>Min ATR%</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>Skip low-volatility stocks · 0 = default (2%)</div>
                  </div>
                  <input
                    type="number" min={0} max={5} step={0.5}
                    value={config.minATRPct}
                    onChange={e => setConfig(c => ({ ...c, minATRPct: Number(e.target.value) }))}
                    className="input-field"
                    style={{ width: 80, textAlign: 'right' }}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Read-only strategy params strip */}
              <div style={{ ...SECTION, display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)' }}>locked from template —</span>
                {[
                  { label: 'Market',   value: config.compositeIndex || 'none' },
                  { label: 'Hold',     value: config.holdDays > 0 ? `${config.holdDays}d` : 'off' },
                  { label: 'Trail',    value: config.useTrailingStop ? `${config.trailingStopPct}%` : 'off' },
                  { label: 'Entry',    value: config.entryTiming || 'next_day_open' },
                ].map(({ label, value }) => (
                  <span key={label} style={{
                    fontFamily: 'var(--mono)', fontSize: 11,
                    color: 'var(--ink-2)',
                  }}>
                    <span style={{ color: 'var(--ink-3)' }}>{label}: </span>{value}
                  </span>
                ))}
              </div>

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
                    padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                    background: 'rgba(251,191,36,.08)', border: '1px solid rgba(251,191,36,.25)',
                    fontFamily: 'var(--mono)', fontSize: 12, color: '#fbbf24',
                  }}>
                    ⚠️ No backtest matches this config — generated signals won't have a source ROI attribution
                  </div>
                ) : null
              })()}

              {/* Market status warning */}
              {market && !market.bullish && config.compositeIndex === '^JKSE' && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                  background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
                  fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--down)',
                }}>
                  ⚠️ IHSG is currently bearish (close {market.lastClose.toFixed(0)} &lt; EMA50 {market.ema50.toFixed(0)}) — analysis will return 0 signals
                </div>
              )}

              <button
                className="btn"
                onClick={handleTrigger}
                disabled={triggering}
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
            {items.length ? <>{avgConf.toFixed(1)}<span style={{ fontSize: 18, color: 'var(--ink-2)' }}>%</span></> : '—'}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bt-filter">
        <SignalFilters params={filters} onChange={p => setFilters({ ...p, page: 1, pageSize: 20 })} />
      </div>

      {/* Content */}
      {isLoading && <div style={{ padding: 40 }}><LoadingState rows={6} /></div>}
      {isError && <div style={{ padding: 40 }}><ErrorState message="Failed to load signals" onRetry={refetch} /></div>}

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
              <div style={{ padding: '60px 40px', fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink-3)' }}>
                No signals match filters.
              </div>
            ) : (
              <>
                <table className="tt">
                  <thead>
                    <tr>
                      <th style={{ width: 68 }}>Type</th>
                      <th>Symbol</th>
                      <th className="num">Entry</th>
                      <th className="num">Latest</th>
                      <th className="num">Gap</th>
                      <th className="num">Target</th>
                      <th className="num">Stop</th>
                      <th className="num">R/R</th>
                      <th style={{ width: 160 }}>Confidence</th>
                      <th style={{ width: 64 }}>Age</th>
                      <th style={{ width: 80 }}>Status</th>
                      <th style={{ width: 140 }}>Source</th>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
                              <SignalBadge type={s.type} size="sm" />
                              <span title={s.reason} style={{
                                fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
                                padding: '1px 5px', borderRadius: 3,
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 2, background: 'var(--line)', borderRadius: 1, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${clamp(s.confidence, 0, 100)}%`, background: 'var(--accent)', borderRadius: 1 }} />
                              </div>
                              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', width: 32, textAlign: 'right' }}>
                                {s.confidence.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{ageLabel}</td>
                          <td>
                            <span style={{
                              fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
                              padding: '2px 7px', borderRadius: 4,
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
                                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
                                  {s.sourceStrategy.replace('Daily Swing Trading - ', '')}
                                </span>
                                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: (s.sourceROI ?? 0) >= 0 ? 'var(--up)' : 'var(--down)' }}>
                                  ROI {s.sourceROI != null ? `${s.sourceROI >= 0 ? '+' : ''}${s.sourceROI.toFixed(1)}%` : '—'}
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--mono)', fontSize: 11 }}>—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {data.totalPages > 1 && (
                  <div style={{ padding: '16px 40px', borderTop: '1px solid var(--line)' }}>
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
    </div>
  )
}
