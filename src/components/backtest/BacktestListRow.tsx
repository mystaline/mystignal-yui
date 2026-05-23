import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/routes'
import type { BacktestListItem } from '@/types/backtest'

interface Props {
  backtest: BacktestListItem
  onDelete?: (id: string) => void
}

export function BacktestListRow({ backtest, onDelete }: Props) {
  const isProfit = backtest.profitPercentage >= 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', borderBottom: '1px solid var(--line)' }}>
      {/* ID */}
      <Link
        to={ROUTES.backtests.detail(backtest.id)}
        style={{
          minWidth: 60,
          fontFamily: 'var(--mono)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--accent)',
          textDecoration: 'none',
          cursor: 'pointer',
        }}
      >
        #{backtest.id}
      </Link>

      {/* Strategy */}
      <div style={{ minWidth: 100, fontSize: 12, color: 'var(--ink)' }}>
        {backtest.strategyName}
      </div>

      {/* Profit % */}
      <div style={{ minWidth: 70, fontSize: 12, color: isProfit ? 'var(--up)' : 'var(--down)', fontWeight: 600 }}>
        {isProfit ? '+' : ''}{backtest.profitPercentage.toFixed(2)}%
      </div>

      {/* Total Trades */}
      <div style={{ minWidth: 60, fontSize: 11, color: 'var(--ink-3)' }}>
        {backtest.totalTrades} trades
      </div>

      {/* Win Rate */}
      <div style={{ minWidth: 50, fontSize: 11, color: 'var(--ink-3)' }}>
        {(backtest.winRate * 100).toFixed(0)}%
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={() => onDelete(backtest.id)}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: 'var(--down)',
            cursor: 'pointer',
            fontSize: 12,
            opacity: 0.7,
          }}
        >
          Delete
        </button>
      )}
    </div>
  )
}
