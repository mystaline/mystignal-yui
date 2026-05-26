import { Search } from 'lucide-react'
import type { SignalFilterParams, SignalType, SignalStatus } from '@/types/signal'

interface SignalFiltersProps {
  params: SignalFilterParams
  onChange: (p: SignalFilterParams) => void
}

const TYPES: SignalType[] = ['BUY', 'SELL', 'SKIP']
const STATUSES: SignalStatus[] = ['active', 'expired', 'executed']

export function SignalFilters({ params, onChange }: SignalFiltersProps) {
  return (
    <>
      <div className="search" style={{ maxWidth: 280 }}>
        <Search style={{ width: '0.8125rem', height: '0.8125rem', flexShrink: 0, color: 'var(--ink-3)' }} />
        <input
          type="text"
          placeholder="Symbol…"
          value={params.symbol ?? ''}
          onChange={e => onChange({ ...params, symbol: e.target.value.toUpperCase() || undefined, page: 1 })}
        />
      </div>

      <div className="seg">
        <button className={!params.type ? 'active' : ''} onClick={() => onChange({ ...params, type: undefined, page: 1 })}>
          All
        </button>
        {TYPES.map(t => (
          <button
            key={t}
            className={params.type === t ? 'active' : ''}
            onClick={() => onChange({ ...params, type: params.type === t ? undefined : t, page: 1 })}
          >
            {t}
          </button>
        ))}
      </div>

      <select
        value={params.status ?? ''}
        onChange={e => onChange({ ...params, status: (e.target.value as SignalStatus) || undefined, page: 1 })}
        className="input-field"
        style={{ fontSize: '0.6875rem' }}
      >
        <option value="">All statuses</option>
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </>
  )
}
