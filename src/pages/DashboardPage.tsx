import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useCancelTrade, useTradeSummary, useTradeList } from '@/hooks/useTrades'
import { JournalSummaryStrip } from '@/components/journal/JournalSummaryStrip'
import { OpenPositionsTable } from '@/components/journal/OpenPositionsTable'
import { LogTradePanel } from '@/components/journal/LogTradePanel'
import { CloseTradeModal } from '@/components/journal/CloseTradeModal'
import type { JournalTrade } from '@/types/trade'

export default function DashboardPage() {
  const [logOpen, setLogOpen] = useState(false)
  const [closeTarget, setCloseTarget] = useState<JournalTrade | null>(null)

  const { data: summary, isLoading: summaryLoading } = useTradeSummary()
  const { data: trades, isLoading: tradesLoading } = useTradeList({ status: 'Open', page: 1, pageSize: 5 })
  const { mutate: cancel } = useCancelTrade()

  const openTrades = trades?.data ?? []

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="pg-head" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="display" style={{ fontSize: 28, lineHeight: 1 }}>
            Dashboard<em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>.</em>
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 13, marginTop: 4 }}>Trade overview · sharia universe</p>
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

      {/* Recent open positions */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Open Positions</span>
          <Link to="/trade" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>
        <OpenPositionsTable
          trades={openTrades}
          isLoading={tradesLoading}
          onClose={setCloseTarget}
          onCancel={id => cancel(id)}
        />
      </div>

      <LogTradePanel open={logOpen} onClose={() => setLogOpen(false)} />

      {closeTarget && (
        <CloseTradeModal
          trade={closeTarget}
          onClose={() => setCloseTarget(null)}
        />
      )}
    </div>
  )
}
