import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getLiveKey } from "@/lib/api/client";
import { useBacktests } from "@/hooks/useBacktests";
import { usePublicBacktests } from "@/hooks/usePublicBacktests";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { formatNumber, formatDate } from "@/lib/utils";
import { deletePublicBacktest } from "@/lib/idb";
import { queryKeys } from "@/lib/query-keys";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { BacktestListItem } from "@/types/backtest";

const TIMEFRAMES = ["All", "5m", "15m", "1h", "4h", "1d"];


function Sparkline({
  profitPct,
  featured,
}: {
  profitPct: number;
  featured?: boolean;
}) {
  const w = featured ? 220 : 150;
  const h = featured ? 40 : 28;
  const points = Array.from({ length: featured ? 32 : 20 }, (_, i) => {
    const t = i / ((featured ? 32 : 20) - 1);
    const noise = Math.sin(i * 2.7 + profitPct) * 0.06;
    return (
      w * t + "," + (h - ((t * profitPct) / 100 + noise) * h * 0.7 - h * 0.15)
    );
  }).join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: "block" }}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={featured ? 1.75 : 1.25}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ManualRow({
  b,
  featured,
  onNavigate,
}: {
  b: BacktestListItem;
  featured?: boolean;
  onNavigate: (id: string) => void;
}) {
  const up = b.profitPercentage >= 0;
  return (
    <div
      className={`bt-row${featured ? " featured" : ""}`}
      onClick={() => onNavigate(b.id)}
    >
      <div className="name">
        <span className="t">{b.strategyName}</span>
        <span className="s">
          Run #{b.id} · {formatDate(b.startDate)} → {formatDate(b.endDate)}
        </span>
      </div>
      <span className="tf">{b.timeframe}</span>
      <div className="spark">
        <Sparkline profitPct={b.profitPercentage} featured={featured} />
      </div>
      <div className={`roi-val ${up ? "up" : "down"}`}>
        {up ? "+" : ""}
        {b.profitPercentage.toFixed(featured ? 1 : 2)}
        <span
          style={{
            fontSize: "0.55em",
            color: "var(--ink-2)",
            fontStyle: "italic",
          }}
        >
          %
        </span>
      </div>
      <div className="metric">
        <span className="k">Win</span>
        {b.winRate.toFixed(1)}%
      </div>
      <div className="metric">
        <span className="k">Sharpe</span>
        {formatNumber(b.sharpeRatio)}
      </div>
      <div className="metric">
        <span className="k">Max DD</span>−{b.maxDrawdown.toFixed(1)}%
      </div>
      <div className="metric">
        <span className="k">Trades</span>
        {b.totalTrades}
      </div>
      <div className="arrow">→</div>
    </div>
  );
}

function GridRow({
  b,
  rank,
  onNavigate,
}: {
  b: BacktestListItem;
  rank: number;
  onNavigate: (id: string) => void;
}) {
  const up = b.profitPercentage >= 0;
  const p = b.workflowParams ?? {};
  const atrPct =
    p.minATRPct != null
      ? (p.minATRPct * 100).toFixed(1) + "%"
      : p.useATRFilter
        ? "1.2%"
        : "—";
  const capPct =
    p.monthlyProfitCapPct != null
      ? (p.monthlyProfitCapPct * 100).toFixed(0) + "%"
      : "0%";
  const index = p.compositeIndex || "none";
  const timing =
    p.entryTiming === "prev_close_next_open"
      ? "prev↗"
      : p.entryTiming === "next_day_open"
        ? "next↗"
        : (p.entryTiming ?? "—");

  return (
    <div className="gs-row with-params" onClick={() => onNavigate(b.id)}>
      <div className={`gs-rank ${rank <= 3 ? "top" : ""}`}>#{rank}</div>
      <div className="gs-date">
        {formatDate(b.startDate)} → {formatDate(b.endDate)}
      </div>
      <div className={`gs-roi ${up ? "up" : "down"}`}>
        {up ? "+" : ""}
        {b.profitPercentage.toFixed(1)}%
      </div>
      <div className="gs-params">
          <span className="gs-tag">ATR {atrPct}</span>
          <span className="gs-tag">Cap {capPct}</span>
          <span className="gs-tag">{index}</span>
          <span className="gs-tag">{timing}</span>
        </div>
      <div className="gs-metrics">
        <span>
          <span className="k">WR</span>
          {b.winRate.toFixed(1)}%
        </span>
        <span>
          <span className="k">PF</span>
          {b.profitFactor?.toFixed(2) ?? "—"}
        </span>
        <span>
          <span className="k">T</span>
          {b.totalTrades}
        </span>
      </div>
      <div className="arrow">→</div>
    </div>
  );
}

