import { useEffect, useRef } from 'react'

export interface JobPollerOptions<T> {
  fetcher: (id: string) => Promise<{ status: string; phase?: string; label?: string; result?: T; error?: string }>
  onPhase: (phase: string, label: string) => void
  onDone:  (result: T) => void
  onError: (message: string) => void
  interval?: number
  timeout?:  number
}

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

    const tick = async () => {
      if (Date.now() - startedAt > timeout) {
        optionsRef.current.onError('Backtest is taking longer than expected. Please try again.')
        return
      }
      try {
        const res = await optionsRef.current.fetcher(workflowId)
        if (res.status === 'done' && res.result) {
          optionsRef.current.onDone(res.result)
        } else if (res.status === 'failed' || res.status === 'expired') {
          optionsRef.current.onError(res.error ?? `Backtest ${res.status}. Please try again.`)
        } else if (res.phase) {
          optionsRef.current.onPhase(res.phase, res.label ?? res.phase)
        }
      } catch {
        // network blip — keep polling
      }
    }

    tick()
    const id = setInterval(tick, interval)
    return () => clearInterval(id)
  }, [workflowId]) // eslint-disable-line react-hooks/exhaustive-deps
}
