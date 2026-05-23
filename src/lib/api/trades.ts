import { apiClient } from './client'
import type {
  CloseTradeRequest,
  CreateTradeResponse,
  JournalListResponse,
  JournalSummary,
  JournalTrade,
  LogTradeRequest,
  TradeFilterParams,
} from '@/types/trade'

export async function getTrades(params: TradeFilterParams = {}): Promise<JournalListResponse> {
  if (apiClient.useMock) return apiClient.mock.getTrades(params)
  return apiClient.get<JournalListResponse>('/trades', params as Record<string, unknown>)
}

export async function getTradeSummary(): Promise<JournalSummary> {
  if (apiClient.useMock) return apiClient.mock.getTradeSummary()
  return apiClient.get<JournalSummary>('/trades/summary')
}

export async function logTrade(req: LogTradeRequest): Promise<CreateTradeResponse> {
  if (apiClient.useMock) return apiClient.mock.logTrade(req)
  return apiClient.post<CreateTradeResponse>('/trades', req)
}

export async function closeTrade(id: string, req: CloseTradeRequest): Promise<JournalTrade> {
  if (apiClient.useMock) return apiClient.mock.closeTrade(id, req)
  return apiClient.post<JournalTrade>(`/trades/${id}/close`, req)
}

export async function cancelTrade(id: string): Promise<{ id: string; status: string }> {
  if (apiClient.useMock) return apiClient.mock.cancelTrade(id)
  return apiClient.post(`/trades/${id}/cancel`, {})
}
