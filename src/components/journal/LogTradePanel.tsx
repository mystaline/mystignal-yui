import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useLogTrade } from '@/hooks/useTrades'
import { useStocks } from '@/hooks/useStocks'
import { useSignalSuggestions } from '@/hooks/useSignalSuggestions'
import { formatDate, formatIDR } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

function getEmptyForm() {
  return {
    symbol: '',
    lot: '',
    entryPrice: '',
    entryDate: new Date().toISOString().slice(0, 10),
    takeProfit: '',
    stopLoss: '',
    notes: '',
    signalId: '',
  }
}

type FormData = ReturnType<typeof getEmptyForm>
type Errors = Partial<Record<keyof FormData, string>>

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg)',
  border: '1px solid var(--line)',
  borderRadius: 8,
  padding: '8px 12px',
  color: 'var(--ink)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: 'var(--ink-2)',
  marginBottom: 4,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
}

export function LogTradePanel({ open, onClose }: Props) {
  const [form, setForm] = useState(getEmptyForm())
  const [errors, setErrors] = useState<Errors>({})

  const { mutate, isPending } = useLogTrade()
  const { data: stocksData } = useStocks()
  const { suggestions } = useSignalSuggestions(form.symbol)

  function set(key: keyof FormData, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  function handleSignalPick(s: (typeof suggestions)[0]) {
    setForm(f => ({
      ...f,
      entryPrice: String(s.price),
      takeProfit: s.targetPrice ? String(s.targetPrice) : f.takeProfit,
      stopLoss: s.stopLoss ? String(s.stopLoss) : f.stopLoss,
      signalId: s.id,
    }))
  }

  function validate(): boolean {
    const errs: Errors = {}
    if (!form.symbol) errs.symbol = 'Required'
    const lot = parseInt(form.lot, 10)
    if (isNaN(lot) || lot < 1) errs.lot = 'Min 1 lot'
    const price = parseFloat(form.entryPrice)
    if (isNaN(price) || price <= 0) errs.entryPrice = 'Must be > 0'
    if (!form.entryDate) errs.entryDate = 'Required'
    if (form.takeProfit) {
      const tp = parseFloat(form.takeProfit)
      if (!isNaN(tp) && tp <= price) errs.takeProfit = 'Must be > entry price'
    }
    if (form.stopLoss) {
      const sl = parseFloat(form.stopLoss)
      if (!isNaN(sl) && sl >= price) errs.stopLoss = 'Must be < entry price'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    mutate(
      {
        symbol: form.symbol,
        stockId: undefined,
        lot: parseInt(form.lot, 10),
        entryPrice: parseFloat(form.entryPrice),
        entryTime: `${form.entryDate}T00:00:00Z`,
        takeProfit: form.takeProfit ? parseFloat(form.takeProfit) : undefined,
        stopLoss: form.stopLoss ? parseFloat(form.stopLoss) : undefined,
        signalId: form.signalId || undefined,
        notes: form.notes || undefined,
      },
      {
        onSuccess: () => {
          setForm(getEmptyForm())
          setErrors({})
          onClose()
        },
      }
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.22 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 440,
              background: 'var(--bg-2)', borderLeft: '1px solid var(--line)',
              zIndex: 100, overflowY: 'auto', display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
              <span className="display" style={{ fontSize: 20 }}>
                Log Trade<em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>.</em>
              </span>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Symbol */}
              <div>
                <label style={labelStyle}>Symbol *</label>
                <select value={form.symbol} onChange={e => { set('symbol', e.target.value); setForm(f => ({ ...f, signalId: '', entryPrice: '', takeProfit: '', stopLoss: '' })) }} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select stock…</option>
                  {stocksData?.data.map(s => (
                    <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>
                  ))}
                </select>
                {errors.symbol && <p style={{ color: 'var(--down)', fontSize: 11, marginTop: 3 }}>{errors.symbol}</p>}
              </div>

              {/* Signal suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <label style={{ ...labelStyle, color: 'var(--accent)' }}>From Signal (auto-fill)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {suggestions.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSignalPick(s)}
                        style={{
                          background: form.signalId === s.id ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'var(--bg)',
                          border: `1px solid ${form.signalId === s.id ? 'var(--accent)' : 'var(--line)'}`,
                          borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          color: 'var(--ink)', fontSize: 13,
                        }}
                      >
                        <span className="mono">{formatIDR(s.price)}</span>
                        <span style={{ color: 'var(--ink-2)', fontSize: 11 }}>{Math.round(s.confidence)}% · {formatDate(s.generatedAt)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lot + Entry Price row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Lot *</label>
                  <input type="number" min="1" step="1" value={form.lot} onChange={e => set('lot', e.target.value)} placeholder="e.g. 10" style={inputStyle} />
                  {errors.lot && <p style={{ color: 'var(--down)', fontSize: 11, marginTop: 3 }}>{errors.lot}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Entry Price *</label>
                  <input type="number" min="1" step="any" value={form.entryPrice} onChange={e => set('entryPrice', e.target.value)} placeholder="e.g. 9350" style={inputStyle} />
                  {errors.entryPrice && <p style={{ color: 'var(--down)', fontSize: 11, marginTop: 3 }}>{errors.entryPrice}</p>}
                </div>
              </div>

              {/* Entry Date */}
              <div>
                <label style={labelStyle}>Entry Date *</label>
                <input type="date" value={form.entryDate} onChange={e => set('entryDate', e.target.value)} style={inputStyle} />
                {errors.entryDate && <p style={{ color: 'var(--down)', fontSize: 11, marginTop: 3 }}>{errors.entryDate}</p>}
              </div>

              {/* TP + SL row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Take Profit</label>
                  <input type="number" min="1" step="any" value={form.takeProfit} onChange={e => set('takeProfit', e.target.value)} placeholder="optional" style={inputStyle} />
                  {errors.takeProfit && <p style={{ color: 'var(--down)', fontSize: 11, marginTop: 3 }}>{errors.takeProfit}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Stop Loss</label>
                  <input type="number" min="1" step="any" value={form.stopLoss} onChange={e => set('stopLoss', e.target.value)} placeholder="optional" style={inputStyle} />
                  {errors.stopLoss && <p style={{ color: 'var(--down)', fontSize: 11, marginTop: 3 }}>{errors.stopLoss}</p>}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="optional"
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  maxLength={500}
                />
              </div>

              <button
                type="submit"
                className="btn"
                disabled={isPending}
                style={{ width: '100%', padding: '12px 0', fontSize: 14, opacity: isPending ? 0.6 : 1, marginTop: 4 }}
              >
                {isPending ? 'Logging…' : 'Log Trade'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
