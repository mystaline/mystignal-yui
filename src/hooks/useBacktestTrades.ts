import { useQuery } from '@tanstack/react-query'
import { getBacktestTrades } from '@/lib/api/backtest'
import { queryKeys } from '@/lib/query-keys'
import type { TradeFilter } from '@/types/backtest'

export const TRADES_PAGE_SIZE = 15

export function useBacktestTrades(id: string, page = 1, pageSize = TRADES_PAGE_SIZE, filter: TradeFilter = 'all') {
  return useQuery({
    queryKey: queryKeys.backtests.trades(id, page, filter, pageSize),
    queryFn: () => getBacktestTrades(id, page, pageSize, filter),
    enabled: !!id,
    staleTime: Infinity,
  })
}
