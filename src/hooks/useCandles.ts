import { useQuery } from '@tanstack/react-query'
import { getCandles } from '@/lib/api/candles'
import { queryKeys } from '@/lib/query-keys'

export function useCandles(symbol: string, timeframe = '1d', limit = 200) {
  return useQuery({
    queryKey: queryKeys.candles.bySymbol(symbol, timeframe),
    queryFn: () => getCandles(symbol, timeframe, limit),
    enabled: symbol.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
