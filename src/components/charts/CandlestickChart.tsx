import { useEffect, useRef } from 'react'
import { createChart, ColorType, type IChartApi, type ISeriesApi } from 'lightweight-charts'
import type { CandleResponse } from '@/types/candle'

interface CandlestickChartProps {
  data: CandleResponse[]
  height?: number
  buyMarkers?: { time: string; price: number }[]
  sellMarkers?: { time: string; price: number }[]
}

export function CandlestickChart({ data, height = 400, buyMarkers = [], sellMarkers = [] }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<ISeriesApi<'Candlestick', any> | null>(null)

  // Mount effect: create chart and attach resize listener
  useEffect(() => {
    if (!containerRef.current) return

    chartRef.current = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6b7280',
      },
      grid: {
        vertLines: { color: 'rgba(35,38,45,0.8)' },
        horzLines: { color: 'rgba(35,38,45,0.8)' },
      },
      rightPriceScale: {
        borderColor: '#23262d',
      },
      timeScale: {
        borderColor: '#23262d',
        timeVisible: true,
      },
      crosshair: {
        vertLine: { color: 'rgba(198,255,61,0.4)', style: 1 },
        horzLine: { color: 'rgba(198,255,61,0.4)', style: 1 },
      },
      handleScroll: true,
      handleScale: true,
      height,
    })

    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor:        '#6cf09e',
      downColor:      '#ff6a7d',
      borderUpColor:  '#6cf09e',
      borderDownColor:'#ff6a7d',
      wickUpColor:    '#6cf09e',
      wickDownColor:  '#ff6a7d',
    })

    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chartRef.current?.remove()
    }
  }, [height])

  // Data update effect: update data and markers without recreating chart
  useEffect(() => {
    if (!seriesRef.current) return

    const chartData = data.map(c => ({
      time: Math.floor(new Date(c.timestamp).getTime() / 1000) as unknown as `${number}-${number}-${number}`,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }))

    seriesRef.current.setData(chartData)

    const markers = [
      ...buyMarkers.map(m => ({
        time: Math.floor(new Date(m.time).getTime() / 1000) as unknown as `${number}-${number}-${number}`,
        position: 'belowBar' as const,
        color: '#6cf09e',
        shape: 'arrowUp' as const,
        text: 'BUY',
        size: 1,
      })),
      ...sellMarkers.map(m => ({
        time: Math.floor(new Date(m.time).getTime() / 1000) as unknown as `${number}-${number}-${number}`,
        position: 'aboveBar' as const,
        color: '#ff6a7d',
        shape: 'arrowDown' as const,
        text: 'SELL',
        size: 1,
      })),
    ].sort((a, b) => (a.time > b.time ? 1 : -1))

    if (markers.length > 0) {
      seriesRef.current.setMarkers(markers)
    }

    chartRef.current?.timeScale().fitContent()
  }, [data, buyMarkers, sellMarkers])

  return <div ref={containerRef} className="w-full" style={{ height }} />
}
