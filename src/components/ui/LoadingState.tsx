const H_MAP: Record<string, string> = {
  'h-12': '3rem', 'h-14': '3.5rem', 'h-16': '4rem',
  'h-36': '9rem', 'h-60': '15rem', 'h-96': '24rem',
}

export function LoadingState({ rows = 5, height = 'h-12' }: { rows?: number; height?: string }) {
  const h = H_MAP[height] ?? '3rem'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="loading-skeleton" style={{ height: h, opacity: 1 - i * 0.1 }} />
      ))}
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? '1rem' : size === 'lg' ? '2.5rem' : '1.5rem'
  return (
    <div
      className="animate-spin"
      style={{
        width: sz, height: sz, borderRadius: '50%',
        border: `2px solid var(--line-strong)`,
        borderTopColor: 'var(--accent)',
      }}
    />
  )
}
