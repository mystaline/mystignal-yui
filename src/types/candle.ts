export interface CandleResponse {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface CandleListResponse {
  symbol: string
  timeframe: string
  data: CandleResponse[]
  count: number
}

export interface CandleFilterParams {
  symbol: string
  timeframe: string
  startDate?: string
  endDate?: string
  limit?: number
}
