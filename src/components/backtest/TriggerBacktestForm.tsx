import { useState, useEffect, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { getLiveKey } from '@/lib/api/client'
import { useTriggerBacktest } from '@/hooks/useTriggerBacktest'
import { useCandleDateRange } from '@/hooks/useCandleDateRange'
import { useGridSearchTemplates } from '@/hooks/useGridSearchTemplates'
import { GenericStrategyPanel } from './GenericStrategyPanel'
import { DEFAULT_GENERIC_STRATEGY, type GenericStrategyConfigDTO } from '@/types/backtest'

const ENTRY_TIMINGS = [
  {
    value: 'next_day_open',
    label: 'Next Day Open',
    hint: 'Signal fires after close → buy at next morning open. Most realistic.',
  },
  {
    value: 'prev_close_next_open',
    label: 'Prev Close',
    hint: "Signal fires at prior close → buy at today's open. Slightly optimistic.",
  },
  {
    value: 'post_close',
    label: 'Same Close ⚠',
    hint: 'Signal fires at close → buy at same close. Look-ahead bias — overstates returns.',
  },
]

const MARKET_FILTERS = [
  { value: '', label: 'No Filter', hint: 'Trade in all market conditions.' },
  { value: '^JKSE', label: 'IHSG', hint: 'Skip new buys when IHSG trend is bearish. Reduces losses in downturns.' },
]

const STRATEGIES = [
  { value: 'SwingDailyATR', label: 'SwingDailyATR', enabled: true },
  { value: 'MomentumBreakout', label: 'MomentumBreakout', enabled: false },
  { value: 'RSIReversion', label: 'RSIReversion', enabled: false },
]

const LABEL: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--mono)',
  fontSize: '0.8125rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--ink-3)',
  marginBottom: '0.375rem',
}

const SECTION_HEAD: React.CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: '0.8125rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--ink-3)',
  marginBottom: '0.875rem',
}

const DIVIDER: React.CSSProperties = {
  borderTop: '1px solid var(--line)',
  marginTop: '1.25rem',
  paddingTop: '1.25rem',
}

const HINT: React.CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: '0.75rem',
  color: 'var(--ink-3)',
  marginTop: '0.25rem',
  lineHeight: 1.5,
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: '2.5rem', height: '1.375rem', borderRadius: '0.6875rem',
        border: 'none', cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'var(--line)',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute',
        top: '0.1875rem',
        left: checked ? '1.3125rem' : '0.1875rem',
        width: '1rem', height: '1rem', borderRadius: '50%',
        background: checked ? 'var(--accent-ink)' : 'var(--ink-2)',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

function OptionGroup<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string; hint?: string }[]
  value: T
  onChange: (v: T) => void
}) {
  const active = options.find(o => o.value === value)
  return (
    <div>
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {options.map(o => {
          const sel = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.625rem',
                borderRadius: '0.375rem',
                border: `1px solid ${sel ? 'var(--accent)' : 'var(--line)'}`,
                background: sel
                  ? 'color-mix(in srgb, var(--accent) 10%, transparent)'
                  : 'transparent',
                color: sel ? 'var(--accent)' : 'var(--ink-3)',
                fontFamily: 'var(--mono)',
                fontSize: '0.875rem',
                fontWeight: sel ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {o.label}
            </button>
          )
        })}
      </div>
      {active?.hint && (
        <div style={{ ...HINT, paddingLeft: '0.125rem', marginTop: '0.375rem' }}>{active.hint}</div>
      )}
    </div>
  )
}

function ToggleRow({
  label, hint, checked, onChange,
}: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
      <div>
        <div style={{ ...LABEL, marginBottom: hint ? '0.125rem' : 0 }}>{label}</div>
        {hint && <div style={HINT}>{hint}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 0 }).format(value)
}

function parseCurrency(raw: string) {
  return Number(raw.replace(/\D/g, '')) || 0
}

interface TriggerBacktestFormProps {
  strategyConfig?: GenericStrategyConfigDTO
  onTriggered?: (workflowId: string, strategyConfig?: GenericStrategyConfigDTO, signalParams?: { minConfidence: number; compositeIndex: string; entryTiming: string }) => void
}

