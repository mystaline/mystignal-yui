import { useQuery } from '@tanstack/react-query'
import { getGridSearchTemplates } from '@/lib/api/backtest'
import { getLiveKey } from '@/lib/api/client'
import { queryKeys } from '@/lib/query-keys'

export function useGridSearchTemplates() {
  return useQuery({
    queryKey: queryKeys.backtests.gridSearchTemplates,
    queryFn: getGridSearchTemplates,
    staleTime: 5 * 60 * 1000,
    enabled: !!getLiveKey(),
  })
}
