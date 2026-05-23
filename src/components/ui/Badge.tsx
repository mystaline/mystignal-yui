import type { SignalType } from '@/types/signal'
import type { TradeStatus } from '@/types/backtest'

interface SignalBadgeProps {
  type: SignalType
  size?: 'sm' | 'md'
}

const SIGNAL_META: Record<SignalType, { cls: string; dot: string }> = {
  BUY:  { cls: 'badge-buy',  dot: 'var(--up)' },
  SELL: { cls: 'badge-sell', dot: 'var(--down)' },
  SKIP: { cls: 'badge-skip', dot: 'var(--ink-3)' },
}

const SIZE_CLASS: Record<'sm' | 'md', string> = {
  sm: 'px-1.5 py-0.5',
  md: 'px-2.5 py-1',
}

export function SignalBadge({ type, size = 'md' }: SignalBadgeProps) {
  const { cls, dot } = SIGNAL_META[type]
  return (
    <span className={`${cls} text-xs ${SIZE_CLASS[size]} rounded-md font-mono font-semibold tracking-wider inline-flex items-center gap-1`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
      {type}
    </span>
  )
}

interface TradeStatusBadgeProps {
  status: TradeStatus
}

const STATUS_STYLES: Record<TradeStatus, { label: string; style: React.CSSProperties }> = {
  buy_tp:     { label: 'TP Hit',     style: { color: 'var(--up)',    background: 'color-mix(in srgb, var(--up) 12%, transparent)',    border: '1px solid color-mix(in srgb, var(--up) 30%, transparent)' } },
  buy_sl:     { label: 'SL Hit',     style: { color: 'var(--down)',  background: 'color-mix(in srgb, var(--down) 12%, transparent)',  border: '1px solid color-mix(in srgb, var(--down) 30%, transparent)' } },
  timeout:    { label: 'Timeout',    style: { color: 'var(--amber)', background: 'color-mix(in srgb, var(--amber) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--amber) 30%, transparent)' } },
  period_end: { label: 'Period End', style: { color: 'var(--ink-2)', background: 'color-mix(in srgb, var(--ink-3) 10%, transparent)', border: '1px solid var(--line)' } },
  skipped:    { label: 'Skipped',    style: { color: 'var(--ink-3)', background: 'color-mix(in srgb, var(--ink-3) 8%, transparent)',  border: '1px solid var(--line)' } },
  holding:    { label: 'Holding',    style: { color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' } },
}

export function TradeStatusBadge({ status }: TradeStatusBadgeProps) {
  const entry = STATUS_STYLES[status] ?? { label: status, style: { color: 'var(--ink-3)', border: '1px solid var(--line)' } }
  return (
    <span className="text-xs px-2 py-0.5 rounded-md font-mono font-medium" style={entry.style}>
      {entry.label}
    </span>
  )
}

interface TradePnlBadgeProps {
  pnl: number
}

export function TradePnlBadge({ pnl }: TradePnlBadgeProps) {
  const win = pnl >= 0
  const style: React.CSSProperties = win
    ? { color: 'var(--up)',   background: 'color-mix(in srgb, var(--up) 12%, transparent)',   border: '1px solid color-mix(in srgb, var(--up) 30%, transparent)' }
    : { color: 'var(--down)', background: 'color-mix(in srgb, var(--down) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--down) 30%, transparent)' }
  return (
    <span className="text-xs px-2 py-0.5 rounded-md font-mono font-medium" style={style}>
      {win ? 'WIN' : 'LOSS'}
    </span>
  )
}
