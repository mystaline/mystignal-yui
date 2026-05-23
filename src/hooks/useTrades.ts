import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelTrade, closeTrade, getTradeSummary, getTrades, logTrade } from '@/lib/api/trades'
import { queryKeys } from '@/lib/query-keys'
import type { CloseTradeRequest, TradeFilterParams } from '@/types/trade'

export function useTradeList(params: TradeFilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.trades.list(params),
    queryFn: () => getTrades(params),
    staleTime: 30 * 1000,
  })
}

export function useTradeSummary() {
  return useQuery({
    queryKey: queryKeys.trades.summary,
    queryFn: getTradeSummary,
    staleTime: 30 * 1000,
  })
}

export function useLogTrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trades.all })
    },
  })
}

export function useCloseTrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: CloseTradeRequest }) => closeTrade(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trades.all })
    },
  })
}

export function useCancelTrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trades.all })
    },
  })
}
