import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { BASE_URL, getAuthHeaders } from '@/lib/api/client'
import type { TriggerAnalyzeRequest } from '@/types/signal'

export type AnalyzePhase =
  | 'idle'
  | 'start'
  | 'market'
  | 'bearish'
  | 'fetch'
  | 'analyze'
  | 'store'
  | 'done'
  | 'error'

export interface AnalyzeState {
  phase: AnalyzePhase
  message: string
  stockCount: number
  signalsFound: number
  bullish?: boolean
  lastClose?: number
  ema50?: number
}

interface AnalyzeContextValue {
  state: AnalyzeState
  trigger: (req: TriggerAnalyzeRequest) => void
  dismiss: () => void
}

const IDLE: AnalyzeState = { phase: 'idle', message: '', stockCount: 0, signalsFound: 0 }

const AnalyzeContext = createContext<AnalyzeContextValue | null>(null)

export function AnalyzeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnalyzeState>(IDLE)
  const queryClient = useQueryClient()

  const trigger = useCallback((req: TriggerAnalyzeRequest) => {
    setState({ phase: 'start', message: 'Starting analysis…', stockCount: 0, signalsFound: 0 })

    fetch(`${BASE_URL}/api/v1/signals/analyze/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(req),
    }).then(async res => {
      if (!res.ok || !res.body) {
        setState(s => ({ ...s, phase: 'error', message: 'Request failed' }))
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        // SSE lines are "data: {...}\n\n"
        const lines = buf.split('\n\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          const raw = line.replace(/^data:\s*/, '')
          if (!raw) continue
          try {
            const ev = JSON.parse(raw)
            setState(s => ({
              ...s,
              phase: ev.type,
              message: ev.message ?? s.message,
              stockCount: ev.stockCount ?? s.stockCount,
              signalsFound: ev.signalsFound ?? s.signalsFound,
              bullish: ev.bullish ?? s.bullish,
              lastClose: ev.lastClose ?? s.lastClose,
              ema50: ev.ema50 ?? s.ema50,
            }))
            if (ev.type === 'done') {
              // Small delay — let server-side transaction fully commit before refetch
              setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: queryKeys.signals.all })
              }, 500)
              // Auto-dismiss toast after 6s
              setTimeout(() => setState(IDLE), 6000)
            }
            if (ev.type === 'bearish' || ev.type === 'error') {
              setTimeout(() => setState(IDLE), 6000)
            }
          } catch {
            // malformed event, skip
          }
        }
      }
    }).catch(err => {
      setState(s => ({ ...s, phase: 'error', message: String(err) }))
    })
  }, [queryClient])

  const dismiss = useCallback(() => setState(IDLE), [])

  return (
    <AnalyzeContext.Provider value={{ state, trigger, dismiss }}>
      {children}
    </AnalyzeContext.Provider>
  )
}

export function useAnalyze() {
  const ctx = useContext(AnalyzeContext)
  if (!ctx) throw new Error('useAnalyze must be used inside AnalyzeProvider')
  return ctx
}