export function TriggerBacktestForm({ strategyConfig: externalConfig, onTriggered }: TriggerBacktestFormProps) {
  const mode: 'private' | 'public' = getLiveKey() ? 'private' : 'public'
  const mutation = useTriggerBacktest()
  const { isPending, isSuccess, data } = mutation

  const { data: dateRange } = useCandleDateRange()
  const { data: templates } = useGridSearchTemplates()

  const [internalConfig, setInternalConfig] = useState<GenericStrategyConfigDTO>(DEFAULT_GENERIC_STRATEGY)
  const strategyConfig = externalConfig ?? internalConfig

  const oldestDate = dateRange?.oldest ? dateRange.oldest.split('T')[0] : '2024-01-01'
  const latestDate = dateRange?.latest ? dateRange.latest.split('T')[0] : new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    strategyName: 'SwingDailyATR',
    startDate: oldestDate,
    endDate: latestDate,
    minConfidence: 40,
    useTrailingStop: false,
    trailingStopPct: 1.5,
    enableAdminFee: true,
    enableSlippage: true,
    enableHoldDays: true,
    holdDays: 10,
    useATRFilter: true,
    initialCapital: 500000,
    monthlyAddition: 500000,
    dcaDay: 3,
    entryTiming: 'next_day_open',
    compositeIndex: '',
    monthlyProfitCapEnabled: false,
    monthlyProfitCapPct: 5,
    runName: '',
  })

  useEffect(() => {
    if (dateRange) {
      setForm(f => ({
        ...f,
        startDate: dateRange.oldest.split('T')[0],
        endDate: dateRange.latest.split('T')[0],
      }))
    }
  }, [dateRange])

  useEffect(() => {
    if (mode === 'public' && mutation.isSuccess && mutation.data?.workflowId) {
      onTriggered?.(mutation.data.workflowId, strategyConfig, {
        minConfidence: form.minConfidence,
        compositeIndex: form.compositeIndex,
        entryTiming: form.entryTiming,
      })
    }
  }, [mode, mutation.isSuccess, mutation.data, onTriggered, strategyConfig, form.minConfidence, form.compositeIndex, form.entryTiming])

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const rawProfitCap = form.monthlyProfitCapEnabled ? form.monthlyProfitCapPct / 100 : 0
    if (mode === 'public') {
      mutation.mutate({
        startDate:           `${form.startDate}T00:00:00Z`,
        endDate:             `${form.endDate}T23:59:59Z`,
        minConfidence:       form.minConfidence,
        enableAdminFee:      form.enableAdminFee,
        enableSlippage:      form.enableSlippage,
        enableHoldDays:      true,
        initialCapital:      form.initialCapital,
        monthlyAddition:     form.monthlyAddition,
        dcaDay:              form.dcaDay,
        entryTiming:         form.entryTiming,
        compositeIndex:      form.compositeIndex,
        monthlyProfitCapPct: rawProfitCap,
        strategyConfig,
      })
    } else {
      mutation.mutate({
        strategyName:    form.strategyName,
        timeframe:       '1d',
        startDate:       `${form.startDate}T00:00:00Z`,
        endDate:         `${form.endDate}T23:59:59Z`,
        minConfidence:   form.minConfidence,
        useTrailingStop: form.useTrailingStop,
        trailingStopPct: form.trailingStopPct,
        enableAdminFee:  form.enableAdminFee,
        enableSlippage:  form.enableSlippage,
        enableHoldDays:  form.enableHoldDays,
        holdDays:        form.holdDays,
        useATRFilter:    form.useATRFilter,
        initialCapital:      form.initialCapital,
        monthlyAddition:     form.monthlyAddition,
        dcaDay:              form.dcaDay,
        entryTiming:         form.entryTiming,
        compositeIndex:      form.compositeIndex,
        monthlyProfitCapPct: rawProfitCap,
        runName:             form.runName || undefined,
      })
    }
  }

  function applyTemplate(id: string) {
    if (!templates) return
    const t = templates.find(x => x.id === id)
    if (!t) return
    const p = t.workflowParams ?? {}
    setForm(f => ({
      ...f,
      startDate:       t.startDate ? t.startDate.split('T')[0] : f.startDate,
      endDate:         t.endDate   ? t.endDate.split('T')[0]   : f.endDate,
      initialCapital:  t.initialCapital,
      monthlyAddition: t.monthlyAddition,
      ...(p.entryTiming     != null && { entryTiming:     p.entryTiming }),
      ...(p.compositeIndex  != null && { compositeIndex:  p.compositeIndex }),
      ...(p.minConfidence   != null && { minConfidence:   p.minConfidence }),
      ...(p.enableHoldDays  != null && { enableHoldDays:  p.enableHoldDays }),
      ...(p.holdDays        != null && { holdDays:        p.holdDays }),
      ...(p.useTrailingStop != null && { useTrailingStop: p.useTrailingStop }),
      ...(p.trailingStopPct != null && { trailingStopPct: p.trailingStopPct }),
      ...(p.enableSlippage  != null && { enableSlippage:  p.enableSlippage }),
      ...(p.enableAdminFee  != null && { enableAdminFee:  p.enableAdminFee }),
      ...(p.dcaDay          != null && { dcaDay:          p.dcaDay }),
      ...(p.monthlyProfitCapPct != null && {
        monthlyProfitCapEnabled: p.monthlyProfitCapPct > 0,
        monthlyProfitCapPct: p.monthlyProfitCapPct > 0 ? Math.round(p.monthlyProfitCapPct * 100) : f.monthlyProfitCapPct,
      }),
      ...(p.useATRFilter != null && { useATRFilter: p.useATRFilter }),
    }))
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Grid Search Template — private only */}
      {mode === 'private' && templates && templates.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={LABEL}>Load from Grid Search Template</label>
          <select
            defaultValue=""
            onChange={e => { if (e.target.value) applyTemplate(e.target.value) }}
            className="input-field"
            style={{ width: '100%' }}
          >
            <option value="">— select a top-10 template —</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.strategyName} · ROI {t.profitPercentage.toFixed(1)}% · WR {t.winRate.toFixed(1)}%
              </option>
            ))}
          </select>
          <div style={HINT}>Pre-fills capital and DCA from the selected grid search run.</div>
        </div>
      )}

      {/* Private: strategy + run name */}
      {mode === 'private' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.25rem', marginBottom: '1rem' }}>
            <div>
              <label style={LABEL}>Strategy</label>
              <select
                value={form.strategyName}
                onChange={e => set('strategyName', e.target.value)}
                className="input-field"
                style={{ width: '100%' }}
              >
                {STRATEGIES.map(s => (
                  <option key={s.value} value={s.value} disabled={!s.enabled}>
                    {s.label}{!s.enabled ? ' (unavailable)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={LABEL}>Timeframe</label>
              <select value="1d" disabled className="input-field" style={{ width: '100%', opacity: 0.5 }}>
                <option value="1d">1d — Daily swing</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={LABEL}>
              Run Name
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ink-3)', marginLeft: '0.375rem' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={form.runName}
              onChange={e => set('runName', e.target.value)}
              placeholder="e.g. no-slippage-test, high-conf-50"
              className="input-field"
              style={{ width: '100%' }}
              maxLength={80}
            />
            <div style={HINT}>Custom label stored in DB. Defaults to strategy name if empty.</div>
          </div>
          {/* Inline GenericStrategyPanel only if parent did not extract it */}
          {!externalConfig && (
            <div style={DIVIDER}>
              <GenericStrategyPanel value={internalConfig} onChange={setInternalConfig} />
            </div>
          )}
        </>
      )}

      {/* ── Simulation Window ── */}
      <div style={mode === 'private' ? DIVIDER : {}}>
        <div style={SECTION_HEAD}>Simulation Window</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem' }}>
          <div>
            <label style={LABEL}>Start Date</label>
            <input
              type="date"
              value={form.startDate}
              min={oldestDate}
              max={form.endDate}
              onChange={e => set('startDate', e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
              required
            />
          </div>
          <div>
            <label style={LABEL}>End Date</label>
            <input
              type="date"
              value={form.endDate}
              min={form.startDate}
              max={latestDate}
              onChange={e => set('endDate', e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
              required
            />
          </div>
        </div>
        <div style={HINT}>Historical window to replay. Longer periods give more reliable results.</div>
      </div>

      {/* ── Capital ── */}
      <div style={DIVIDER}>
        <div style={SECTION_HEAD}>Capital</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem 1rem', alignItems: 'end' }}>
          <div>
            <label style={LABEL}>Initial Capital (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={formatCurrency(form.initialCapital)}
              onChange={e => set('initialCapital', parseCurrency(e.target.value))}
              className="input-field"
              style={{ width: '100%' }}
            />
            <div style={HINT}>Starting cash on day 1.</div>
          </div>
          <div>
            <label style={LABEL}>Monthly DCA (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={formatCurrency(form.monthlyAddition)}
              onChange={e => set('monthlyAddition', parseCurrency(e.target.value))}
              className="input-field"
              style={{ width: '100%' }}
            />
            <div style={HINT}>Added each month. Set 0 to disable.</div>
          </div>
          <div>
            <label style={LABEL}>DCA Day</label>
            <input
              type="number"
              min={1} max={20}
              value={form.dcaDay}
              onChange={e => set('dcaDay', Math.max(1, Number(e.target.value)))}
              className="input-field"
              style={{ width: '4rem' }}
            />
            <div style={HINT}>of month</div>
          </div>
        </div>
      </div>

      {/* ── Signal Filter ── */}
      <div style={DIVIDER}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.625rem' }}>
          <div style={SECTION_HEAD}>Signal Filter</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: '2.5rem', color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {form.minConfidence}<em style={{ fontSize: '1rem', color: 'var(--ink-3)', fontStyle: 'italic' }}>%</em>
          </div>
        </div>
        <input
          type="range" min={20} max={90} step={5}
          value={form.minConfidence}
          onChange={e => set('minConfidence', Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', ...HINT, marginTop: '0.375rem' }}>
          <span>20% — more trades</span>
          <span>fewer, higher-confidence → 90%</span>
        </div>
        <div style={{ ...HINT, marginTop: '0.25rem' }}>Start at 40–60%. Lower = more trades but more noise.</div>
      </div>

      {/* ── Private-only risk controls ── */}
      {mode === 'private' && (
        <div style={DIVIDER}>
          <div style={SECTION_HEAD}>Risk Controls</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <ToggleRow label="ATR Filter" hint="Skip low-volatility stocks" checked={form.useATRFilter} onChange={v => set('useATRFilter', v)} />
            <ToggleRow label="Hold Day Limit" hint="Auto-sell if the trade is still open after N days" checked={form.enableHoldDays} onChange={v => set('enableHoldDays', v)} />
            {form.enableHoldDays && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <input
                  type="number" min={1} max={60}
                  value={form.holdDays}
                  onChange={e => set('holdDays', Number(e.target.value))}
                  className="input-field"
                  style={{ width: '5rem' }}
                />
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8125rem', color: 'var(--ink-3)' }}>days max</span>
              </div>
            )}
            <ToggleRow label="Trailing Stop" hint="Dynamic exit on reversal (off by default)" checked={form.useTrailingStop} onChange={v => set('useTrailingStop', v)} />
            {form.useTrailingStop && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <input
                  type="number" min={0.5} max={10} step={0.5}
                  value={form.trailingStopPct}
                  onChange={e => set('trailingStopPct', Number(e.target.value))}
                  className="input-field"
                  style={{ width: '5rem' }}
                />
                <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8125rem', color: 'var(--ink-3)' }}>% trail distance</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Execution ── */}
      <div style={DIVIDER}>
        <div style={SECTION_HEAD}>Execution</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ ...LABEL, marginBottom: '0.5rem' }}>Entry Timing</div>
            <OptionGroup
              options={ENTRY_TIMINGS as { value: string; label: string; hint?: string }[]}
              value={form.entryTiming}
              onChange={v => set('entryTiming', v)}
            />
          </div>
          <div>
            <div style={{ ...LABEL, marginBottom: '0.5rem' }}>Market Filter</div>
            <OptionGroup
              options={MARKET_FILTERS as { value: string; label: string; hint?: string }[]}
              value={form.compositeIndex}
              onChange={v => set('compositeIndex', v)}
            />
          </div>
        </div>
      </div>

      {/* ── Costs & Limits ── */}
      <div style={DIVIDER}>
        <div style={SECTION_HEAD}>Costs & Limits</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.625rem 0.75rem',
            background: 'var(--bg-3)', borderRadius: '0.5rem', border: '1px solid var(--line)',
          }}>
            <div>
              <div style={{ ...LABEL, marginBottom: '0.125rem' }}>Admin Fee</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6875rem', color: 'var(--ink-3)' }}>Buy 0.15% / Sell 0.25%</div>
            </div>
            <Toggle checked={form.enableAdminFee} onChange={v => set('enableAdminFee', v)} />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.625rem 0.75rem',
            background: 'var(--bg-3)', borderRadius: '0.5rem', border: '1px solid var(--line)',
          }}>
            <div>
              <div style={{ ...LABEL, marginBottom: '0.125rem' }}>Slippage</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6875rem', color: 'var(--ink-3)' }}>Price shift on orders</div>
            </div>
            <Toggle checked={form.enableSlippage} onChange={v => set('enableSlippage', v)} />
          </div>
        </div>
        <div style={{
          padding: '0.75rem 0.875rem',
          background: 'var(--bg-3)', borderRadius: '0.5rem', border: '1px solid var(--line)',
        }}>
          <ToggleRow
            label="Monthly Profit Cap"
            hint="Stop new entries once period gain hits target"
            checked={form.monthlyProfitCapEnabled}
            onChange={v => set('monthlyProfitCapEnabled', v)}
          />
          {form.monthlyProfitCapEnabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.625rem' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8125rem', color: 'var(--ink-2)' }}>Lock at</span>
              <input
                type="number" min={1} max={100} step={1}
                value={form.monthlyProfitCapPct}
                onChange={e => set('monthlyProfitCapPct', Number(e.target.value))}
                className="input-field"
                style={{ width: '4.375rem' }}
              />
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8125rem', color: 'var(--ink-2)' }}>% / month</span>
            </div>
          )}
        </div>
      </div>

      {/* Success banner */}
      {isSuccess && data && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '0.75rem 1rem', borderRadius: '0.5rem', marginTop: '1.25rem',
            background: 'color-mix(in srgb, var(--up) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--up) 25%, transparent)',
            fontFamily: 'var(--mono)', fontSize: '0.8125rem', color: 'var(--up)',
            letterSpacing: '0.02em',
          }}
        >
          {mode === 'public' && data.workflowId ? (
            <>
              Backtest queued — workflow <strong>{data.workflowId}</strong>
              <br />
              <span style={{ color: 'var(--ink-2)', fontSize: '0.75rem' }}>
                Results will appear at /backtests/public/[id] once complete.
              </span>
            </>
          ) : (
            <>Triggered: {data.workflowId} — {data.message}</>
          )}
        </motion.div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn primary"
        style={{ width: '100%', justifyContent: 'center', padding: '0.875rem 1.25rem', fontSize: '0.9375rem', marginTop: '1.5rem' }}
      >
        {isPending ? (
          <div
            className="animate-spin"
            style={{
              width: '1rem', height: '1rem', borderRadius: '50%',
              border: '2px solid rgba(10,20,0,0.3)',
              borderTopColor: 'var(--accent-ink)',
            }}
          />
        ) : (
          <Zap style={{ width: '1rem', height: '1rem' }} />
        )}
        {isPending ? 'Running…' : 'Run Backtest'}
      </button>
    </form>
  )
}
