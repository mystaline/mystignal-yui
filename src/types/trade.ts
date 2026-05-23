export type TradeStatus = 'Open' | 'Closed' | 'Cancelled'

export interface JournalTrade {
  id: string
  stockId?: number
  symbol: string
  lot: number
  entryPrice: number
  entryTime: string
  exitPrice?: number
  exitTime?: string
  takeProfit?: number
  stopLoss?: number
  commission: number
  signalId?: string
  profitLoss?: number
  profitLossPct?: number
  holdTimeMinutes?: number
  latestPrice?: number
  unrealizedPnl?: number
  unrealizedPnlPct?: number
  notes?: string
  status: TradeStatus
  createdAt: string
  updatedAt: string
}

export interface JournalSummary {
  openCount: number
  closedCount: number
  totalRealizedPnl: number
  totalUnrealizedPnl: number
  winRate: number
}

export interface JournalListResponse {
  data: JournalTrade[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface LogTradeRequest {
  symbol: string
  stockId?: number
  lot: number
  entryPrice: number
  entryTime: string
  takeProfit?: number
  stopLoss?: number
  signalId?: string
  notes?: string
}

export interface CloseTradeRequest {
  exitPrice: number
  exitTime: string
}

export interface TradeFilterParams {
  status?: TradeStatus | ''
  symbol?: string
  page?: number
  pageSize?: number
}

export interface CreateTradeResponse {
  id: string
  commission: number
}
