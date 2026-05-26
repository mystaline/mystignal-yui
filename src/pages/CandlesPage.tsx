import { useState, useEffect } from 'react'
import { AnimatedChartContainer } from '@/motion/AnimatedChartContainer'
import { CandlestickChart } from '@/components/charts/CandlestickChart'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { useCandles } from '@/hooks/useCandles'
import { useStocks } from '@/hooks/useStocks'
import { useStaggerReady } from '@/hooks/useStaggerReady'

const TIMEFRAMES = ['1d', '15m', '30m', '5m']

export default function CandlesPage() {
  const [symbol, setSymbol]     = useState('')
  const [timeframe, setTimeframe] = useState('1d')
  const [search, setSearch]     = useState('')

  const { data: stocksData, isLoading: stocksLoading } = useStocks()
  const { data, isLoading, isError, refetch } = useCandles(symbol, timeframe)
  const chartReady = useStaggerReady(!isLoading && !!data)

  useEffect(() => {
    if (stocksData?.data[0] && !symbol) {
      setSymbol(stocksData.data[0].symbol)
    }
  }, [stocksData, symbol])

  const filteredStocks = (stocksData?.data ?? []).filter(s =>
    s.symbol.includes(search.toUpperCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Page header */}
      <div className="pg-head" style={{ flexShrink: 0 }}>
        <div>
          <div className="eyebrow">OHLCV chart explorer</div>
          <h1>Candles<em>.</em></h1>
        </div>
      </div>

      {/* Split layout */}
      <div className="candle-layout" style={{ flex: 1, minHeight: 0 }}>
        {/* Stock list */}
        <div className="stock-list">
          <div className="stock-list-search">
            <input
              type="text"
              placeholder="Filter…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {stocksLoading && <div style={{ padding: '1rem' }}><LoadingState rows={8} /></div>}
          {filteredStocks.map(s => (
            <div
              key={s.symbol}
              className={`stock-item${symbol === s.symbol ? ' active' : ''}`}
              onClick={() => setSymbol(s.symbol)}
            >
              <div className="sym">{s.symbol}</div>
              {s.name && <div className="name">{s.name}</div>}
            </div>
          ))}
        </div>

        {/* Chart panel */}
        <div className="candle-chart-panel">
          {/* Toolbar */}
          <div className="candle-chart-toolbar">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--display)', fontSize: '2.5rem', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {symbol || '—'}<em style={{ color: 'var(--accent)' }}>.</em>
              </span>
              {data && (
                <span className="eyebrow" style={{ paddingBottom: '0.375rem' }}>{data.count} candles</span>
              )}
            </div>
            <div className="seg">
              {TIMEFRAMES.map(tf => (
                <button key={tf} className={timeframe === tf ? 'active' : ''} onClick={() => setTimeframe(tf)}>
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div style={{ flex: 1, padding: '1.25rem 1.5rem', minHeight: 0 }}>
            {isLoading && <LoadingState rows={1} height="h-96" />}
            {isError && <ErrorState message={`Failed to load ${symbol}`} onRetry={refetch} />}
            {data && (
              <AnimatedChartContainer isReady={chartReady}>
                <CandlestickChart data={data.data} height={460} />
              </AnimatedChartContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
