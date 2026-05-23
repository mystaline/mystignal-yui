export interface BacktestListItem {
  id: string
  strategyName: string
  timeframe: string
  startDate: string
  endDate: string
  initialCapital: number
  monthlyAddition: number
  workflowParams?: {
    entryTiming?: string
    compositeIndex?: string
    minConfidence?: number
    enableHoldDays?: boolean
    holdDays?: number
    useTrailingStop?: boolean
    trailingStopPct?: number
    enableSlippage?: boolean
    enableAdminFee?: boolean
    dcaDay?: number
    monthlyProfitCapPct?: number
    useATRFilter?: boolean  // legacy; newer runs use minATRPct
    minATRPct?: number
    periodEndMode?: string
  }
  finalCapital: number
  profitPercentage: number
  totalTrades: number
  winRate: number
  sharpeRatio: number
  maxDrawdown: number
  profitFactor: number
  createdAt: string
}

export interface BacktestMetadata {
  id: string
  strategy: string
  timeframe: string
  startDate: string
  endDate: string
  source: string
}

export interface GenericStrategyConfigDTO {
  rsi: { enabled: boolean; period: number; oversoldThreshold: number; weight: number }
  ema: { enabled: boolean; fastPeriod: number; slowPeriod: number; weight: number }
  volume: { enabled: boolean; spikeThreshold: number; weight: number }
  atrFilter: { enabled: boolean; period: number; minAtrPct: number }
  slMultiplier: number
  tpMultiplier: number
  holdDays: number
  useTrailingStop: boolean
  trailingStopPct: number
}

export const DEFAULT_GENERIC_STRATEGY: GenericStrategyConfigDTO = {
  rsi:    { enabled: true,  period: 14, oversoldThreshold: 35, weight: 0.4 },
  ema:    { enabled: true,  fastPeriod: 20, slowPeriod: 50, weight: 0.35 },
  volume: { enabled: true,  spikeThreshold: 1.3, weight: 0.25 },
  atrFilter: { enabled: false, period: 14, minAtrPct: 0.015 },
  slMultiplier: 2.0,
  tpMultiplier: 3.5,
  holdDays: 15,
  useTrailingStop: false,
  trailingStopPct: 1.5,
}

export interface TriggerPublicBacktestRequest {
  startDate: string
  endDate: string
  minConfidence: number
  initialCapital: number
  monthlyAddition: number
  dcaDay: number
  enableHoldDays?: boolean
  enableAdminFee: boolean
  enableSlippage: boolean
  entryTiming: string
  compositeIndex: string
  monthlyProfitCapPct: number
  strategyConfig: GenericStrategyConfigDTO
}

export interface BacktestAggregate {
  initialCapital: number
  totalInvested: number
  finalCapital: number
  netProfit: number
  roiPct: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRatePct: number
  avgWin: number
  avgLoss: number
  largestWin: number
  largestLoss: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdownPct: number
}

export type TradeStatus = 'buy_tp' | 'buy_sl' | 'timeout' | 'skipped' | 'period_end' | 'holding'

export type TradeFilter = 'all' | 'realized' | 'open'

export interface IndicatorSnapshot {
  rsi: number
  ma20: number
  atr: number
  [key: string]: number | boolean | string
}

export const TRADE_FILTER_META: Record<TradeFilter, { label: string; tabLabel: string }> = {
  all:      { label: 'All trades',      tabLabel: 'All' },
  realized: { label: 'Realized trades', tabLabel: 'Realized' },
  open:     { label: 'Open positions',  tabLabel: 'Open' },
}

export interface BacktestTradeResponse {
  id: string
  symbol: string
  lot: number
  entryTime: string
  exitTime?: string
  entryPrice: number
  exitPrice: number
  targetPrice: number
  stopLoss: number
  profitAmount: number
  profitPercentage: number
  holdDurationMinutes: number
  confidence: number
  reason: string
  status: TradeStatus
  indicatorsSnapshot: IndicatorSnapshot
}

// Discriminated aliases — use isOpenTrade() to narrow at call sites.
export type ResolvedTradeResponse = BacktestTradeResponse & { status: Exclude<TradeStatus, 'holding'> }
export type OpenTradeResponse     = BacktestTradeResponse & { status: 'holding' }

export function isOpenTrade(t: BacktestTradeResponse): t is OpenTradeResponse {
  return t.status === 'holding'
}

export interface CapitalPoint {
  period: number
  date: string
  capital: number
}

export interface BacktestDetailResponse {
  metadata: BacktestMetadata
  aggregate: BacktestAggregate
  capitalHistory: CapitalPoint[]
  trades: BacktestTradeResponse[]
}

// Matches Go dto.PublicBacktestResult — aggregate + equity curve, no trades
export interface PublicBacktestResult {
  metadata: BacktestMetadata
  aggregate: BacktestAggregate
  capitalHistory: CapitalPoint[]
}

export type PublicJobStatus = 'queued' | 'running' | 'done' | 'failed' | 'expired'

// Matches Go dto.PublicBacktestJobResponse
export interface PublicBacktestJobResponse {
  status: PublicJobStatus
  phase?: string
  label?: string
  result?: PublicBacktestResult
  error?: string
}

export interface TriggerBacktestRequest {
  strategyName: string
  timeframe: string
  startDate: string
  endDate: string
  minConfidence: number
  useTrailingStop: boolean
  trailingStopPct: number
  enableAdminFee: boolean
  enableSlippage: boolean
  enableHoldDays: boolean
  holdDays: number
  useATRFilter: boolean
  initialCapital: number
  monthlyAddition: number
  dcaDay: number
  entryTiming: string
  compositeIndex: string
  monthlyProfitCapPct: number
  runName?: string
}

export type BacktestWorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface TriggerBacktestResponse {
  id: number
  status: BacktestWorkflowStatus
  message: string
  workflowId?: string
  createdAt: string
}
