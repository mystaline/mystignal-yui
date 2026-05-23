import { apiClient } from './client'
import type { CandleListResponse } from '@/types/candle'

export async function getCandles(symbol: string, timeframe: string, limit = 200): Promise<CandleListResponse> {
  if (apiClient.useMock) return apiClient.mock.getCandles(symbol, timeframe)
  return apiClient.get<CandleListResponse>(`/candles/${symbol}`, { timeframe, limit })
}

export interface CandleDateRange {
  oldest: string
  latest: string
}

export async function getCandleDateRange(): Promise<CandleDateRange> {
  return apiClient.get<CandleDateRange>('/candles/range')
}
