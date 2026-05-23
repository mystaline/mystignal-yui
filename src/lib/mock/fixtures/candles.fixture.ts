import type { CandleListResponse } from '@/types/candle'

function generateCandles(symbol: string, days = 120): CandleListResponse {
  const data = []
  let price = symbol === 'BBCA' ? 9200 : symbol === 'TLKM' ? 3300 : 4500
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    if (date.getDay() === 0 || date.getDay() === 6) continue

    const change = (Math.random() - 0.48) * price * 0.025
    const open = price
    const close = Math.max(open + change, open * 0.95)
    const high = Math.max(open, close) * (1 + Math.random() * 0.015)
    const low = Math.min(open, close) * (1 - Math.random() * 0.015)
    const volume = Math.floor(Math.random() * 50_000_000) + 5_000_000

    data.push({
      timestamp: date.toISOString(),
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
      volume,
    })

    price = close
  }

  return { symbol, timeframe: '1d', data, count: data.length }
}

export const mockCandles: Record<string, CandleListResponse> = {
  BBCA: generateCandles('BBCA'),
  TLKM: generateCandles('TLKM'),
  ASII: generateCandles('ASII'),
  BMRI: generateCandles('BMRI'),
  UNVR: generateCandles('UNVR'),
}

export function getMockCandles(symbol: string): CandleListResponse {
  return mockCandles[symbol] ?? generateCandles(symbol)
}
