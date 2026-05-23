import { useQuery } from '@tanstack/react-query'
import { getCandleDateRange } from '@/lib/api/candles'
import { queryKeys } from '@/lib/query-keys'

export function useCandleDateRange() {
  return useQuery({
    queryKey: queryKeys.candles.range,
    queryFn: getCandleDateRange,
    staleTime: 10 * 60 * 1000,
  })
}
