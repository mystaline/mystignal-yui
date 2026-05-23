import { useState, useEffect, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useTriggerBacktest } from '@/hooks/useTriggerBacktest'
import { useTriggerPublicBacktest } from '@/hooks/useTriggerPublicBacktest'
import { useCandleDateRange } from '@/hooks/useCandleDateRange'
import { usePublicCandleDateRange } from '@/hooks/usePublicCandleDateRange'
import { useGridSearchTemplates } from '@/hooks/useGridSearchTemplates'
import { GenericStrategyPanel } from './GenericStrategyPanel'
import { DEFAULT_GENERIC_STRATEGY, type GenericStrategyConfigDTO } from '@/types/backtest'

const ENTRY_TIMINGS = [
  { value: 'next_day_open', label: 'Analyze close → Next day open' },
  { value: 'prev_close_next_open', label: 'Analyze prev close → Today open' },
  { value: 'post_close', label: 'Analyze close → Same close (look-ahead)' },
]

const COMPOSITE_INDEXES = [
  { value: '', label: 'No filter' },
  { value: '^JKSE', label: 'IHSG (^JKSE)' },
]

const STRATEGIES = [
  { value: 'SwingDailyATR', label: 'SwingDailyATR', enabled: true },
  { value: 'MomentumBreakout', label: 'MomentumBreakout', enabled: false },
  { value: 'RSIReversion', label: 'RSIReversion', enabled: false },
]

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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'var(--line)',
        position: 'relative', flexShrink: 0, transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: checked ? 'var(--accent-ink)' : 'var(--ink-2)',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'decimal', maximumFractionDigits: 0 }).format(value)
}

function parseCurrency(raw: string) {
  return Number(raw.replace(/\D/g, '')) || 0
}

interface TriggerBacktestFormProps {
  mode?: 'private' | 'public'
}

