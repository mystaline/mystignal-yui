import { useEffect, useRef } from 'react'
import { createChart, ColorType, type IChartApi } from 'lightweight-charts'
import type { CapitalPoint } from '@/types/backtest'

interface EquityCurveProps {
  data: CapitalPoint[]
  height?: number
}

export function EquityCurve({ data, height = 240 }: EquityCurveProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null)

  // Mount effect: create chart and attach resize listener
  useEffect(() => {
    if (!containerRef.current) return

    chartRef.current = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
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
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#23262d',
        timeVisible: false,
      },
      crosshair: {
        vertLine: { color: 'rgba(198,255,61,0.4)', style: 1 },
        horzLine: { color: 'rgba(198,255,61,0.4)', style: 1 },
      },
      handleScroll: true,
      handleScale: true,
      height,
    })

    seriesRef.current = chartRef.current.addAreaSeries({
      lineColor: '#c6ff3d',
      topColor: 'rgba(198,255,61,0.18)',
      bottomColor: 'rgba(198,255,61,0.0)',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 4,
      crosshairMarkerBorderColor: '#c6ff3d',
      crosshairMarkerBackgroundColor: '#16181c',
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

  // Data update effect: update chart data without recreating chart
  useEffect(() => {
    if (!seriesRef.current) return

    // Deduplicate by date (keep last value) then sort ascending — lightweight-charts requires strict asc order.
    const seen = new Map<string, number>()
    for (const p of data) seen.set(p.date, p.capital)
    const chartData = Array.from(seen.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([date, capital]) => ({
        time: date as `${number}-${number}-${number}`,
        value: capital,
      }))

    seriesRef.current.setData(chartData)
    chartRef.current?.timeScale().fitContent()
  }, [data])

  return <div ref={containerRef} className="w-full" style={{ height }} />
}
