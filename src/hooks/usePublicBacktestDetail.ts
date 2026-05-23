import { useQuery } from '@tanstack/react-query'
import { getPublicBacktestDetail } from '@/lib/api/backtest'
import { queryKeys } from '@/lib/query-keys'

export function usePublicBacktestDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.publicBacktests.detail(id),
    queryFn: () => getPublicBacktestDetail(id),
    enabled: !!id,
    staleTime: Infinity,
  })
}
