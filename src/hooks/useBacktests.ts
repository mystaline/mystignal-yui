import { useQuery } from '@tanstack/react-query'
import { getBacktestList } from '@/lib/api/backtest'
import { queryKeys } from '@/lib/query-keys'

export function useBacktests(page = 1, pageSize = 20, runType?: string) {
  return useQuery({
    queryKey: queryKeys.backtests.list(page, pageSize, runType),
    queryFn: () => getBacktestList(page, pageSize, runType),
  })
}
