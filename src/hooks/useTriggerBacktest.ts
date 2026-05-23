import { useMutation, useQueryClient } from '@tanstack/react-query'
import { triggerBacktest } from '@/lib/api/backtest'
import { queryKeys } from '@/lib/query-keys'

export function useTriggerBacktest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: triggerBacktest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backtests.all })
    },
  })
}
