import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatedChartContainer } from '@/motion/AnimatedChartContainer'
import { EquityCurve } from '@/components/charts/EquityCurve'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { TradeStatusBadge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { useBacktestDetail } from '@/hooks/useBacktestDetail'
import { useBacktestTrades, TRADES_PAGE_SIZE } from '@/hooks/useBacktestTrades'
import { useStaggerReady } from '@/hooks/useStaggerReady'
import { formatIDR, formatPct, formatNumber, formatDate, formatDateTime } from '@/lib/utils'
import { type TradeFilter, TRADE_FILTER_META } from '@/types/backtest'

const TABS = ['Overview', 'Equity', 'Trades'] as const
type Tab = typeof TABS[number]
const MS_PER_DAY = 1000 * 60 * 60 * 24

function PnlCell({ amount, pct, isOpen, className }: { amount: number; pct: number; isOpen: boolean; className?: string }) {
  const profit = pct >= 0
  const colorCls = isOpen ? '' : profit ? 'up' : 'down'
  const sign = profit ? '+' : '−'
  return (
    <>
      <td className={`num ${colorCls} ${className ?? ''}`}>
        {isOpen ? <span className="dim">~{sign}{formatIDR(Math.abs(amount))}</span> : <>{sign}{formatIDR(Math.abs(amount))}</>}
      </td>
      <td className={`num ${colorCls}`}>
        {isOpen ? <span className="dim">~{formatPct(pct, true)}</span> : formatPct(pct, true)}
      </td>
    </>
  )
}

export default function BacktestDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('Overview')
  const [tradePage, setTradePage] = useState(1)
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>('all')

  const { data: detail, isLoading, isError, refetch } = useBacktestDetail(id)
  const { data: tradesData, isLoading: tradesLoading } = useBacktestTrades(id, tradePage, TRADES_PAGE_SIZE, tradeFilter)
  const chartReady = useStaggerReady(!isLoading && !!detail)

  if (isLoading) return <div style={{ padding: 40 }}><LoadingState rows={8} /></div>
  if (isError || !detail) return <div style={{ padding: 40 }}><ErrorState message="Backtest not found" onRetry={refetch} /></div>

  const m = detail.metadata
  const a = detail.aggregate
  const up = a.roiPct >= 0

  return (
    <div>
      {/* Page header */}
      <div className="pg-head">
        <div>
          <div className="eyebrow" style={{ cursor: 'pointer' }} onClick={() => navigate('/backtests')}>
            ← Backtests · Run #{m.id}
          </div>
        </div>
        <div className="pg-actions">
          <button className="btn" onClick={() => navigate('/backtests/run')}>+ New Run</button>
        </div>
      </div>

      {/* Detail hero */}
      <div className="detail-hero">
        <div className="title-block">
          <div className="eyebrow">Strategy · {m.timeframe} · ISSI</div>
          <h2>{m.strategy}<em>.</em></h2>
          <p className="dek">
            Run from {formatDate(m.startDate)} through {formatDate(m.endDate)},
            starting with {formatIDR(a.initialCapital)} of simulated capital over {a.totalTrades} trades.
          </p>
          <div className="chips">
            <span className="chip">{m.timeframe.toUpperCase()}</span>
            <span className="chip">ISSI Universe</span>
          </div>
        </div>
        <div className="roi-stat">
          <div className="eyebrow">Return on Capital</div>
          <div className={`big ${up ? 'up' : 'down'}`}>
            {up ? '+' : ''}{a.roiPct.toFixed(1)}<em>%</em>
          </div>
          <div className="sub">{formatIDR(a.totalInvested)} invested → <strong>{formatIDR(a.finalCapital)}</strong></div>
          <div className="cap">Net P&L {a.netProfit >= 0 ? '+' : ''}{formatIDR(a.netProfit)}</div>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-row">
        <div className="k good">
          <div className="l">Win Rate</div>
          <div className="v">{a.winRatePct.toFixed(1)}%</div>
          <div className="minibar"><div className="f" style={{ width: `${a.winRatePct}%` }} /></div>
          <div className="s">{a.winningTrades}W · {a.losingTrades}L</div>
        </div>
        <div className="k good">
          <div className="l">Profit Factor</div>
          <div className="v">{formatNumber(a.profitFactor)}</div>
          <div className="minibar"><div className="f" style={{ width: `${Math.min(100, a.profitFactor * 30)}%` }} /></div>
          <div className="s">Gross win ÷ loss</div>
        </div>
        <div className="k">
          <div className="l">Sharpe</div>
          <div className="v">{formatNumber(a.sharpeRatio)}</div>
          <div className="minibar"><div className="f" style={{ width: `${Math.min(100, a.sharpeRatio * 30)}%` }} /></div>
          <div className="s">Risk-adjusted</div>
        </div>
        <div className="k bad">
          <div className="l">Max Drawdown</div>
          <div className="v">−{a.maxDrawdownPct.toFixed(1)}%</div>
          <div className="minibar"><div className="f" style={{ width: `${Math.min(100, a.maxDrawdownPct * 2)}%` }} /></div>
          <div className="s">Peak → trough</div>
        </div>
        <div className="k">
          <div className="l">Avg Win</div>
          <div className="v" style={{ color: 'var(--up)', fontSize: 22 }}>{formatIDR(a.avgWin)}</div>
          <div className="s">Best {formatIDR(a.largestWin)}</div>
        </div>
        <div className="k">
          <div className="l">Avg Loss</div>
          <div className="v" style={{ color: 'var(--down)', fontSize: 22 }}>{formatIDR(Math.abs(a.avgLoss))}</div>
          <div className="s">Worst {formatIDR(Math.abs(a.largestLoss))}</div>
        </div>
      </div>

      {/* Tab row */}
      <div className="tab-row">
        {TABS.map(t => (
          <button key={t} className={`tb${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* Overview tab */}
      {(tab === 'Overview' || tab === 'Equity') && (
        <div className="neon-content" style={{ gridTemplateColumns: '1fr' }}>
          <div className="neon-card">
            <h4>
              Capital Growth
              <span className="r">{formatDate(m.startDate)} → {formatDate(m.endDate)}</span>
            </h4>
            <AnimatedChartContainer isReady={chartReady}>
              <EquityCurve data={detail.capitalHistory} height={tab === 'Equity' ? 400 : 260} />
            </AnimatedChartContainer>
          </div>
        </div>
      )}


      {/* Trades table — shown on Overview (preview) and Trades tab */}
      {(tab === 'Overview' || tab === 'Trades') && (
        <div className="trade-table-wrap">
          <h3>
            {tab === 'Overview' ? 'Recent trades' : TRADE_FILTER_META[tradeFilter].label}
            <em>{tab === 'Overview' ? `${Math.min(8, detail.trades.length)} entries` : `${tradesData?.total ?? '…'} entries`}</em>
          </h3>
          {tab === 'Trades' && (
            <div className="sub-tab-row">
              {(Object.keys(TRADE_FILTER_META) as TradeFilter[]).map(f => (
                <button
                  key={f}
                  className={`sub-tb${tradeFilter === f ? ' active' : ''}`}
                  onClick={() => { setTradeFilter(f); setTradePage(1) }}
                >
                  {TRADE_FILTER_META[f].tabLabel}
                </button>
              ))}
            </div>
          )}

          {tab === 'Overview' ? (
            /* Inline preview — condensed 7-col view */
            <table className="tt">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>№</th>
                  <th>Symbol</th>
                  <th>Entry Time</th>
                  <th className="num">Lot</th>
                  <th className="num">P&L</th>
                  <th className="num">%</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.trades.slice(0, 8).map((t, i) => {
                  const isOpen = t.status === 'holding'
                  return (
                    <tr key={t.id}>
                      <td className="dim">{String(i + 1).padStart(2, '0')}</td>
                      <td className="sym">{t.symbol}</td>
                      <td className="dim mono" style={{ fontSize: 11 }}>{formatDateTime(t.entryTime)}</td>
                      <td className="num dim">{t.lot}</td>
                      <PnlCell amount={t.profitAmount} pct={t.profitPercentage} isOpen={isOpen} />
                      <td><TradeStatusBadge status={t.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            /* Paginated trades */
            tradesLoading ? <LoadingState rows={10} /> : tradesData ? (
              <>
                <div style={{ overflowX: 'auto' }}><table className="tt">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>№</th>
                      <th>Symbol</th>
                      <th>Lot</th>
                      <th>Entry Time</th>
                      <th>Exit Time</th>
                      <th className="num">Entry Px</th>
                      <th className="num">Exit Px</th>
                      <th className="num">Target</th>
                      <th className="num">SL</th>
                      <th className="num">P&L</th>
                      <th className="num">%</th>
                      <th className="num">Mkt Days</th>
                      <th className="num">Cal Days</th>
                      <th className="num">Conf.</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradesData.data.map((t, i) => {
                      const isOpen = t.status === 'holding'
                      const mktDays = Math.round(t.holdDurationMinutes / 1440)
                      const calDays = t.exitTime
                        ? Math.round((new Date(t.exitTime).getTime() - new Date(t.entryTime).getTime()) / MS_PER_DAY)
                        : null
                      return (
                        <tr key={t.id}>
                          <td className="dim">{String((tradePage - 1) * TRADES_PAGE_SIZE + i + 1).padStart(2, '0')}</td>
                          <td className="sym">{t.symbol}</td>
                          <td className="num dim">{t.lot}L</td>
                          <td className="dim mono" style={{ fontSize: 11 }}>{formatDateTime(t.entryTime)}</td>
                          <td className="dim mono" style={{ fontSize: 11 }}>{t.exitTime ? formatDateTime(t.exitTime) : '—'}</td>
                          <td className="num dim">{formatIDR(t.entryPrice)}</td>
                          <td className="num dim">{isOpen ? <span className="dim">MTM {formatIDR(t.exitPrice)}</span> : formatIDR(t.exitPrice)}</td>
                          <td className="num" style={{ color: 'var(--up)', opacity: 0.7 }}>{formatIDR(t.targetPrice)}</td>
                          <td className="num" style={{ color: 'var(--down)', opacity: 0.7 }}>{formatIDR(t.stopLoss)}</td>
                          <PnlCell amount={t.profitAmount} pct={t.profitPercentage} isOpen={isOpen} />
                          <td className="num dim">{mktDays}d</td>
                          <td className="num dim">{calDays !== null ? `${calDays}d` : '—'}</td>
                          <td className="num dim">{t.confidence.toFixed(0)}%</td>
                          <td className="dim" style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.reason}>{t.reason || '—'}</td>
                          <td><TradeStatusBadge status={t.status} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table></div>
                {tradesData.totalPages > 1 && (
                  <div style={{ marginTop: 16 }}>
                    <Pagination page={tradePage} totalPages={tradesData.totalPages} total={tradesData.total} pageSize={TRADES_PAGE_SIZE} onPageChange={setTradePage} />
                  </div>
                )}
              </>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
