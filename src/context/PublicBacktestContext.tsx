import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useJobPoller } from '@/hooks/useJobPoller'
import { getPublicBacktestJob } from '@/lib/api/backtest'
import { savePublicBacktest } from '@/lib/idb'
import type { PublicBacktestResult, PublicJobStatus } from '@/types/backtest'

const SESSION_KEY = 'msig_public_wf'

export type BacktestJobPhase = 'idle' | 'queued' | 'fetching' | 'simulating' | 'done' | 'error' | 'expired'

export interface PublicBacktestState {
  phase: BacktestJobPhase
  label: string
  workflowId: string | null
  result: PublicBacktestResult | null
}

interface PublicBacktestContextValue {
  state: PublicBacktestState
  start:   (workflowId: string) => void
  dismiss: () => void
}

const IDLE: PublicBacktestState = { phase: 'idle', label: '', workflowId: null, result: null }

const PublicBacktestContext = createContext<PublicBacktestContextValue | null>(null)

export function PublicBacktestProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PublicBacktestState>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) return { phase: 'queued', label: 'Queued', workflowId: saved, result: null }
    return IDLE
  })

  const start = useCallback((workflowId: string) => {
    sessionStorage.setItem(SESSION_KEY, workflowId)
    setState({ phase: 'queued', label: 'Queued', workflowId, result: null })
  }, [])

  const dismiss = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setState(IDLE)
  }, [])

  useJobPoller<PublicBacktestResult>(state.workflowId, {
    fetcher: getPublicBacktestJob,
    onPhase: (phase, label) => {
      setState(s => ({ ...s, phase: phase as BacktestJobPhase, label }))
    },
    onDone: (result) => {
      const wfId = state.workflowId!
      savePublicBacktest(wfId, result).catch(() => {/* IndexedDB unavailable */})
      sessionStorage.removeItem(SESSION_KEY)
      setState({ phase: 'done', label: 'Done', workflowId: wfId, result })
      setTimeout(() => setState(IDLE), 6000)
    },
    onError: (message) => {
      sessionStorage.removeItem(SESSION_KEY)
      setState(s => ({ ...s, phase: 'error', label: message }))
      setTimeout(() => setState(IDLE), 6000)
    },
  })

  return (
    <PublicBacktestContext.Provider value={{ state, start, dismiss }}>
      {children}
    </PublicBacktestContext.Provider>
  )
}

export function usePublicBacktest() {
  const ctx = useContext(PublicBacktestContext)
  if (!ctx) throw new Error('usePublicBacktest must be used inside PublicBacktestProvider')
  return ctx
}

// Silence unused import warning — PublicJobStatus is re-exported for consumers
export type { PublicJobStatus }
