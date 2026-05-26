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
  return apiClient.get<JournalListResponse>('/trades', params as Record<string, unknown>)
}

export async function getTradeSummary(): Promise<JournalSummary> {
  return apiClient.get<JournalSummary>('/trades/summary')
}

export async function logTrade(req: LogTradeRequest): Promise<CreateTradeResponse> {
  return apiClient.post<CreateTradeResponse>('/trades', req)
}

export async function closeTrade(id: string, req: CloseTradeRequest): Promise<JournalTrade> {
  return apiClient.post<JournalTrade>(`/trades/${id}/close`, req)
}

export async function cancelTrade(id: string): Promise<{ id: string; status: string }> {
  return apiClient.post(`/trades/${id}/cancel`, {})
}
