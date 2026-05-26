import { useQuery } from '@tanstack/react-query'
import { getSignals } from '@/lib/api/signals'
import { getLiveKey } from '@/lib/api/client'
import { queryKeys } from '@/lib/query-keys'
import type { SignalResponse } from '@/types/signal'

export function useSignalSuggestions(symbol?: string) {
  const params = {
    symbol: symbol || '',
    type: 'BUY' as const,
    status: 'active' as const,
    pageSize: 5,
  }

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.signals.suggestions(symbol || ''),
    queryFn: () => getSignals(params),
    staleTime: 30 * 1000, // 30s — live signal feed
    enabled: !!symbol && !!getLiveKey(),
  })

  return {
    suggestions: symbol && data?.data ? data.data : ([] as SignalResponse[]),
    ...rest,
  }
}
