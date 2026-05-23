import { useGridSearchTemplates } from '@/hooks/useGridSearchTemplates'
import type { TriggerAnalyzeRequest } from '@/types/signal'

interface Props {
  config: TriggerAnalyzeRequest
  onConfigChange: (config: TriggerAnalyzeRequest) => void
  selectedTemplateId: string | null
  onTemplateSelect: (id: string | null) => void
  triggering?: boolean
  onTrigger?: () => void
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

export function AnalysisConfigPanel({
  config,
  onConfigChange,
  selectedTemplateId,
  onTemplateSelect,
  triggering,
  onTrigger,
}: Props) {
  const { data: templates } = useGridSearchTemplates()

  const updateConfig = (updates: Partial<TriggerAnalyzeRequest>) => {
    onConfigChange({ ...config, ...updates })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Template selector */}
      <div>
        <label style={LABEL}>Template</label>
        <select
          value={selectedTemplateId || ''}
          onChange={e => onTemplateSelect(e.target.value || null)}
          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', cursor: 'pointer' }}
        >
          <option value="">Custom Config</option>
          {templates?.map(t => (
            <option key={t.id} value={t.id}>
              {t.strategyName}
            </option>
          ))}
        </select>
      </div>

      {/* Min Confidence slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
          <label style={LABEL}>Min Confidence</label>
          <div style={{ fontFamily: 'var(--display)', fontSize: 36, color: 'var(--accent)', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {config.minConfidence}
            <em style={{ fontSize: 18, color: 'var(--ink-2)' }}>%</em>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={config.minConfidence}
          onChange={e => updateConfig({ minConfidence: parseInt(e.target.value, 10) })}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 4, letterSpacing: '0.06em' }}>
          <span>RISKY</span>
          <span>BALANCED</span>
          <span>STRICT</span>
        </div>
      </div>

      {/* Composite Index */}
      <div>
        <label style={LABEL}>Composite Index</label>
        <input
          type="text"
          value={config.compositeIndex}
          onChange={e => updateConfig({ compositeIndex: e.target.value })}
          placeholder="e.g. ^JKSE"
          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)' }}
        />
      </div>

      {/* Min ATR% */}
      <div>
        <div style={{ marginBottom: 8 }}>
          <label style={LABEL}>Min ATR%</label>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)' }}>Skip low-volatility stocks · 0 = default (2%)</div>
        </div>
        <input
          type="number"
          min="0"
          step="0.5"
          value={config.minATRPct}
          onChange={e => updateConfig({ minATRPct: parseFloat(e.target.value) || 0 })}
          style={{ width: 80, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', textAlign: 'right' }}
        />
      </div>

      {/* Hold Days */}
      <div>
        <label style={LABEL}>Hold Days</label>
        <input
          type="number"
          min="1"
          max="365"
          value={config.holdDays}
          onChange={e => updateConfig({ holdDays: parseInt(e.target.value, 10) || 1 })}
          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)' }}
        />
      </div>

      {/* Trailing Stop */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.useTrailingStop}
            onChange={e => updateConfig({ useTrailingStop: e.target.checked })}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: 12, color: 'var(--ink)' }}>Use Trailing Stop</span>
        </label>
        {config.useTrailingStop && (
          <input
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={config.trailingStopPct}
            onChange={e => updateConfig({ trailingStopPct: parseFloat(e.target.value) || 1.5 })}
            placeholder="1.5%"
            style={{ width: '100%', marginTop: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)' }}
          />
        )}
      </div>

      {/* Entry Timing */}
      <div>
        <label style={LABEL}>Entry Timing</label>
        <select
          value={config.entryTiming}
          onChange={e => updateConfig({ entryTiming: e.target.value })}
          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--ink)', cursor: 'pointer' }}
        >
          <option value="market_open">Market Open</option>
          <option value="next_day_open">Next Day Open</option>
          <option value="limit_order">Limit Order</option>
        </select>
      </div>

      {/* Trigger button */}
      {onTrigger && (
        <button
          onClick={onTrigger}
          disabled={triggering}
          style={{
            width: '100%',
            padding: '12px 0',
            borderRadius: 8,
            background: 'var(--accent)',
            color: '#000',
            border: 'none',
            cursor: triggering ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            opacity: triggering ? 0.6 : 1,
          }}
        >
          {triggering ? 'Analyzing…' : 'Run Analysis'}
        </button>
      )}
    </div>
  )
}
