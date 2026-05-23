import { LoadingState } from '@/components/ui/LoadingState'
import { formatIDR, formatPct } from '@/lib/utils'
import type { JournalSummary } from '@/types/trade'

interface Props {
  summary: JournalSummary | undefined
  isLoading: boolean
}

export function JournalSummaryStrip({ summary, isLoading }: Props) {
  const cells = [
    {
      label: 'Open Positions',
      value: isLoading ? '—' : String(summary?.openCount ?? 0),
      color: 'var(--ink)',
    },
    {
      label: 'Unrealized PnL',
      value: isLoading ? '—' : formatIDR(summary?.totalUnrealizedPnl ?? 0),
      color: (summary?.totalUnrealizedPnl ?? 0) >= 0 ? 'var(--up)' : 'var(--down)',
    },
    {
      label: 'Realized PnL',
      value: isLoading ? '—' : formatIDR(summary?.totalRealizedPnl ?? 0),
      color: (summary?.totalRealizedPnl ?? 0) >= 0 ? 'var(--up)' : 'var(--down)',
    },
    {
      label: 'Win Rate',
      value: isLoading ? '—' : formatPct(summary?.winRate ?? 0),
      color: (summary?.winRate ?? 0) >= 50 ? 'var(--up)' : 'var(--ink-2)',
    },
  ]

  return (
    <div className="agg-strip">
      {cells.map(cell => (
        <div key={cell.label} className="c">
          <span className="l">{cell.label}</span>
          {isLoading
            ? <LoadingState rows={1} height="h-7" />
            : <span className="v display" style={{ color: cell.color }}>{cell.value}</span>
          }
        </div>
      ))}
    </div>
  )
}
