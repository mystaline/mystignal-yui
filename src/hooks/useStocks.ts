import { useQuery } from '@tanstack/react-query'
import { getStocks } from '@/lib/api/stocks'
import { queryKeys } from '@/lib/query-keys'

export function useStocks() {
  return useQuery({
    queryKey: queryKeys.stocks.all,
    queryFn: getStocks,
    staleTime: 10 * 60 * 1000, // stocks list changes rarely
  })
}
