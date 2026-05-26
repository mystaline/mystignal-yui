import type { SignalFilterParams } from '@/types/signal'
import type { TradeFilterParams } from '@/types/trade'

/**
 * Query Key Factory Registry
 *
 * STALE TIME STRATEGY:
 * - Default (App.tsx QueryClient): 2 minutes (120000ms) — most lists, mutable data
 * - Infinity: Immutable snapshots (backtest detail, trades within backtest)
 * - 5 minutes (300000ms): Quasi-static (market status symbols, grid templates)
 * - 30 seconds (30000ms): Live feeds (signals list during analysis)
 *
 * Use `staleTime` in hook queries to override defaults per data volatility.
 */

export const queryKeys = {
  backtests: {
    all: ['backtests'] as const,
    list: (page: number, pageSize: number, runType?: string) =>
      ['backtests', 'list', page, pageSize, runType ?? 'all'] as const,
    detail: (id: string) => ['backtests', 'detail', id] as const,
    trades: (id: string, page: number, filter?: string, pageSize?: number) =>
      ['backtests', 'trades', id, page, filter ?? 'all', pageSize ?? 15] as const,
    gridSearchTemplates: ['backtests', 'grid-search-templates'] as const,
  },
  signals: {
    all: ['signals'] as const,
    list: (params: SignalFilterParams) => ['signals', 'list', params] as const,
    marketStatus: (symbol?: string) =>
      symbol ? ['signals', 'market-status', symbol] : ['signals', 'market-status'] as const,
    suggestions: (symbol: string) => ['signals', 'suggestions', symbol] as const,
  },
  stocks: {
    all: ['stocks'] as const,
  },
  candles: {
    all: ['candles'] as const,
    bySymbol: (symbol: string, timeframe: string) => ['candles', symbol, timeframe] as const,
    range: ['candles', 'range'] as const,
  },
  trades: {
    all: ['trades'] as const,
    list: (params: TradeFilterParams) => ['trades', 'list', params] as const,
    summary: ['trades', 'summary'] as const,
  },
  publicBacktests: {
    list: ['public', 'backtests', 'list'] as const,
    detail: (id: string) => ['public', 'backtests', 'detail', id] as const,
  },
  publicCandles: {
    range: ['public', 'candles', 'range'] as const,
  },
} as const
