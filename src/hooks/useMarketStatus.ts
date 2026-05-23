import { useQuery } from '@tanstack/react-query'
import { getMarketStatus } from '@/lib/api/signals'
import { queryKeys } from '@/lib/query-keys'

export function useMarketStatus(symbol = '^JKSE') {
  return useQuery({
    queryKey: queryKeys.signals.marketStatus(symbol),
    queryFn: () => getMarketStatus(symbol),
    staleTime: 5 * 60 * 1000, // 5 min — quasi-static market data
    retry: 1,
  })
}
