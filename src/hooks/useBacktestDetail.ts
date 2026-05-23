import { useQuery } from '@tanstack/react-query'
import { getBacktestDetail } from '@/lib/api/backtest'
import { queryKeys } from '@/lib/query-keys'

export function useBacktestDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.backtests.detail(id),
    queryFn: () => getBacktestDetail(id),
    enabled: !!id,
    staleTime: Infinity,
  })
}
