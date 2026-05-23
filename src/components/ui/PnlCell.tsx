interface Props {
  value: number
  pct?: number
  className?: string
}

export function PnlCell({ value, pct, className }: Props) {
  const isProfit = value >= 0
  const color = isProfit ? 'var(--up)' : 'var(--down)'

  return (
    <div className={className} style={{ color, fontFamily: 'var(--mono)', fontSize: 13 }}>
      <div>{isProfit ? '+' : ''}{value.toLocaleString('id-ID')}</div>
      {pct !== undefined && (
        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
          {isProfit ? '+' : ''}{pct.toFixed(2)}%
        </div>
      )}
    </div>
  )
}
