import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api/client";
import { useBacktests } from "@/hooks/useBacktests";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Pagination } from "@/components/ui/Pagination";
import { formatNumber, formatDate } from "@/lib/utils";
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
  showParams,
  onNavigate,
}: {
  b: BacktestListItem;
  rank: number;
  showParams: boolean;
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
    <div className={`gs-row${showParams ? " with-params" : ""}`} onClick={() => onNavigate(b.id)}>
      <div className={`gs-rank ${rank <= 3 ? "top" : ""}`}>#{rank}</div>
      <div className="gs-date">
        {formatDate(b.startDate)} → {formatDate(b.endDate)}
      </div>
      <div className={`gs-roi ${up ? "up" : "down"}`}>
        {up ? "+" : ""}
        {b.profitPercentage.toFixed(1)}%
      </div>
      {showParams && (
        <div className="gs-params">
          <span className="gs-tag">ATR {atrPct}</span>
          <span className="gs-tag">Cap {capPct}</span>
          <span className="gs-tag">{index}</span>
          <span className="gs-tag">{timing}</span>
        </div>
      )}
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
  const [tab, setTab] = useState<Tab>("manual");
  const [page, setPage] = useState(1);
  const [tf, setTf] = useState("All");

  const { data, isLoading, isError, refetch } = useBacktests(page, 20, tab);

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

  const showParams = !apiClient.useMock;

  const handleTabChange = (t: Tab) => {
    setTab(t);
    setPage(1);
  };

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
                  <span style={{ fontSize: 18, color: "var(--ink-2)" }}>%</span>
                </>
              ) : (
                <>
                  {avgROI >= 0 ? "+" : ""}
                  {avgROI.toFixed(1)}
                  <span style={{ fontSize: 18, color: "var(--ink-2)" }}>%</span>
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
                  <span style={{ fontSize: 18, color: "var(--ink-2)" }}>%</span>
                </>
              ) : (
                <>
                  {bestROI >= 0 ? "+" : ""}
                  {bestROI.toFixed(1)}
                  <span style={{ fontSize: 18, color: "var(--ink-2)" }}>%</span>
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
        style={{ padding: "0 40px", borderBottom: "1px solid var(--line)" }}
      >
        <button
          className={`tb${tab === "manual" ? " active" : ""}`}
          onClick={() => handleTabChange("manual")}
        >
          Manual Runs
        </button>
        <button
          className={`tb${tab === "grid_search" ? " active" : ""}`}
          onClick={() => handleTabChange("grid_search")}
        >
          Grid Search
        </button>
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
        <div style={{ padding: "40px" }}>
          <LoadingState rows={8} height="h-14" />
        </div>
      )}
      {isError && (
        <div style={{ padding: "40px" }}>
          <ErrorState message="Failed to load backtests" onRetry={refetch} />
        </div>
      )}

      {data && filtered.length === 0 && (
        <div
          style={{
            padding: "60px 40px",
            color: "var(--ink-3)",
            fontFamily: "var(--mono)",
            fontSize: 14,
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
          <div className={`gs-header${showParams ? " with-params" : ""}`}>
            <span>Rank</span>
            <span>Period</span>
            <span>ROI</span>
            {showParams && <span>Parameters</span>}
            <span>WR / PF / Trades</span>
            <span />
          </div>
          {filtered.map((b, i) => (
            <GridRow
              key={b.id}
              b={b}
              rank={i + 1}
              showParams={showParams}
              onNavigate={(id) => navigate(`/backtests/${id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div
          style={{ padding: "16px 40px", borderTop: "1px solid var(--line)" }}
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
