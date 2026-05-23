interface Props {
  values: number[]
  height?: number
  strokeWidth?: number
}

export function Sparkline({ values, height = 32, strokeWidth = 1.5 }: Props) {
  if (values.length < 2) return null

  const width = 60
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  const isUp = values[values.length - 1] >= values[0]
  const color = isUp ? 'var(--up)' : 'var(--down)'

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
