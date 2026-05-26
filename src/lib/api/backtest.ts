import { apiClient } from './client'
import type { PaginatedResponse } from '@/types/api'
import type { BacktestDetailResponse, BacktestListItem, TradeFilter, TriggerBacktestRequest, TriggerBacktestResponse, PublicBacktestJobResponse } from '@/types/backtest'

export async function getBacktestList(page: number, pageSize: number, runType?: string): Promise<PaginatedResponse<BacktestListItem>> {
  return apiClient.get<PaginatedResponse<BacktestListItem>>('/backtest', { page, pageSize, ...(runType ? { runType } : {}) })
}

export async function getBacktestDetail(id: string): Promise<BacktestDetailResponse> {
  return apiClient.get<BacktestDetailResponse>(`/backtest/${id}`)
}

export async function getBacktestTrades(id: string, page: number, pageSize: number, filter?: TradeFilter) {
  return apiClient.get<PaginatedResponse<BacktestDetailResponse['trades'][0]>>(
    `/backtest/${id}/trades`,
    { page, pageSize, ...(filter && filter !== 'all' ? { filter } : {}) },
  )
}

export async function triggerBacktest(req: TriggerBacktestRequest): Promise<TriggerBacktestResponse> {
  return apiClient.post<TriggerBacktestResponse>('/backtest', req)
}

export async function getGridSearchTemplates(): Promise<BacktestListItem[]> {
  return apiClient.get<BacktestListItem[]>('/backtest/templates/grid-search')
}

export async function getBacktestJob(workflowId: string): Promise<PublicBacktestJobResponse> {
  return apiClient.get<PublicBacktestJobResponse>(`/backtest/job/${workflowId}`)
}
