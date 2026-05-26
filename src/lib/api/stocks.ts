import { apiClient } from './client'

export interface StockItem {
  symbol: string
  name: string
  sector: string
  isSyariah: boolean
}

export interface StockListResponse {
  data: StockItem[]
  total: number
}

export async function getStocks(): Promise<StockListResponse> {
  return apiClient.get<StockListResponse>('/stocks')
}
