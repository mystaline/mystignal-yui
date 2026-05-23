interface StatCardProps {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  accent?: 'primary' | 'success' | 'danger' | 'warning'
  large?: boolean
}

const TREND_INDICATOR = {
  up:      { symbol: '▲', color: 'var(--up)' },
  down:    { symbol: '▼', color: 'var(--down)' },
  neutral: { symbol: '—', color: 'var(--ink-3)' },
}

export function StatCard({ label, value, sub, trend, accent = 'primary', large = false }: StatCardProps) {
  const trendInfo = trend ? TREND_INDICATOR[trend] : null

  const accentColorVar =
    accent === 'primary' ? 'var(--accent)' :
    accent === 'success' ? 'var(--up)' :
    accent === 'danger'  ? 'var(--down)' :
                           'var(--amber)'

  return (
    <div className="card card-hover p-4 flex flex-col gap-2 cursor-default">
      <p className="eyebrow">{label}</p>
      <div className="flex items-end gap-2">
        <span
          className={`mono font-bold ${large ? 'text-3xl' : 'text-xl'}`}
          style={{ color: accentColorVar }}
        >
          {value}
        </span>
        {trendInfo && (
          <span className="mono text-sm mb-0.5" style={{ color: trendInfo.color }}>
            {trendInfo.symbol}
          </span>
        )}
      </div>
      {sub && <p className="mono text-xs" style={{ color: 'var(--ink-3)' }}>{sub}</p>}
    </div>
  )
}
