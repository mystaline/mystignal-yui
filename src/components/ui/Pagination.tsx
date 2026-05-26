import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--line)' }}>
      <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--ink-3)' }}>
        {total === 0 ? '0 results' : `${start}–${end} of ${total}`}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
        <button
          className="page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft style={{ width: '0.875rem', height: '0.875rem' }} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = totalPages <= 5 ? i + 1 : Math.max(1, page - 2) + i
          if (p > totalPages) return null
          return (
            <button
              key={p}
              className="page-btn"
              onClick={() => onPageChange(p)}
              style={p === page
                ? { background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'var(--mono)', fontSize: '0.6875rem' }
                : { fontFamily: 'var(--mono)', fontSize: '0.6875rem' }
              }
            >
              {p}
            </button>
          )
        })}
        <button
          className="page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight style={{ width: '0.875rem', height: '0.875rem' }} />
        </button>
      </div>
    </div>
  )
}
