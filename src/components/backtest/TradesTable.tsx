import { PnlCell } from '@/components/ui/PnlCell'
import { formatIDR, formatDate } from '@/lib/utils'
import type { BacktestDetailResponse } from '@/types/backtest'

interface Props {
  trades: BacktestDetailResponse['trades']
  mode?: 'preview' | 'full'
  isLoading?: boolean
}

export function TradesTable({ trades, mode = 'full', isLoading }: Props) {
  if (isLoading) return <div>Loading trades…</div>
  if (!trades || trades.length === 0) return <div style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--ink-3)' }}>No trades</div>

  const isPreview = mode === 'preview'

  if (isPreview) {
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--line)' }}>
            <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Entry</th>
            <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Price</th>
            <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Lot</th>
            <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>P&L</th>
            <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Status</th>
            <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Exit</th>
            <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Exit Price</th>
          </tr>
        </thead>
        <tbody>
          {trades.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid var(--line)' }}>
              <td style={{ padding: '0.5rem', color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>{formatDate(t.entryTime)}</td>
              <td style={{ padding: '0.5rem', fontFamily: 'var(--mono)' }}>{formatIDR(t.entryPrice)}</td>
              <td style={{ padding: '0.5rem', fontFamily: 'var(--mono)' }}>{t.lot}</td>
              <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                <PnlCell value={t.profitAmount ?? 0} pct={t.profitPercentage} />
              </td>
              <td style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.6875rem', color: t.status === 'holding' ? 'var(--accent)' : 'var(--ink-3)' }}>
                {t.status === 'holding' ? '🟢' : '⚫'}
              </td>
              <td style={{ padding: '0.5rem', color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>{t.exitTime ? formatDate(t.exitTime) : '—'}</td>
              <td style={{ padding: '0.5rem', fontFamily: 'var(--mono)' }}>{t.exitPrice ? formatIDR(t.exitPrice) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  // Full mode
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.6875rem' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--line)' }}>
          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Symbol</th>
          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Entry Date</th>
          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Entry Price</th>
          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Lot</th>
          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Target</th>
          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Stop Loss</th>
          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Exit Date</th>
          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Exit Price</th>
          <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>P&L</th>
          <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>ROI%</th>
          <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Hold Mins</th>
          <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Conf</th>
          <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Status</th>
          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--ink-2)', fontWeight: 600 }}>Reason</th>
        </tr>
      </thead>
      <tbody>
        {trades.map(t => (
          <tr key={t.id} style={{ borderBottom: '1px solid var(--line)' }}>
            <td style={{ padding: '0.375rem', fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 600 }}>{t.symbol}</td>
            <td style={{ padding: '0.375rem', fontFamily: 'var(--mono)', color: 'var(--ink-3)' }}>{formatDate(t.entryTime)}</td>
            <td style={{ padding: '0.375rem', fontFamily: 'var(--mono)' }}>{formatIDR(t.entryPrice)}</td>
            <td style={{ padding: '0.375rem', fontFamily: 'var(--mono)', textAlign: 'right' }}>{t.lot}</td>
            <td style={{ padding: '0.375rem', fontFamily: 'var(--mono)' }}>{formatIDR(t.targetPrice)}</td>
            <td style={{ padding: '0.375rem', fontFamily: 'var(--mono)' }}>{formatIDR(t.stopLoss)}</td>
            <td style={{ padding: '0.375rem', fontFamily: 'var(--mono)', color: 'var(--ink-3)' }}>{t.exitTime ? formatDate(t.exitTime) : '—'}</td>
            <td style={{ padding: '0.375rem', fontFamily: 'var(--mono)' }}>{t.exitPrice ? formatIDR(t.exitPrice) : '—'}</td>
            <td style={{ padding: '0.375rem', textAlign: 'right' }}>
              <PnlCell value={t.profitAmount ?? 0} />
            </td>
            <td style={{ padding: '0.375rem', textAlign: 'right', color: (t.profitPercentage ?? 0) >= 0 ? 'var(--up)' : 'var(--down)' }}>
              {t.profitPercentage ? `${t.profitPercentage > 0 ? '+' : ''}${t.profitPercentage.toFixed(2)}%` : '—'}
            </td>
            <td style={{ padding: '0.375rem', textAlign: 'center', color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>
              {t.holdDurationMinutes}
            </td>
            <td style={{ padding: '0.375rem', textAlign: 'center', fontSize: '0.625rem', color: 'var(--accent)', fontWeight: 600 }}>
              {Math.round(t.confidence)}%
            </td>
            <td style={{ padding: '0.375rem', textAlign: 'center', fontSize: '0.625rem' }}>
              {t.status === 'holding' ? '🟢' : '⚫'}
            </td>
            <td style={{ padding: '0.375rem', fontSize: '0.625rem', color: 'var(--ink-3)' }}>{t.reason}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
