import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useCloseTrade } from '@/hooks/useTrades'
import { formatIDR } from '@/lib/utils'
import type { JournalTrade } from '@/types/trade'

interface Props {
  trade: JournalTrade
  onClose: () => void
}

export function CloseTradeModal({ trade, onClose }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [exitPrice, setExitPrice] = useState('')
  const [exitDate, setExitDate] = useState(today)
  const [error, setError] = useState('')

  const { mutate, isPending } = useCloseTrade()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(exitPrice)
    if (isNaN(price) || price <= 0) {
      setError('Enter a valid exit price')
      return
    }
    setError('')
    mutate(
      { id: trade.id, req: { exitPrice: price, exitTime: `${exitDate}T00:00:00Z` } },
      { onSuccess: onClose }
    )
  }

  const unrealized = trade.unrealizedPnl
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-2)',
    border: '1px solid var(--line)',
    borderRadius: 8,
    padding: '8px 12px',
    color: 'var(--ink)',
    fontSize: 14,
    outline: 'none',
  }

  return (
    <AnimatePresence>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 12, padding: 28, width: 380, position: 'relative' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span className="display" style={{ fontSize: 18 }}>Close Position</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '12px 14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <div>
              <span className="mono font-bold" style={{ color: 'var(--accent)' }}>{trade.symbol}</span>
              <span style={{ color: 'var(--ink-2)', marginLeft: 8 }}>{trade.lot} lot @ {formatIDR(trade.entryPrice)}</span>
            </div>
            {unrealized != null && (
              <span className="mono" style={{ color: unrealized >= 0 ? 'var(--up)' : 'var(--down)', fontWeight: 600 }}>
                {formatIDR(unrealized)}
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--ink-2)', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Exit Price</label>
              <input
                type="number"
                min="1"
                step="any"
                value={exitPrice}
                onChange={e => setExitPrice(e.target.value)}
                placeholder="e.g. 9800"
                style={inputStyle}
                autoFocus
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--ink-2)', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Exit Date</label>
              <input type="date" value={exitDate} onChange={e => setExitDate(e.target.value)} style={inputStyle} />
            </div>

            {error && <p style={{ color: 'var(--down)', fontSize: 12, margin: 0 }}>{error}</p>}

            <button
              type="submit"
              className="btn"
              disabled={isPending}
              style={{ width: '100%', padding: '10px 0', marginTop: 4, opacity: isPending ? 0.6 : 1 }}
            >
              {isPending ? 'Closing…' : 'Confirm Close'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
