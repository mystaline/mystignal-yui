import { useEffect, useRef } from 'react'

export interface JobPollerOptions<T> {
  fetcher: (id: string) => Promise<{ status: string; phase?: string; label?: string; result?: T; error?: string }>
  onPhase: (phase: string, label: string) => void
  onDone:  (result: T, workflowId: string) => void
  onError: (message: string) => void
  interval?: number
  timeout?:  number
}

const MAX_CONSECUTIVE_ERRORS = 5

export function useJobPoller<T>(
  workflowId: string | null,
  options: JobPollerOptions<T>,
) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    if (!workflowId) return

    const interval = options.interval ?? 3000
    const timeout  = options.timeout  ?? 30 * 60 * 1000
    const startedAt = Date.now()
    let consecutiveErrors = 0

    const tick = async () => {
      if (Date.now() - startedAt > timeout) {
        optionsRef.current.onError('Backtest is taking longer than expected. Please try again.')
        return
      }
      try {
        const res = await optionsRef.current.fetcher(workflowId)
        consecutiveErrors = 0
        if (res.status === 'done' && res.result) {
          optionsRef.current.onDone(res.result, workflowId)
        } else if (res.status === 'failed' || res.status === 'expired') {
          optionsRef.current.onError(res.error ?? `Backtest ${res.status}. Please try again.`)
        } else if (res.phase) {
          optionsRef.current.onPhase(res.phase, res.label ?? res.phase)
        }
      } catch {
        consecutiveErrors++
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          optionsRef.current.onError('Lost connection to server. Please check your network and try again.')
        }
        // else: transient blip — keep polling
      }
    }

    tick()
    const id = setInterval(tick, interval)
    return () => clearInterval(id)
  }, [workflowId]) // eslint-disable-line react-hooks/exhaustive-deps
}
