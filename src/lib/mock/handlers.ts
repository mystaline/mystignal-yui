import type { PaginatedResponse } from '@/types/api'
import type { BacktestDetailResponse, BacktestListItem, TradeFilter, TriggerBacktestRequest, TriggerBacktestResponse } from '@/types/backtest'
import type { CandleListResponse } from '@/types/candle'
import type { MarketStatusResponse, SignalFilterParams, SignalListResponse } from '@/types/signal'
import type { CloseTradeRequest, JournalListResponse, JournalSummary, JournalTrade, LogTradeRequest, TradeFilterParams } from '@/types/trade'
import type { StockListResponse } from '@/lib/api/stocks'
import { mockBacktestDetail, mockBacktestList, mockGridSearchList } from './fixtures/backtest.fixture'
import { getMockCandles } from './fixtures/candles.fixture'
import { mockSignals } from './fixtures/signals.fixture'
import { mockTradeList, mockTradeSummary } from './fixtures/trades.fixture'

const delay = (ms = 400) => new Promise<void>(r => setTimeout(r, ms))

export const mockHandlers = {
  async getBacktestList(_page: number, _pageSize: number, runType?: string): Promise<PaginatedResponse<BacktestListItem>> {
    await delay()
    if (runType === 'grid_search') return mockGridSearchList
    return mockBacktestList
  },

  async getBacktestDetail(backtestId: string): Promise<BacktestDetailResponse> {
    await delay(600)
    if (backtestId === '999') throw new Error('Backtest not found')
    return { ...mockBacktestDetail, metadata: { ...mockBacktestDetail.metadata, id: backtestId } }
  },

  async getBacktestTrades(_id: string, page: number, pageSize: number, filter: TradeFilter = 'all'): Promise<PaginatedResponse<BacktestDetailResponse['trades'][0]>> {
    await delay()
    let trades = mockBacktestDetail.trades
    if (filter === 'realized') trades = trades.filter(t => t.status !== 'holding')
    if (filter === 'open')     trades = trades.filter(t => t.status === 'holding')
    const start = (page - 1) * pageSize
    return {
      data: trades.slice(start, start + pageSize),
      total: trades.length,
      page,
      pageSize,
      totalPages: Math.ceil(trades.length / pageSize),
    }
  },

  async triggerBacktest(_req: TriggerBacktestRequest): Promise<TriggerBacktestResponse> {
    await delay(800)
    return {
      id: Math.floor(Math.random() * 1000) + 10,
      status: 'running',
      message: 'Backtest workflow triggered successfully',
      workflowId: `wf-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
  },

  async getStocks(): Promise<StockListResponse> {
    await delay()
    return {
      data: [
        { symbol: 'BBCA', name: 'Bank Central Asia', sector: 'Finance', isSyariah: false },
        { symbol: 'TLKM', name: 'Telkom Indonesia', sector: 'Telecommunications', isSyariah: true },
        { symbol: 'ASII', name: 'Astra International', sector: 'Automotive', isSyariah: false },
        { symbol: 'BMRI', name: 'Bank Mandiri', sector: 'Finance', isSyariah: false },
        { symbol: 'UNVR', name: 'Unilever Indonesia', sector: 'Consumer Goods', isSyariah: false },
        { symbol: 'GOTO', name: 'GoTo Gojek Tokopedia', sector: 'Technology', isSyariah: true },
        { symbol: 'BBRI', name: 'Bank Rakyat Indonesia', sector: 'Finance', isSyariah: false },
        { symbol: 'HMSP', name: 'HM Sampoerna', sector: 'Consumer Goods', isSyariah: false },
      ],
      total: 8,
    }
  },

  async getMarketStatus(symbol: string): Promise<MarketStatusResponse> {
    await delay()
    return { symbol, bullish: true, lastClose: 6850, ema50: 6720, asOf: new Date().toISOString() }
  },

  async getGridSearchTemplates(): Promise<BacktestListItem[]> {
    await delay()
    return mockGridSearchList.data
  },

  async getSignals(params: SignalFilterParams): Promise<SignalListResponse> {
    await delay()
    let data = [...mockSignals.data]
    if (params.symbol) data = data.filter(s => s.symbol.toUpperCase().includes(params.symbol!.toUpperCase()))
    if (params.type) data = data.filter(s => s.type === params.type)
    if (params.status) data = data.filter(s => s.status === params.status)
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const start = (page - 1) * pageSize
    return {
      data: data.slice(start, start + pageSize),
      total: data.length,
      page,
      pageSize,
      totalPages: Math.ceil(data.length / pageSize),
    }
  },

  async getCandles(symbol: string, _timeframe: string): Promise<CandleListResponse> {
    await delay(500)
    return getMockCandles(symbol)
  },

  async getTrades(params: TradeFilterParams): Promise<JournalListResponse> {
    await delay()
    let data = [...mockTradeList.data]
    if (params.status) data = data.filter(t => t.status === params.status)
    if (params.symbol) data = data.filter(t => t.symbol.toUpperCase().includes(params.symbol!.toUpperCase()))
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 20
    const start = (page - 1) * pageSize
    return { data: data.slice(start, start + pageSize), total: data.length, page, pageSize, totalPages: Math.ceil(data.length / pageSize) }
  },

  async getTradeSummary(): Promise<JournalSummary> {
    await delay()
    return mockTradeSummary
  },

  async logTrade(req: LogTradeRequest): Promise<{ id: string; commission: number }> {
    await delay(600)
    const commission = req.lot * 100 * req.entryPrice * 0.0015
    return { id: String(Date.now()), commission }
  },

  async closeTrade(id: string, req: CloseTradeRequest): Promise<JournalTrade> {
    await delay(600)
    const trade = mockTradeList.data.find(t => t.id === id)
    if (!trade) throw new Error('Trade not found')
    return { ...trade, status: 'Closed', exitPrice: req.exitPrice, exitTime: req.exitTime }
  },

  async cancelTrade(id: string): Promise<{ id: string; status: string }> {
    await delay()
    return { id, status: 'Cancelled' }
  },
}
