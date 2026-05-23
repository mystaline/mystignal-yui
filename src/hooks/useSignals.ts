import { useQuery } from '@tanstack/react-query'
import { getSignals } from '@/lib/api/signals'
import { queryKeys } from '@/lib/query-keys'
import type { SignalFilterParams } from '@/types/signal'

export function useSignals(params: SignalFilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.signals.list(params),
    queryFn: () => getSignals(params),
    staleTime: 30 * 1000,
  })
}
