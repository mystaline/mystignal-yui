import { TradePnlBadge } from '@/components/ui/Badge'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatDate, formatDuration, formatIDR, formatPct } from '@/lib/utils'
import type { JournalTrade } from '@/types/trade'

interface Props {
  trades: JournalTrade[]
  isLoading: boolean
}

const COL = '80px 55px 110px 110px 110px 90px 160px 70px'

function ColHeader() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: COL, color: 'var(--ink-3)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', paddingBottom: 6, borderBottom: '1px solid var(--line)' }}>
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
      <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink-3)' }} className="mono">
        No closed trades
      </div>
    )
  }

  return (
    <div className="neon-card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '0 20px' }}>
        <ColHeader />
        {trades.map(t => {
          const pnlColor = (t.profitLoss ?? 0) >= 0 ? 'var(--up)' : 'var(--down)'
          return (
            <div
              key={t.id}
              style={{ display: 'grid', gridTemplateColumns: COL, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--line)' }}
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
                  <span className="mono" style={{ color: pnlColor, fontSize: 11, marginLeft: 4 }}>
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
