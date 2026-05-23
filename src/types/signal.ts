import type { IndicatorSnapshot } from './backtest'

export type SignalType = 'BUY' | 'SELL' | 'SKIP'
export type SignalStatus = 'active' | 'expired' | 'executed'

export interface SignalResponse {
  id: string
  symbol: string
  type: SignalType
  confidence: number
  price: number
  targetPrice?: number
  stopLoss?: number
  riskRewardRatio?: number
  positionSize?: number
  positionValue?: number
  status?: SignalStatus
  reason?: string
  indicators: IndicatorSnapshot
  generatedAt: string
  latestClose?: number
  priceGapPct?: number
  validityTag?: string
  daysOld?: number
  sourceStrategy?: string
  sourceROI?: number
  sourceWinRate?: number
}

export interface SignalListResponse {
  data: SignalResponse[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SignalFilterParams {
  symbol?: string
  type?: SignalType
  status?: SignalStatus
  page?: number
  pageSize?: number
}

export interface TriggerAnalyzeRequest {
  backtestTemplateId?: number  // when set, backend resolves all params from this template ID
  minConfidence: number
  compositeIndex: string
  minATRPct: number      // 0 = use server default (2%)
  holdDays: number
  useTrailingStop: boolean
  trailingStopPct: number
  entryTiming: string
}

export interface TriggerAnalyzeResponse {
  status: string
  message: string
  workflowId?: string
  createdAt: string
}

export interface MarketStatusResponse {
  symbol: string
  bullish: boolean
  lastClose: number
  ema50: number
  asOf: string
}
