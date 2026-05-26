import { useQuery } from '@tanstack/react-query'
import { getSignals } from '@/lib/api/signals'
import { getLiveKey } from '@/lib/api/client'
import { listSignalsFiltered } from '@/lib/idb'
import { queryKeys } from '@/lib/query-keys'
import type { SignalFilterParams } from '@/types/signal'

export function useSignals(params: SignalFilterParams = {}) {
  const authed = !!getLiveKey()
  return useQuery({
    queryKey: queryKeys.signals.list(params),
    queryFn: authed ? () => getSignals(params) : () => listSignalsFiltered(params),
    staleTime: 30 * 1000,
    enabled: true,
  })
}
