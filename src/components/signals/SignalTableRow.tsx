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
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--line)' }}>
      {/* Type badge */}
      <div style={{ minWidth: '3.75rem' }}>
        <SignalBadge type={signal.type} />
      </div>

      {/* Symbol */}
      <div style={{ minWidth: '4.375rem', fontFamily: 'var(--mono)', fontSize: '0.8125rem', fontWeight: 600 }}>
        {signal.symbol}
      </div>

      {/* Price */}
      <div style={{ minWidth: '5rem', fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--ink-2)' }}>
        {formatIDR(signal.price)}
      </div>

      {/* Confidence */}
      <div style={{ minWidth: '3.125rem', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
        {Math.round(signal.confidence)}%
      </div>

      {/* Gap */}
      <div style={{ minWidth: '3.75rem', fontSize: '0.6875rem', color: 'var(--ink-3)' }}>
        {gapDisplay}
      </div>

      {/* Days old */}
      <div style={{ fontSize: '0.625rem', color: 'var(--ink-3)', marginLeft: 'auto', minWidth: '2.5rem' }}>
        {daysOld}d
      </div>
    </div>
  )
}
