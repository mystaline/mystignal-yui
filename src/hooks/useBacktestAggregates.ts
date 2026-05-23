import type { BacktestListItem } from '@/types/backtest'

interface Aggregates {
  totalBacktests: number
  avgProfit: number
  avgROI: number
  profitableCount: number
  avgWinRate: number
  avgSharpe: number
}

export function useBacktestAggregates(backtests: BacktestListItem[]): Aggregates {
  if (!backtests || backtests.length === 0) {
    return {
      totalBacktests: 0,
      avgProfit: 0,
      avgROI: 0,
      profitableCount: 0,
      avgWinRate: 0,
      avgSharpe: 0,
    }
  }

  const profitable = backtests.filter(b => b.profitPercentage > 0).length
  const totalFinalCapital = backtests.reduce((sum, b) => sum + b.finalCapital, 0)
  const totalInitial = backtests.reduce((sum, b) => sum + b.initialCapital, 0)
  const avgProfit = (totalFinalCapital - totalInitial) / backtests.length
  const avgROI = backtests.reduce((sum, b) => sum + b.profitPercentage, 0) / backtests.length
  const avgWinRate = backtests.reduce((sum, b) => sum + b.winRate, 0) / backtests.length
  const avgSharpe = backtests.reduce((sum, b) => sum + b.sharpeRatio, 0) / backtests.length

  return {
    totalBacktests: backtests.length,
    avgProfit,
    avgROI,
    profitableCount: profitable,
    avgWinRate: avgWinRate * 100,
    avgSharpe,
  }
}
