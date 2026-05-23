import { apiClient } from './client'
import type { PaginatedResponse } from '@/types/api'
import type { BacktestDetailResponse, BacktestListItem, TradeFilter, TriggerBacktestRequest, TriggerBacktestResponse, TriggerPublicBacktestRequest, PublicBacktestJobResponse } from '@/types/backtest'
import type { CandleDateRange } from './candles'

export async function getBacktestList(page: number, pageSize: number, runType?: string): Promise<PaginatedResponse<BacktestListItem>> {
  if (apiClient.useMock) return apiClient.mock.getBacktestList(page, pageSize, runType)
  return apiClient.get<PaginatedResponse<BacktestListItem>>('/backtest', { page, pageSize, ...(runType ? { runType } : {}) })
}

export async function getBacktestDetail(id: string): Promise<BacktestDetailResponse> {
  if (apiClient.useMock) return apiClient.mock.getBacktestDetail(id)
  return apiClient.get<BacktestDetailResponse>(`/backtest/${id}`)
}

export async function getBacktestTrades(id: string, page: number, pageSize: number, filter?: TradeFilter) {
  if (apiClient.useMock) return apiClient.mock.getBacktestTrades(id, page, pageSize, filter)
  return apiClient.get<PaginatedResponse<BacktestDetailResponse['trades'][0]>>(
    `/backtest/${id}/trades`,
    { page, pageSize, ...(filter && filter !== 'all' ? { filter } : {}) },
  )
}

export async function triggerBacktest(req: TriggerBacktestRequest): Promise<TriggerBacktestResponse> {
  if (apiClient.useMock) return apiClient.mock.triggerBacktest(req)
  return apiClient.post<TriggerBacktestResponse>('/backtest', req)
}

export async function getGridSearchTemplates(): Promise<BacktestListItem[]> {
  if (apiClient.useMock) return apiClient.mock.getGridSearchTemplates()
  return apiClient.get<BacktestListItem[]>('/backtest/templates/grid-search')
}

export async function triggerPublicBacktest(req: TriggerPublicBacktestRequest): Promise<TriggerBacktestResponse> {
  return apiClient.publicPost<TriggerBacktestResponse>('/backtest', req)
}

export async function getPublicBacktestJob(workflowId: string): Promise<PublicBacktestJobResponse> {
  return apiClient.publicGet<PublicBacktestJobResponse>(`/backtest/job/${workflowId}`)
}

export async function getPublicCandleDateRange(): Promise<CandleDateRange> {
  return apiClient.publicGet<CandleDateRange>('/candles/range')
}
