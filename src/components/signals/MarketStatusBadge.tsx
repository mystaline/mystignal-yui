import type { MarketStatusResponse } from '@/types/signal'

interface Props {
  market: MarketStatusResponse | undefined
  loading?: boolean
}

export function MarketStatusBadge({ market, loading }: Props) {
  if (loading || !market) return null

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.25rem 0.625rem',
        borderRadius: '1.25rem',
        background: market.bullish ? 'rgba(74,222,128,.12)' : 'rgba(239,68,68,.12)',
        border: `1px solid ${market.bullish ? 'rgba(74,222,128,.3)' : 'rgba(239,68,68,.3)'}`,
        fontFamily: 'var(--mono)',
        fontSize: '0.6875rem',
        fontWeight: 700,
        color: market.bullish ? 'var(--up)' : 'var(--down)',
      }}
    >
      <span style={{ fontSize: '0.5625rem' }}>●</span>
      IHSG {market.bullish ? 'BULLISH' : 'BEARISH'} · {market.lastClose.toFixed(0)} / EMA50 {market.ema50.toFixed(0)}
    </span>
  )
}
