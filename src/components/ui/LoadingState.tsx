const H_MAP: Record<string, string> = {
  'h-12': '48px', 'h-14': '56px', 'h-16': '64px',
  'h-36': '144px', 'h-60': '240px', 'h-96': '384px',
}

export function LoadingState({ rows = 5, height = 'h-12' }: { rows?: number; height?: string }) {
  const h = H_MAP[height] ?? '48px'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="loading-skeleton" style={{ height: h, opacity: 1 - i * 0.1 }} />
      ))}
    </div>
  )
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 16 : size === 'lg' ? 40 : 24
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
