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
        gap: 6,
        padding: '4px 10px',
        borderRadius: 20,
        background: market.bullish ? 'rgba(74,222,128,.12)' : 'rgba(239,68,68,.12)',
        border: `1px solid ${market.bullish ? 'rgba(74,222,128,.3)' : 'rgba(239,68,68,.3)'}`,
        fontFamily: 'var(--mono)',
        fontSize: 11,
        fontWeight: 700,
        color: market.bullish ? 'var(--up)' : 'var(--down)',
      }}
    >
      <span style={{ fontSize: 9 }}>●</span>
      IHSG {market.bullish ? 'BULLISH' : 'BEARISH'} · {market.lastClose.toFixed(0)} / EMA50 {market.ema50.toFixed(0)}
    </span>
  )
}
