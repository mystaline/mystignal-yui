import { SignalBadge } from '@/components/ui/Badge'
import { formatIDR } from '@/lib/utils'
import type { SignalResponse } from '@/types/signal'

interface Props {
  signal: SignalResponse
}

export function SignalTableRow({ signal }: Props) {
  const daysOld = signal.daysOld ?? 0
  const gapDisplay = signal.priceGapPct ? `${signal.priceGapPct > 0 ? '+' : ''}${signal.priceGapPct.toFixed(2)}%` : '—'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
      {/* Type badge */}
      <div style={{ minWidth: 60 }}>
        <SignalBadge type={signal.type} />
      </div>

      {/* Symbol */}
      <div style={{ minWidth: 70, fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600 }}>
        {signal.symbol}
      </div>

      {/* Price */}
      <div style={{ minWidth: 80, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-2)' }}>
        {formatIDR(signal.price)}
      </div>

      {/* Confidence */}
      <div style={{ minWidth: 50, fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
        {Math.round(signal.confidence)}%
      </div>

      {/* Gap */}
      <div style={{ minWidth: 60, fontSize: 11, color: 'var(--ink-3)' }}>
        {gapDisplay}
      </div>

      {/* Days old */}
      <div style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 'auto', minWidth: 40 }}>
        {daysOld}d
      </div>
    </div>
  )
}
