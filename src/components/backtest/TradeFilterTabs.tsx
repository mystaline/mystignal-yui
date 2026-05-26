import type { TradeFilter } from '@/types/backtest'

interface Props {
  active: TradeFilter
  onChange: (filter: TradeFilter) => void
  counts?: {
    all?: number
    open?: number
    realized?: number
  }
}

const TAB_STYLE: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  fontSize: '0.75rem',
  fontFamily: 'var(--mono)',
  fontWeight: 600,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: 'var(--ink-2)',
  borderBottom: '2px solid transparent',
}

const ACTIVE_TAB_STYLE: React.CSSProperties = {
  ...TAB_STYLE,
  color: 'var(--accent)',
  borderBottomColor: 'var(--accent)',
}

export function TradeFilterTabs({ active, onChange, counts = {} }: Props) {
  const tabs: { value: TradeFilter; label: string }[] = [
    { value: 'all', label: `All${counts.all ? ` (${counts.all})` : ''}` },
    { value: 'open', label: `Open${counts.open ? ` (${counts.open})` : ''}` },
    { value: 'realized', label: `Realized${counts.realized ? ` (${counts.realized})` : ''}` },
  ]

  return (
    <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--line)', marginBottom: '1rem' }}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          style={active === tab.value ? ACTIVE_TAB_STYLE : TAB_STYLE}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