type Tab = "manual" | "grid_search";

export default function BacktestListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authed = !!getLiveKey();

  function handleDeletePublic(e: React.MouseEvent, workflowId: string) {
    e.stopPropagation();
    setConfirmDelete(workflowId);
  }

  async function confirmDeletePublic() {
    if (!confirmDelete) return;
    await deletePublicBacktest(confirmDelete);
    queryClient.invalidateQueries({ queryKey: queryKeys.publicBacktests.list });
    setConfirmDelete(null);
  }
  const [tab, setTab] = useState<Tab>("manual");
  const [page, setPage] = useState(1);
  const [tf, setTf] = useState("All");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // workflowId to delete
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const { data, isLoading, isError, refetch } = useBacktests(page, 20, tab);
  const { data: idbItems = [], isLoading: idbLoading } = usePublicBacktests();

  const items = data?.data ?? [];
  const filtered =
    tf === "All" || tab === "grid_search"
      ? items
      : items.filter((b) => b.timeframe === tf);

  // Manual tab: first item is featured
  const featured = tab === "manual" ? filtered[0] : undefined;
  const rest = tab === "manual" ? filtered.slice(1) : filtered;

  const avgROI = items.length
    ? items.reduce((s, b) => s + b.profitPercentage, 0) / items.length
    : 0;
  const bestROI = items.length
    ? Math.max(...items.map((b) => b.profitPercentage))
    : 0;
  const avgSharpe = items.length
    ? items.reduce((s, b) => s + b.sharpeRatio, 0) / items.length
    : 0;
  const avgWR = items.length
    ? items.reduce((s, b) => s + b.winRate, 0) / items.length
    : 0;
  const bestPF = items.length
    ? Math.max(...items.map((b) => b.profitFactor ?? 0))
    : 0;


  const handleTabChange = (t: Tab) => {
    setTab(t);
    setPage(1);
  };

  async function confirmClearAllPublic() {
    await Promise.all(idbItems.map((item) => deletePublicBacktest(item.workflowId)));
    queryClient.invalidateQueries({ queryKey: queryKeys.publicBacktests.list });
    setConfirmClearAll(false);
  }

  if (!authed) {
    return (
      <div>
        <div className="pg-head">
          <div>
            <div className="eyebrow">Saved in this browser · {idbItems.length} run{idbItems.length !== 1 ? "s" : ""}</div>
            <h1>Backtests<em>.</em></h1>
          </div>
          <div className="pg-actions">
            {idbItems.length > 0 && (
              <button
                className="btn"
                onClick={() => setConfirmClearAll(true)}
                style={{ color: "var(--down)", borderColor: "rgba(239,68,68,.3)" }}
              >
                Clear All
              </button>
            )}
            <button className="btn" onClick={() => navigate("/backtests/run")}>+ New Run</button>
          </div>
        </div>
        {idbLoading && <div style={{ padding: "2.5rem" }}><LoadingState rows={4} height="h-14" /></div>}
        {!idbLoading && idbItems.length === 0 && (
          <div style={{ padding: "3.75rem 2.5rem", color: "var(--ink-3)", fontFamily: "var(--mono)", fontSize: '0.875rem' }}>
            No saved backtests. Run a backtest to see results here.
          </div>
        )}
        {!idbLoading && idbItems.length > 0 && (
          <div className="bt-list">
            {idbItems.map(item => {
              const up = item.roiPct >= 0;
              return (
                <div key={item.workflowId} className="bt-row"
                     onClick={() => navigate(`/backtests/public/${item.workflowId}`)}>
                  <div className="name">
                    <span className="t">Run {item.workflowId.slice(-12)}</span>
                    <span className="s">{formatDate(item.startDate)} → {formatDate(item.endDate)}</span>
                    <div style={{ display: "flex", gap: '0.25rem', flexWrap: "wrap", marginTop: '0.375rem' }}>
                      {[
                        item.signalParams?.compositeIndex
                          ? item.signalParams.compositeIndex.replace('^', '')
                          : 'no index',
                        item.signalParams?.entryTiming === 'prev_close_next_open' ? 'prev↗'
                          : item.signalParams?.entryTiming === 'next_day_open' ? 'next↗'
                          : item.signalParams?.entryTiming ?? 'next↗',
                        item.strategyConfig ? `hold ${item.strategyConfig.holdDays}d` : null,
                        item.strategyConfig?.useTrailingStop ? `trail ${item.strategyConfig.trailingStopPct}%` : null,
                        item.signalParams ? `conf ${item.signalParams.minConfidence}%` : null,
                      ].filter(Boolean).map(tag => (
                        <span key={tag} style={{
                          fontFamily: "var(--mono)", fontSize: '0.5625rem', fontWeight: 600,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          padding: "0.125rem 0.375rem", borderRadius: '0.25rem',
                          background: "var(--bg-3)", border: "1px solid var(--line-strong)",
                          color: "var(--ink-3)",
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="spark">
                    <Sparkline profitPct={item.roiPct} />
                  </div>
                  <div className={`roi-val ${up ? "up" : "down"}`}>
                    {up ? "+" : ""}{item.roiPct.toFixed(2)}
                    <span style={{ fontSize: "0.55em", color: "var(--ink-2)", fontStyle: "italic" }}>%</span>
                  </div>
                  <div className="metric"><span className="k">Win</span>{item.winRatePct.toFixed(1)}%</div>
                  <div className="metric"><span className="k">Sharpe</span>{formatNumber(item.sharpeRatio)}</div>
                  <div className="metric"><span className="k">Max DD</span>−{item.maxDrawdownPct.toFixed(1)}%</div>
                  <div className="metric"><span className="k">Trades</span>{item.totalTrades}</div>
                  <div
                    className="row-del"
                    onClick={(e) => handleDeletePublic(e, item.workflowId)}
                    title="Delete from browser storage"
                  >
                    ×
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <ConfirmDialog
          open={confirmDelete !== null}
          title="Delete this backtest?"
          message="This run will be removed from your browser storage and can't be recovered."
          confirmLabel="Delete"
          danger
          onConfirm={confirmDeletePublic}
          onCancel={() => setConfirmDelete(null)}
        />
        <ConfirmDialog
          open={confirmClearAll}
          title={`Clear all ${idbItems.length} backtests?`}
          message="All saved runs will be permanently removed from your browser. This cannot be undone."
          confirmLabel="Clear All"
          danger
          onConfirm={confirmClearAllPublic}
          onCancel={() => setConfirmClearAll(false)}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="pg-head">
        <div>
          <div className="eyebrow">
            Strategy library · {data?.total ?? "—"} runs
          </div>
          <h1>
            Backtests<em>.</em>
          </h1>
        </div>
        <div className="pg-actions">
          <button className="btn" onClick={() => navigate("/backtests/run")}>
            + New Run
          </button>
        </div>
      </div>

      {/* Aggregate strip — adapts per tab */}
      {data && (
        <div className="agg-strip">
          <div className="c">
            <div className="l">
              {tab === "grid_search" ? "Combos" : "Total Runs"}
            </div>
            <div className="v">{data.total}</div>
          </div>
          <div className="c">
            <div className="l">
              {tab === "grid_search" ? "Best ROI" : "Average ROI"}
            </div>
            <div
              className="v"
              style={{
                color:
                  tab === "grid_search"
                    ? "var(--accent)"
                    : avgROI >= 0
                      ? "var(--up)"
                      : "var(--down)",
              }}
            >
              {tab === "grid_search" ? (
                <>
                  {bestROI >= 0 ? "+" : ""}
                  {bestROI.toFixed(1)}
                  <span style={{ fontSize: '1.125rem', color: "var(--ink-2)" }}>%</span>
                </>
              ) : (
                <>
                  {avgROI >= 0 ? "+" : ""}
                  {avgROI.toFixed(1)}
                  <span style={{ fontSize: '1.125rem', color: "var(--ink-2)" }}>%</span>
                </>
              )}
            </div>
          </div>
          <div className="c">
            <div className="l">
              {tab === "grid_search" ? "Avg Win Rate" : "Best ROI"}
            </div>
            <div
              className="v"
              style={{
                color: tab === "grid_search" ? "var(--ink-1)" : "var(--accent)",
              }}
            >
              {tab === "grid_search" ? (
                <>
                  {avgWR.toFixed(1)}
                  <span style={{ fontSize: '1.125rem', color: "var(--ink-2)" }}>%</span>
                </>
              ) : (
                <>
                  {bestROI >= 0 ? "+" : ""}
                  {bestROI.toFixed(1)}
                  <span style={{ fontSize: '1.125rem', color: "var(--ink-2)" }}>%</span>
                </>
              )}
            </div>
          </div>
          <div className="c">
            <div className="l">
              {tab === "grid_search" ? "Best PF" : "Mean Sharpe"}
            </div>
            <div className="v">
              {tab === "grid_search" ? bestPF.toFixed(2) : avgSharpe.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        className="tab-row"
        style={{ padding: "0 2.5rem", borderBottom: "1px solid var(--line)" }}
      >
        <button
          className={`tb${tab === "manual" ? " active" : ""}`}
          onClick={() => handleTabChange("manual")}
        >
          Manual Runs
        </button>
        {getLiveKey() && (
          <button
            className={`tb${tab === "grid_search" ? " active" : ""}`}
            onClick={() => handleTabChange("grid_search")}
          >
            Grid Search
          </button>
        )}
      </div>

      {/* Timeframe filter — only for manual tab */}
      {tab === "manual" && (
        <div className="bt-filter">
          <div className="seg">
            {TIMEFRAMES.map((t) => (
              <button
                key={t}
                className={tf === t ? "active" : ""}
                onClick={() => setTf(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading && (
        <div style={{ padding: "2.5rem" }}>
          <LoadingState rows={8} height="h-14" />
        </div>
      )}
      {isError && (
        <div style={{ padding: "2.5rem" }}>
          <ErrorState message="Failed to load backtests" onRetry={refetch} />
        </div>
      )}

      {data && filtered.length === 0 && (
        <div
          style={{
            padding: "3.75rem 2.5rem",
            color: "var(--ink-3)",
            fontFamily: "var(--mono)",
            fontSize: '0.875rem',
          }}
        >
          No backtests found.
        </div>
      )}

      {/* Manual tab */}
      {data && tab === "manual" && filtered.length > 0 && (
        <div className="bt-list">
          {featured && (
            <ManualRow
              b={featured}
              featured
              onNavigate={(id) => navigate(`/backtests/${id}`)}
            />
          )}
          {rest.map((b) => (
            <ManualRow
              key={b.id}
              b={b}
              onNavigate={(id) => navigate(`/backtests/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Grid search tab */}
      {data && tab === "grid_search" && filtered.length > 0 && (
        <div className="gs-list">
          <div className="gs-header with-params">
            <span>Rank</span>
            <span>Period</span>
            <span>ROI</span>
            <span>Parameters</span>
            <span>WR / PF / Trades</span>
            <span />
          </div>
          {filtered.map((b, i) => (
            <GridRow
              key={b.id}
              b={b}
              rank={i + 1}
              onNavigate={(id) => navigate(`/backtests/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div
          style={{ padding: "1rem 2.5rem", borderTop: "1px solid var(--line)" }}
        >
          <Pagination
            page={page}
            totalPages={data.totalPages}
            total={data.total}
            pageSize={20}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
