import { useQuery } from '@tanstack/react-query'
import { getGridSearchTemplates } from '@/lib/api/backtest'
import { queryKeys } from '@/lib/query-keys'

export function useGridSearchTemplates() {
  return useQuery({
    queryKey: queryKeys.backtests.gridSearchTemplates,
    queryFn: getGridSearchTemplates,
    staleTime: 5 * 60 * 1000,
  })
}
