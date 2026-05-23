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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--line)' }}>
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
        {total === 0 ? '0 results' : `${start}–${end} of ${total}`}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button
          className="page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft style={{ width: 14, height: 14 }} />
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
                ? { background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'var(--mono)', fontSize: 11 }
                : { fontFamily: 'var(--mono)', fontSize: 11 }
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
          <ChevronRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  )
}
