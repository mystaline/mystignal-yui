import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useCancelTrade, useTradeSummary, useTradeList } from '@/hooks/useTrades'
import { JournalSummaryStrip } from '@/components/journal/JournalSummaryStrip'
import { OpenPositionsTable } from '@/components/journal/OpenPositionsTable'
import { ClosedTradesTable } from '@/components/journal/ClosedTradesTable'
import { LogTradePanel } from '@/components/journal/LogTradePanel'
import { CloseTradeModal } from '@/components/journal/CloseTradeModal'
import { Pagination } from '@/components/ui/Pagination'
import type { JournalTrade } from '@/types/trade'

type Tab = 'open' | 'closed'

export default function TradingJournalPage() {
  const [tab, setTab] = useState<Tab>('open')
  const [page, setPage] = useState(1)
  const [logOpen, setLogOpen] = useState(false)
  const [closeTarget, setCloseTarget] = useState<JournalTrade | null>(null)

  const { data: summary, isLoading: summaryLoading } = useTradeSummary()
  const { data: trades, isLoading: tradesLoading } = useTradeList({ status: tab === 'open' ? 'Open' : 'Closed', page, pageSize: 20 })
  const { mutate: cancel } = useCancelTrade()

  function handleTabChange(next: Tab) {
    setTab(next)
    setPage(1)
  }

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="pg-head" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontSize: 28, lineHeight: 1 }}>
            Journal<em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>.</em>
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 13, marginTop: 4 }}>Manual trade log · sharia universe</p>
        </div>
        <div className="pg-actions">
          <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setLogOpen(true)}>
            <Plus size={15} />
            Log Trade
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <JournalSummaryStrip summary={summary} isLoading={summaryLoading} />

      {/* Tab switcher */}
      <div className="seg" style={{ margin: '24px 0 16px' }}>
        <button className={`seg-btn${tab === 'open' ? ' active' : ''}`} onClick={() => handleTabChange('open')}>
          Open {summary && !summaryLoading ? `(${summary.openCount})` : ''}
        </button>
        <button className={`seg-btn${tab === 'closed' ? ' active' : ''}`} onClick={() => handleTabChange('closed')}>
          Closed {summary && !summaryLoading ? `(${summary.closedCount})` : ''}
        </button>
      </div>

      {/* Tables */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {tab === 'open' ? (
            <OpenPositionsTable
              trades={trades?.data ?? []}
              isLoading={tradesLoading}
              onClose={setCloseTarget}
              onCancel={id => cancel(id)}
            />
          ) : (
            <ClosedTradesTable
              trades={trades?.data ?? []}
              isLoading={tradesLoading}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {trades && trades.totalPages > 1 && (
        <Pagination page={page} totalPages={trades.totalPages} total={trades.total} pageSize={20} onPageChange={setPage} />
      )}

      {/* Log trade panel */}
      <LogTradePanel open={logOpen} onClose={() => setLogOpen(false)} />

      {/* Close trade modal */}
      {closeTarget && (
        <CloseTradeModal
          trade={closeTarget}
          onClose={() => setCloseTarget(null)}
        />
      )}
    </div>
  )
}
