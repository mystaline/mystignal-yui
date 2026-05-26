import { SignalBadge } from '@/components/ui/Badge'
import { formatIDR, formatDate, clamp } from '@/lib/utils'
import type { SignalResponse } from '@/types/signal'

interface SignalCardProps {
  signal: SignalResponse
}

export function SignalCard({ signal: s }: SignalCardProps) {
  const conf = clamp(s.confidence, 0, 100)
  return (
    <div className="neon-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span style={{ fontFamily: 'var(--display)', fontSize: '1.375rem', letterSpacing: '-0.01em' }}>{s.symbol}</span>
          <SignalBadge type={s.type} />
        </div>
        <div style={{ textAlign: 'right' }}>
          {s.riskRewardRatio && (
            <div className="mono" style={{ fontSize: '0.6875rem', color: 'var(--ink-2)', fontWeight: 700 }}>R/R {s.riskRewardRatio.toFixed(2)}</div>
          )}
          <div className="eyebrow">{formatDate(s.generatedAt)}</div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3125rem' }}>
          <span className="eyebrow">Confidence</span>
          <span className="mono" style={{
            fontSize: '0.6875rem', fontWeight: 700,
            color: conf >= 75 ? 'var(--up)' : conf >= 50 ? 'var(--amber)' : 'var(--ink-2)',
          }}>
            {conf.toFixed(1)}%
          </span>
        </div>
        <div style={{ height: '0.125rem', background: 'var(--line)', borderRadius: '0.0625rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${conf}%`, background: 'var(--accent)', borderRadius: 1 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 3 }}>Entry</div>
          <div className="mono" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink)' }}>{formatIDR(s.price)}</div>
        </div>
        {s.targetPrice && (
          <div>
            <div className="eyebrow" style={{ marginBottom: '0.1875rem' }}>Target</div>
            <div className="mono" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--up)' }}>{formatIDR(s.targetPrice)}</div>
          </div>
        )}
        {s.stopLoss && (
          <div>
            <div className="eyebrow" style={{ marginBottom: '0.1875rem' }}>Stop</div>
            <div className="mono" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--down)' }}>{formatIDR(s.stopLoss)}</div>
          </div>
        )}
      </div>

      {s.reason && (
        <p style={{ fontFamily: 'var(--sans)', fontSize: '0.75rem', color: 'var(--ink-3)', borderTop: '1px solid var(--line)', paddingTop: '0.625rem', lineHeight: 1.5, margin: 0 }}>
          {s.reason}
        </p>
      )}
    </div>
  )
}
