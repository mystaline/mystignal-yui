import { LoadingState } from '@/components/ui/LoadingState'
import { formatIDR, formatPct } from '@/lib/utils'
import type { JournalTrade } from '@/types/trade'

interface Props {
  trades: JournalTrade[]
  isLoading: boolean
  onClose: (trade: JournalTrade) => void
  onCancel: (id: string) => void
}

const COL = '5rem 3.75rem 6.875rem 6.875rem 8.75rem 8.75rem 6.25rem 6.25rem 7.5rem'

function ColHeader() {
  return (
    <div className="bt-row" style={{ display: 'grid', gridTemplateColumns: COL, color: 'var(--ink-3)', fontSize: '0.6875rem', letterSpacing: '0.06em', textTransform: 'uppercase', paddingBottom: '0.375rem', borderBottom: '1px solid var(--line)' }}>
      <span>Symbol</span>
      <span>Lot</span>
      <span className="text-right">Entry</span>
      <span className="text-right">Latest</span>
      <span className="text-right">Unreal. PnL</span>
      <span className="text-right">PnL %</span>
      <span className="text-right">TP</span>
      <span className="text-right">SL</span>
      <span />
    </div>
  )
}

export function OpenPositionsTable({ trades, isLoading, onClose, onCancel }: Props) {
  if (isLoading) return <LoadingState rows={4} height="h-12" />

  if (trades.length === 0) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--ink-3)' }} className="mono">
        No open positions
      </div>
    )
  }

  return (
    <div className="neon-card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '0 1.25rem' }}>
        <ColHeader />
        {trades.map(t => {
          const pnlColor = (t.unrealizedPnl ?? 0) >= 0 ? 'var(--up)' : 'var(--down)'
          return (
            <div
              key={t.id}
              className="bt-row"
              style={{ display: 'grid', gridTemplateColumns: COL, alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--line)' }}
            >
              <span className="mono font-bold" style={{ color: 'var(--accent)' }}>{t.symbol}</span>
              <span className="mono" style={{ color: 'var(--ink-2)' }}>{t.lot}L</span>
              <span className="mono text-right" style={{ whiteSpace: 'nowrap' }}>{formatIDR(t.entryPrice)}</span>
              <span className="mono text-right" style={{ color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                {t.latestPrice != null ? formatIDR(t.latestPrice) : '—'}
              </span>
              <span className="mono text-right" style={{ color: pnlColor, whiteSpace: 'nowrap' }}>
                {t.unrealizedPnl != null ? formatIDR(t.unrealizedPnl) : '—'}
              </span>
              <span className="mono text-right" style={{ color: pnlColor, whiteSpace: 'nowrap' }}>
                {t.unrealizedPnlPct != null ? formatPct(t.unrealizedPnlPct, true) : '—'}
              </span>
              <span className="mono text-right" style={{ color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                {t.takeProfit != null ? formatIDR(t.takeProfit) : '—'}
              </span>
              <span className="mono text-right" style={{ color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                {t.stopLoss != null ? formatIDR(t.stopLoss) : '—'}
              </span>
              <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                <button
                  className="btn"
                  style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                  onClick={() => onClose(t)}
                >
                  Close
                </button>
                <button
                  style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--line)', borderRadius: '0.375rem', color: 'var(--ink-3)', cursor: 'pointer' }}
                  onClick={() => onCancel(t.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
