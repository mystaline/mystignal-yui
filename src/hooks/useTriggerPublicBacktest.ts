import { useMutation } from '@tanstack/react-query'
import { triggerPublicBacktest } from '@/lib/api/backtest'

export function useTriggerPublicBacktest() {
  return useMutation({ mutationFn: triggerPublicBacktest })
}
