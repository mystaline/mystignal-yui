import type { GenericStrategyConfigDTO } from '@/types/backtest'

interface Props {
  value: GenericStrategyConfigDTO
  onChange: (cfg: GenericStrategyConfigDTO) => void
}

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

const INDICATOR_CARD: React.CSSProperties = {
  border: '1px solid var(--line)',
  borderRadius: '0.5rem',
  padding: '0.875rem 1rem',
  marginBottom: '0.75rem',
}

const INDICATOR_HEADER: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '0.75rem',
}

const GRID2: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '0.75rem 1rem',
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

function NumberInput({
  value, onChange, min, max, step, width = '5rem',
}: {
  value: number; onChange: (v: number) => void
  min?: number; max?: number; step?: number; width?: string
}) {
  return (
    <input
      type="number"
      value={value}
      min={min} max={max} step={step}
      onChange={e => onChange(Number(e.target.value))}
      className="input-field"
      style={{ width }}
    />
  )
}

function totalWeight(cfg: GenericStrategyConfigDTO) {
  let w = 0
  if (cfg.rsi.enabled)    w += cfg.rsi.weight
  if (cfg.ema.enabled)    w += cfg.ema.weight
  if (cfg.volume.enabled) w += cfg.volume.weight
  return w
}

export function GenericStrategyPanel({ value: cfg, onChange }: Props) {
  function patchRsi(patch: Partial<typeof cfg.rsi>) {
    onChange({ ...cfg, rsi: { ...cfg.rsi, ...patch } })
  }
  function patchEma(patch: Partial<typeof cfg.ema>) {
    onChange({ ...cfg, ema: { ...cfg.ema, ...patch } })
  }
  function patchVolume(patch: Partial<typeof cfg.volume>) {
    onChange({ ...cfg, volume: { ...cfg.volume, ...patch } })
  }
  function patchAtrFilter(patch: Partial<typeof cfg.atrFilter>) {
    onChange({ ...cfg, atrFilter: { ...cfg.atrFilter, ...patch } })
  }

  const tw = totalWeight(cfg)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ ...LABEL, marginBottom: 0 }}>Strategy Indicators</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: tw > 0 ? 'var(--accent)' : 'var(--down)' }}>
          total weight: {tw.toFixed(2)}
        </div>
      </div>

      {/* RSI */}
      <div style={{
        ...INDICATOR_CARD,
        borderColor: cfg.rsi.enabled ? 'color-mix(in srgb, var(--accent) 30%, var(--line))' : 'var(--line)',
      }}>
        <div style={INDICATOR_HEADER}>
          <div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)' }}>RSI</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ink-3)', marginLeft: '0.5rem' }}>
              Oversold momentum
            </span>
          </div>
          <Toggle checked={cfg.rsi.enabled} onChange={v => patchRsi({ enabled: v })} />
        </div>
        {cfg.rsi.enabled && (
          <div style={GRID2}>
            <div>
              <label style={LABEL}>Period</label>
              <NumberInput value={cfg.rsi.period} onChange={v => patchRsi({ period: v })} min={5} max={50} />
            </div>
            <div>
              <label style={LABEL}>Oversold threshold</label>
              <NumberInput value={cfg.rsi.oversoldThreshold} onChange={v => patchRsi({ oversoldThreshold: v })} min={10} max={50} />
            </div>
            <div>
              <label style={LABEL}>Weight</label>
              <NumberInput value={cfg.rsi.weight} onChange={v => patchRsi({ weight: v })} min={0.05} max={1} step={0.05} />
            </div>
          </div>
        )}
      </div>

      {/* EMA */}
      <div style={{
        ...INDICATOR_CARD,
        borderColor: cfg.ema.enabled ? 'color-mix(in srgb, var(--accent) 30%, var(--line))' : 'var(--line)',
      }}>
        <div style={INDICATOR_HEADER}>
          <div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)' }}>EMA Crossover</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ink-3)', marginLeft: '0.5rem' }}>
              Trend direction
            </span>
          </div>
          <Toggle checked={cfg.ema.enabled} onChange={v => patchEma({ enabled: v })} />
        </div>
        {cfg.ema.enabled && (
          <div style={GRID2}>
            <div>
              <label style={LABEL}>Fast period</label>
              <NumberInput value={cfg.ema.fastPeriod} onChange={v => patchEma({ fastPeriod: v })} min={3} max={50} />
            </div>
            <div>
              <label style={LABEL}>Slow period</label>
              <NumberInput value={cfg.ema.slowPeriod} onChange={v => patchEma({ slowPeriod: v })} min={10} max={200} />
            </div>
            <div>
              <label style={LABEL}>Weight</label>
              <NumberInput value={cfg.ema.weight} onChange={v => patchEma({ weight: v })} min={0.05} max={1} step={0.05} />
            </div>
          </div>
        )}
      </div>

      {/* Volume */}
      <div style={{
        ...INDICATOR_CARD,
        borderColor: cfg.volume.enabled ? 'color-mix(in srgb, var(--accent) 30%, var(--line))' : 'var(--line)',
      }}>
        <div style={INDICATOR_HEADER}>
          <div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)' }}>Volume Spike</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ink-3)', marginLeft: '0.5rem' }}>
              Breakout confirmation
            </span>
          </div>
          <Toggle checked={cfg.volume.enabled} onChange={v => patchVolume({ enabled: v })} />
        </div>
        {cfg.volume.enabled && (
          <div style={GRID2}>
            <div>
              <label style={LABEL}>Spike threshold (×avg)</label>
              <NumberInput value={cfg.volume.spikeThreshold} onChange={v => patchVolume({ spikeThreshold: v })} min={1} max={5} step={0.1} />
            </div>
            <div>
              <label style={LABEL}>Weight</label>
              <NumberInput value={cfg.volume.weight} onChange={v => patchVolume({ weight: v })} min={0.05} max={1} step={0.05} />
            </div>
          </div>
        )}
      </div>

      {/* ATR Filter */}
      <div style={{ ...INDICATOR_CARD, marginBottom: '1.25rem' }}>
        <div style={INDICATOR_HEADER}>
          <div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--ink)' }}>ATR Volatility Gate</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ink-3)', marginLeft: '0.5rem' }}>
              Skip low-vol stocks (unscored)
            </span>
          </div>
          <Toggle checked={cfg.atrFilter.enabled} onChange={v => patchAtrFilter({ enabled: v })} />
        </div>
        {cfg.atrFilter.enabled && (
          <div style={GRID2}>
            <div>
              <label style={LABEL}>ATR period</label>
              <NumberInput value={cfg.atrFilter.period} onChange={v => patchAtrFilter({ period: v })} min={5} max={50} />
            </div>
            <div>
              <label style={LABEL}>Min ATR %</label>
              <NumberInput value={cfg.atrFilter.minAtrPct} onChange={v => patchAtrFilter({ minAtrPct: v })} min={0.001} max={0.1} step={0.001} width="6.25rem" />
            </div>
          </div>
        )}
      </div>

      {/* Risk Parameters */}
      <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '0.875rem' }}>
          Risk Parameters
        </div>
        <div style={{ ...GRID2 }}>
          <div>
            <label style={LABEL}>SL multiplier (× ATR)</label>
            <NumberInput value={cfg.slMultiplier} onChange={v => onChange({ ...cfg, slMultiplier: v })} min={0.5} max={10} step={0.5} />
          </div>
          <div>
            <label style={LABEL}>TP multiplier (× ATR)</label>
            <NumberInput value={cfg.tpMultiplier} onChange={v => onChange({ ...cfg, tpMultiplier: v })} min={0.5} max={20} step={0.5} />
          </div>
          <div>
            <label style={LABEL}>Hold days limit</label>
            <NumberInput value={cfg.holdDays} onChange={v => onChange({ ...cfg, holdDays: v })} min={1} max={60} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ ...LABEL, marginBottom: 0 }}>Trailing stop</label>
              <Toggle checked={cfg.useTrailingStop} onChange={v => onChange({ ...cfg, useTrailingStop: v })} />
            </div>
            {cfg.useTrailingStop && (
              <>
                <label style={LABEL}>Trail %</label>
                <NumberInput value={cfg.trailingStopPct} onChange={v => onChange({ ...cfg, trailingStopPct: v })} min={0.5} max={10} step={0.5} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
