import type { SignalListResponse } from '@/types/signal'

export const mockSignals: SignalListResponse = {
  data: [
    {
      id: '1', symbol: 'BBCA', type: 'BUY', confidence: 82.4,
      price: 9650, targetPrice: 10400, stopLoss: 9200, riskRewardRatio: 1.63,
      reason: 'RSI oversold + ATR breakout + MA cross', status: 'active',
      indicators: { rsi: 34.2, ma20: 9580, ma50: 9420, atr: 298 },
      generatedAt: '2026-04-18T09:00:00Z',
    },
    {
      id: '2', symbol: 'TLKM', type: 'SELL', confidence: 71.8,
      price: 3450, targetPrice: 3100, stopLoss: 3620, riskRewardRatio: 2.06,
      reason: 'RSI overbought + resistance level', status: 'active',
      indicators: { rsi: 72.1, ma20: 3380, ma50: 3250, atr: 105 },
      generatedAt: '2026-04-18T09:00:00Z',
    },
    {
      id: '3', symbol: 'ASII', type: 'SKIP', confidence: 38.2,
      price: 4680, reason: 'Low confidence — mixed signals',
      indicators: { rsi: 51.3, ma20: 4660, ma50: 4590, atr: 152 },
      generatedAt: '2026-04-18T09:00:00Z',
    },
    {
      id: '4', symbol: 'BMRI', type: 'BUY', confidence: 65.9,
      price: 6100, targetPrice: 6700, stopLoss: 5800, riskRewardRatio: 2.0,
      reason: 'Doji + support bounce + low ATR', status: 'active',
      indicators: { rsi: 39.8, ma20: 6050, ma50: 5950, atr: 192 },
      generatedAt: '2026-04-18T09:00:00Z',
    },
    {
      id: '5', symbol: 'UNVR', type: 'BUY', confidence: 78.3,
      price: 2240, targetPrice: 2420, stopLoss: 2140, riskRewardRatio: 1.8,
      reason: 'Intraday RSI recovery + VWAP support', status: 'active',
      indicators: { rsi: 32.4, ma20: 2220, ma50: 2185, atr: 42 },
      generatedAt: '2026-04-18T09:15:00Z',
    },
    {
      id: '6', symbol: 'GOTO', type: 'BUY', confidence: 91.2,
      price: 54, targetPrice: 68, stopLoss: 48, riskRewardRatio: 2.33,
      reason: 'Volume spike + breakout above resistance', status: 'active',
      indicators: { rsi: 28.7, ma20: 50, ma50: 46, atr: 4.2 },
      generatedAt: '2026-04-18T09:00:00Z',
    },
    {
      id: '7', symbol: 'BBRI', type: 'SKIP', confidence: 44.1,
      price: 4320, reason: 'RSI neutral range — wait for confirmation',
      indicators: { rsi: 50.1, ma20: 4300, ma50: 4280, atr: 138 },
      generatedAt: '2026-04-17T09:00:00Z',
    },
    {
      id: '8', symbol: 'HMSP', type: 'SELL', confidence: 83.7,
      price: 1085, targetPrice: 980, stopLoss: 1140, riskRewardRatio: 1.91,
      reason: 'Death cross MA20/MA50 + RSI declining', status: 'active',
      indicators: { rsi: 68.4, ma20: 1095, ma50: 1110, atr: 28 },
      generatedAt: '2026-04-17T09:00:00Z',
    },
  ],
  total: 8,
  page: 1,
  pageSize: 20,
  totalPages: 1,
}
