import type { BacktestListItem, BacktestDetailResponse } from '@/types/backtest'
import type { PaginatedResponse } from '@/types/api'
import backtestData from '@/data/mystignal-backtest.json'

export const mockGridSearchList: PaginatedResponse<BacktestListItem> = {
  data: backtestData.results.map((r, i) => ({
    id: String(i + 1),
    strategyName: `Daily Swing Trading - Grid Search Rank #${i + 1}`,
    timeframe: r.timeframe,
    startDate: r.startDate + 'T00:00:00Z',
    endDate: r.endDate + 'T00:00:00Z',
    initialCapital: r.initialCapital,
    monthlyAddition: r.monthlyAddition,
    finalCapital: r.finalCapital,
    profitPercentage: r.profitPercentage,
    totalTrades: r.totalTrades,
    winRate: r.winRate,
    sharpeRatio: r.sharpeRatio,
    maxDrawdown: r.maxDrawdown,
    profitFactor: (r as any).profitFactor ?? 0,
    createdAt: '2026-05-19T00:00:00Z',
  })),
  total: backtestData.summary.totalCombos,
  page: 1,
  pageSize: 20,
  totalPages: Math.ceil(backtestData.summary.totalCombos / 20),
}

export const mockBacktestList: PaginatedResponse<BacktestListItem> = {
  data: [
    {
      id: '1',
      strategyName: 'SwingDailyATR',
      timeframe: '1d',
      startDate: '2024-01-02T00:00:00Z',
      endDate: '2026-04-16T00:00:00Z',
      initialCapital: 250000,
      monthlyAddition: 500000,
      finalCapital: 18472517,
      profitPercentage: 163.89,
      totalTrades: 205,
      winRate: 44.39,
      sharpeRatio: 1.87,
      maxDrawdown: 16.08,
      profitFactor: 2.14,
      createdAt: '2026-04-17T10:00:00Z',
    },
    {
      id: '2',
      strategyName: 'SwingDailyATR',
      timeframe: '15m',
      startDate: '2025-01-01T00:00:00Z',
      endDate: '2026-04-16T00:00:00Z',
      initialCapital: 500000,
      monthlyAddition: 0,
      finalCapital: 3241800,
      profitPercentage: 48.36,
      totalTrades: 512,
      winRate: 38.87,
      sharpeRatio: 1.12,
      maxDrawdown: 22.41,
      profitFactor: 1.43,
      createdAt: '2026-04-15T14:30:00Z',
    },
    {
      id: '3',
      strategyName: 'MomentumBreakout',
      timeframe: '1d',
      startDate: '2023-01-01T00:00:00Z',
      endDate: '2026-04-16T00:00:00Z',
      initialCapital: 1000000,
      monthlyAddition: 0,
      finalCapital: 4820000,
      profitPercentage: 82.0,
      totalTrades: 98,
      winRate: 51.02,
      sharpeRatio: 1.54,
      maxDrawdown: 18.33,
      profitFactor: 1.87,
      createdAt: '2026-04-10T08:00:00Z',
    },
  ],
  total: 3,
  page: 1,
  pageSize: 20,
  totalPages: 1,
}

function generateDailyCapital(): { date: string; capital: number }[] {
  const result = []
  const start = new Date('2024-01-02')
  const end = new Date('2026-04-16')
  let capital = 250000
  const targetFinal = 18472517
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000)
  const dailyGrowthRate = Math.pow(targetFinal / capital, 1 / totalDays)

  const cur = new Date(start)
  while (cur <= end) {
    const dow = cur.getDay()
    if (dow !== 0 && dow !== 6) {
      const noise = 1 + (Math.random() - 0.46) * 0.018
      capital = Math.round(capital * dailyGrowthRate * noise)
      result.push({ date: cur.toISOString().split('T')[0], capital })
    }
    cur.setDate(cur.getDate() + 1)
  }

  result[result.length - 1].capital = targetFinal
  return result
}

const capitalHistory = generateDailyCapital()

export const mockBacktestDetail: BacktestDetailResponse = {
  metadata: {
    id: '1',
    strategy: 'SwingDailyATR',
    timeframe: '1d',
    startDate: '2024-01-02T00:00:00Z',
    endDate: '2026-04-16T00:00:00Z',
    source: 'private',
  },
  aggregate: {
    initialCapital: 250000,
    totalInvested: 6250000,
    finalCapital: 8086000,
    netProfit: 1656000,
    roiPct: 26.50,
    totalTrades: 5,
    winningTrades: 4,
    losingTrades: 1,
    winRatePct: 80.00,
    avgWin: 469000,
    avgLoss: 220000,
    largestWin: 756000,
    largestLoss: 220000,
    profitFactor: 8.53,
    sharpeRatio: 2.14,
    maxDrawdownPct: 8.50,
  },
  capitalHistory,
  trades: [
    {
      id: '1', symbol: 'BBCA', lot: 8, entryTime: '2024-11-15T09:00:00Z', exitTime: '2024-11-22T16:00:00Z',
      entryPrice: 9450, exitPrice: 10200, targetPrice: 10300, stopLoss: 9000,
      profitAmount: 756000, profitPercentage: 7.94, holdDurationMinutes: 10080,
      reason: 'RSI+Breakout', confidence: 72.5, status: 'buy_tp', indicatorsSnapshot: { rsi: 38.2, ma20: 9380, atr: 285 },
    },
    {
      id: '2', symbol: 'TLKM', lot: 12, entryTime: '2024-12-03T09:00:00Z', exitTime: '2024-12-10T16:00:00Z',
      entryPrice: 3200, exitPrice: 2980, targetPrice: 3520, stopLoss: 3040,
      profitAmount: -220000, profitPercentage: -6.88, holdDurationMinutes: 10080,
      reason: 'RSI+Breakout', confidence: 52.1, status: 'buy_sl', indicatorsSnapshot: { rsi: 42.7, ma20: 3180, atr: 92 },
    },
    {
      id: '3', symbol: 'ASII', lot: 5, entryTime: '2025-01-08T09:00:00Z', exitTime: '2025-01-20T16:00:00Z',
      entryPrice: 4250, exitPrice: 4830, targetPrice: 4900, stopLoss: 4000,
      profitAmount: 580000, profitPercentage: 13.65, holdDurationMinutes: 17280,
      reason: 'TrendBreak', confidence: 81.3, status: 'buy_tp', indicatorsSnapshot: { rsi: 35.1, ma20: 4180, atr: 145 },
    },
    {
      id: '4', symbol: 'BMRI', lot: 3, entryTime: '2025-02-14T09:00:00Z', exitTime: '2025-03-01T16:00:00Z',
      entryPrice: 5750, exitPrice: 5810, targetPrice: 6200, stopLoss: 5450,
      profitAmount: 60000, profitPercentage: 1.04, holdDurationMinutes: 21600,
      reason: 'TrendBreak', confidence: 43.8, status: 'timeout', indicatorsSnapshot: { rsi: 49.2, ma20: 5720, atr: 188 },
    },
    {
      id: '5', symbol: 'UNVR', lot: 20, entryTime: '2025-03-10T09:00:00Z', exitTime: '2025-03-25T16:00:00Z',
      entryPrice: 2100, exitPrice: 2580, targetPrice: 2600, stopLoss: 1950,
      profitAmount: 480000, profitPercentage: 22.86, holdDurationMinutes: 21600,
      reason: 'SwingLow', confidence: 88.4, status: 'buy_tp', indicatorsSnapshot: { rsi: 31.8, ma20: 2050, atr: 68 },
    },
  ],
}
