import { apiClient } from './client'
import type {
  SignalFilterParams,
  SignalListResponse,
  TriggerAnalyzeRequest,
  TriggerAnalyzeResponse,
  MarketStatusResponse,
} from '@/types/signal'

export async function getSignals(params: SignalFilterParams): Promise<SignalListResponse> {
  return apiClient.get<SignalListResponse>('/signals', params as Record<string, unknown>)
}

export async function triggerAnalyze(req: TriggerAnalyzeRequest): Promise<TriggerAnalyzeResponse> {
  return apiClient.post<TriggerAnalyzeResponse>('/signals/analyze', req)
}

export async function getMarketStatus(symbol = '^JKSE'): Promise<MarketStatusResponse> {
  return apiClient.get<MarketStatusResponse>('/signals/market-status', { symbol })
}

export async function clearAllSignals(): Promise<void> {
  return apiClient.delete('/signals')
}
