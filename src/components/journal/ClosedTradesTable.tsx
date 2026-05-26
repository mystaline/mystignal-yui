import { TradePnlBadge } from '@/components/ui/Badge'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatDate, formatDuration, formatIDR, formatPct } from '@/lib/utils'
import type { JournalTrade } from '@/types/trade'

interface Props {
  trades: JournalTrade[]
  isLoading: boolean
}

const COL = '5rem 3.4375rem 6.875rem 6.875rem 6.875rem 5.625rem 10rem 4.375rem'

function ColHeader() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: COL, color: 'var(--ink-3)', fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase', paddingBottom: '0.375rem', borderBottom: '1px solid var(--line)' }}>
      <span>Symbol</span>
      <span>Lot</span>
      <span className="text-right">Entry</span>
      <span className="text-right">Exit</span>
      <span className="text-right">Entry Date</span>
      <span className="text-right">Hold</span>
      <span className="text-right">Realized PnL</span>
      <span className="text-right">Result</span>
    </div>
  )
}

export function ClosedTradesTable({ trades, isLoading }: Props) {
  if (isLoading) return <LoadingState rows={4} height="h-12" />

  if (trades.length === 0) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--ink-3)' }} className="mono">
        No closed trades
      </div>
    )
  }

  return (
    <div className="neon-card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '0 1.25rem' }}>
        <ColHeader />
        {trades.map(t => {
          const pnlColor = (t.profitLoss ?? 0) >= 0 ? 'var(--up)' : 'var(--down)'
          return (
            <div
              key={t.id}
              style={{ display: 'grid', gridTemplateColumns: COL, alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--line)' }}
            >
              <span className="mono font-bold" style={{ color: 'var(--accent)' }}>{t.symbol}</span>
              <span className="mono" style={{ color: 'var(--ink-2)' }}>{t.lot}L</span>
              <span className="mono text-right">{formatIDR(t.entryPrice)}</span>
              <span className="mono text-right">{t.exitPrice != null ? formatIDR(t.exitPrice) : '—'}</span>
              <span className="mono text-right" style={{ color: 'var(--ink-2)' }}>{formatDate(t.entryTime)}</span>
              <span className="mono text-right" style={{ color: 'var(--ink-2)' }}>
                {t.holdTimeMinutes ? formatDuration(t.holdTimeMinutes) : '—'}
              </span>
              <div className="text-right">
                <span className="mono" style={{ color: pnlColor }}>{t.profitLoss != null ? formatIDR(t.profitLoss) : '—'}</span>
                {t.profitLossPct != null && (
                  <span className="mono" style={{ color: pnlColor, fontSize: '0.6875rem', marginLeft: '0.25rem' }}>
                    ({formatPct(t.profitLossPct, true)})
                  </span>
                )}
              </div>
              <div className="text-right">
                {t.profitLoss != null ? <TradePnlBadge pnl={t.profitLoss} /> : '—'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