export function TriggerBacktestForm({ mode = 'private' }: TriggerBacktestFormProps) {
  const privateMutation = useTriggerBacktest()
  const publicMutation  = useTriggerPublicBacktest()
  const { isPending, isSuccess, data } =
    mode === 'public' ? publicMutation : privateMutation

  const { data: privateDateRange } = useCandleDateRange()
  const { data: publicDateRange }  = usePublicCandleDateRange()
  const dateRange = mode === 'public' ? publicDateRange : privateDateRange

  const { data: templates } = useGridSearchTemplates()

  const [strategyConfig, setStrategyConfig] = useState<GenericStrategyConfigDTO>(DEFAULT_GENERIC_STRATEGY)

  const oldestDate = dateRange?.oldest
    ? dateRange.oldest.split('T')[0]
    : '2024-01-01'
  const latestDate = dateRange?.latest
    ? dateRange.latest.split('T')[0]
    : new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    strategyName: 'SwingDailyATR',
    startDate: oldestDate,
    endDate: latestDate,
    minConfidence: 40,
    // Trailing stop
    useTrailingStop: false,
    trailingStopPct: 1.5,
    // Fees
    enableAdminFee: true,
    enableSlippage: true,
    // Hold days
    enableHoldDays: true,
    holdDays: 10,
    // ATR filter
    useATRFilter: true,
    // Capital
    initialCapital: 500000,
    monthlyAddition: 500000,
    dcaDay: 3,
    // Entry & market filter
    entryTiming: 'next_day_open',
    compositeIndex: '',
    monthlyProfitCapPct: 0,
    runName: '',
  })

  // Sync dates once dateRange loads
  useEffect(() => {
    if (dateRange) {
      setForm(f => ({
        ...f,
        startDate: dateRange.oldest.split('T')[0],
        endDate: dateRange.latest.split('T')[0],
      }))
    }
  }, [dateRange])

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (mode === 'public') {
      publicMutation.mutate({
        startDate:           `${form.startDate}T00:00:00Z`,
        endDate:             `${form.endDate}T23:59:59Z`,
        minConfidence:       form.minConfidence,
        enableAdminFee:      form.enableAdminFee,
        enableSlippage:      form.enableSlippage,
        enableHoldDays:      form.enableHoldDays,
        initialCapital:      form.initialCapital,
        monthlyAddition:     form.monthlyAddition,
        dcaDay:              form.dcaDay,
        entryTiming:         form.entryTiming,
        compositeIndex:      form.compositeIndex,
        monthlyProfitCapPct: form.monthlyProfitCapPct,
        strategyConfig,
      })
    } else {
      privateMutation.mutate({
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
        monthlyProfitCapPct: form.monthlyProfitCapPct,
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
      startDate:           t.startDate ? t.startDate.split('T')[0] : f.startDate,
      endDate:             t.endDate   ? t.endDate.split('T')[0]   : f.endDate,
      initialCapital:      t.initialCapital,
      monthlyAddition:     t.monthlyAddition,
      ...(p.entryTiming        != null && { entryTiming:        p.entryTiming }),
      ...(p.compositeIndex     != null && { compositeIndex:     p.compositeIndex }),
      ...(p.minConfidence      != null && { minConfidence:      p.minConfidence }),
      ...(p.enableHoldDays     != null && { enableHoldDays:     p.enableHoldDays }),
      ...(p.holdDays           != null && { holdDays:           p.holdDays }),
      ...(p.useTrailingStop    != null && { useTrailingStop:    p.useTrailingStop }),
      ...(p.trailingStopPct    != null && { trailingStopPct:    p.trailingStopPct }),
      ...(p.enableSlippage     != null && { enableSlippage:     p.enableSlippage }),
      ...(p.enableAdminFee     != null && { enableAdminFee:     p.enableAdminFee }),
      ...(p.dcaDay             != null && { dcaDay:             p.dcaDay }),
      ...(p.monthlyProfitCapPct!= null && { monthlyProfitCapPct: p.monthlyProfitCapPct }),
      ...(p.useATRFilter       != null && { useATRFilter:       p.useATRFilter }),
    }))
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

      {/* Grid Search Template — private only */}
      {mode === 'private' && templates && templates.length > 0 && (
        <div style={{ marginBottom: 20 }}>
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
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
            Pre-fills initial capital and monthly DCA from selected run
          </div>
        </div>
      )}

      {/* Strategy section — private: dropdown, public: parametric config */}
      {mode === 'public' ? (
        <div style={{ ...SECTION, paddingTop: 0, borderTop: 'none', marginBottom: 20 }}>
          <GenericStrategyPanel value={strategyConfig} onChange={setStrategyConfig} />
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginBottom: 20 }}>
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
              <select
                value="1d"
                disabled
                className="input-field"
                style={{ width: '100%', opacity: 0.5 }}
              >
                <option value="1d">1d</option>
                <option value="15m">15m (unavailable)</option>
                <option value="30m">30m (unavailable)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={LABEL}>Run Name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--ink-3)' }}>(optional)</span></label>
            <input
              type="text"
              value={form.runName}
              onChange={e => set('runName', e.target.value)}
              placeholder="e.g. no-slippage-test, high-conf-50"
              className="input-field"
              style={{ width: '100%' }}
              maxLength={80}
            />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>
              Custom label stored in DB. Defaults to strategy name if empty.
            </div>
          </div>
        </>
      )}

      {/* Date range */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginBottom: 20 }}>
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

      {/* Capital */}
      <div style={SECTION}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
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
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={LABEL}>DCA Injection Day</label>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>
            Nth trading day of the month (1 = first day)
          </div>
          <input
            type="number"
            min={1} max={20}
            value={form.dcaDay}
            onChange={e => set('dcaDay', Math.max(1, Number(e.target.value)))}
            className="input-field"
            style={{ width: 80 }}
          />
        </div>
      </div>

      {/* Min Confidence */}
      <div style={{ ...SECTION }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <label style={LABEL}>Min Confidence</label>
          <div style={{ fontFamily: 'var(--display)', fontSize: 36, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {form.minConfidence}<em style={{ fontSize: 18, color: 'var(--ink-2)' }}>%</em>
          </div>
        </div>
        <input
          type="range" min={20} max={90} step={5}
          value={form.minConfidence}
          onChange={e => set('minConfidence', Number(e.target.value))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 4, letterSpacing: '0.06em' }}>
          <span>20%</span><span>90%</span>
        </div>
      </div>

      {/* Toggles */}
      <div style={SECTION}>

        {/* ATR Filter */}
        <div style={{ ...ROW, marginBottom: 16 }}>
          <div>
            <div style={{ ...LABEL, marginBottom: 2 }}>ATR Filter</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>Skip low-volatility stocks</div>
          </div>
          <Toggle checked={form.useATRFilter} onChange={v => set('useATRFilter', v)} />
        </div>

        {/* Admin Fee */}
        <div style={{ ...ROW, marginBottom: 16 }}>
          <div>
            <div style={{ ...LABEL, marginBottom: 2 }}>Admin Fee</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>Broker commission (buy 0.15% / sell 0.25%)</div>
          </div>
          <Toggle checked={form.enableAdminFee} onChange={v => set('enableAdminFee', v)} />
        </div>

        {/* Slippage */}
        <div style={{ ...ROW, marginBottom: 16 }}>
          <div>
            <div style={{ ...LABEL, marginBottom: 2 }}>Slippage</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>Market impact simulation</div>
          </div>
          <Toggle checked={form.enableSlippage} onChange={v => set('enableSlippage', v)} />
        </div>

        {/* Hold Days */}
        <div style={{ ...ROW, marginBottom: form.enableHoldDays ? 10 : 16 }}>
          <div>
            <div style={{ ...LABEL, marginBottom: 2 }}>Hold Day Limit</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>Force-exit after N trading days</div>
          </div>
          <Toggle checked={form.enableHoldDays} onChange={v => set('enableHoldDays', v)} />
        </div>
        {form.enableHoldDays && (
          <div style={{ marginBottom: 16, paddingLeft: 0 }}>
            <label style={LABEL}>Hold Days</label>
            <input
              type="number"
              min={1} max={60}
              value={form.holdDays}
              onChange={e => set('holdDays', Number(e.target.value))}
              className="input-field"
              style={{ width: 100 }}
            />
          </div>
        )}

        {/* Trailing Stop */}
        <div style={{ ...ROW, marginBottom: form.useTrailingStop ? 10 : 0 }}>
          <div>
            <div style={{ ...LABEL, marginBottom: 2 }}>Trailing Stop</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>Dynamic exit on reversal (off by default)</div>
          </div>
          <Toggle checked={form.useTrailingStop} onChange={v => set('useTrailingStop', v)} />
        </div>
        {form.useTrailingStop && (
          <div>
            <label style={LABEL}>Trail % (e.g. 1.5 = 1.5%)</label>
            <input
              type="number"
              min={0.5} max={10} step={0.5}
              value={form.trailingStopPct}
              onChange={e => set('trailingStopPct', Number(e.target.value))}
              className="input-field"
              style={{ width: 100 }}
            />
          </div>
        )}
      </div>

      {/* Entry Timing & Market Filter */}
      <div style={SECTION}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', marginBottom: 16 }}>
          <div>
            <label style={LABEL}>Entry Timing</label>
            <select
              value={form.entryTiming}
              onChange={e => set('entryTiming', e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            >
              {ENTRY_TIMINGS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={LABEL}>Market Filter</label>
            <select
              value={form.compositeIndex}
              onChange={e => set('compositeIndex', e.target.value)}
              className="input-field"
              style={{ width: '100%' }}
            >
              {COMPOSITE_INDEXES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label style={LABEL}>Monthly Profit Cap (%)</label>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>
            Stop new entries once period gain hits this % (0 = disabled)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="number"
              min={0} max={100} step={1}
              value={form.monthlyProfitCapPct === 0 ? '' : Math.round(form.monthlyProfitCapPct * 100)}
              placeholder="0"
              onChange={e => set('monthlyProfitCapPct', e.target.value === '' ? 0 : Number(e.target.value) / 100)}
              className="input-field"
              style={{ width: 80 }}
            />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-3)' }}>
              {form.monthlyProfitCapPct > 0 ? `lock at +${Math.round(form.monthlyProfitCapPct * 100)}%` : 'disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Success */}
      {isSuccess && data && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 16px', borderRadius: 8, marginTop: 20,
            background: 'color-mix(in srgb, var(--up) 8%, transparent)',
            border: '1px solid color-mix(in srgb, var(--up) 25%, transparent)',
            fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--up)',
            letterSpacing: '0.02em',
          }}
        >
          {mode === 'public' && data.workflowId ? (
            <>
              Backtest queued — workflow <strong>{data.workflowId}</strong>
              <br />
              <span style={{ color: 'var(--ink-2)', fontSize: 11 }}>
                Results will be available at /backtests/public/[id] once complete.
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
        style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: 14, marginTop: 24 }}
      >
        {isPending ? (
          <div
            className="animate-spin"
            style={{
              width: 16, height: 16, borderRadius: '50%',
              border: '2px solid rgba(10,20,0,0.3)',
              borderTopColor: 'var(--accent-ink)',
            }}
          />
        ) : (
          <Zap style={{ width: 16, height: 16 }} />
        )}
        {isPending ? 'Running…' : 'Run Backtest'}
      </button>
    </form>
  )
}
