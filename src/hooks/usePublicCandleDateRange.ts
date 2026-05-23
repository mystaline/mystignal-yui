import { useQuery } from '@tanstack/react-query'
import { getPublicCandleDateRange } from '@/lib/api/backtest'
import { queryKeys } from '@/lib/query-keys'

export function usePublicCandleDateRange() {
  return useQuery({
    queryKey: queryKeys.publicCandles.range,
    queryFn: getPublicCandleDateRange,
    staleTime: 10 * 60 * 1000,
  })
}
