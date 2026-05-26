import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  History,
  Zap,
  CandlestickChart,
} from "lucide-react";
import { getLiveKey } from "@/lib/api/client";

const ALL_NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
    authOnly: false,
  },
  { to: "/trade", label: "Trade", icon: BookOpen, authOnly: true },
  { to: "/backtests", label: "Backtests", icon: History, authOnly: false },
  { to: "/signals", label: "Signals", icon: Zap, authOnly: false },
  { to: "/candles", label: "Candles", icon: CandlestickChart, authOnly: false },
];

export function Sidebar() {
  const authed = !!getLiveKey();
  const NAV_ITEMS = ALL_NAV_ITEMS.filter((item) => !item.authOnly || authed);
  return (
    <aside
      className="flex flex-col h-full w-16 md:w-56 flex-shrink-0"
      style={{ background: "var(--bg)", borderRight: "1px solid var(--line)" }}
    >
      {/* Brand */}
      <div className="px-4 py-6 hidden md:block" style={{ marginBottom: 4 }}>
        <div
          className="display"
          style={{ fontSize: '1.375rem', letterSpacing: "-0.01em", lineHeight: 1 }}
        >
          Mystignal
          <em style={{ fontStyle: "italic", color: "var(--accent)" }}>.</em>
        </div>
      </div>
      <div className="px-2 py-4 block md:hidden">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ background: "var(--accent)" }}
        >
          <span
            className="mono font-black text-xs"
            style={{ color: "var(--accent-ink)" }}
          >
            M
          </span>
        </div>
      </div>

      {/* Workspace section */}
      <div className="flex-1 px-2 md:px-3 space-y-0.5">
        <p className="hidden md:block eyebrow px-2.5 pt-2 pb-1.5">Workspace</p>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            aria-label={label}
          >
            <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden md:block">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-2 md:px-3 pb-4 pt-2"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <p
          className="hidden md:block mono text-center pt-2"
          style={{
            fontSize: '0.625rem',
            color: "var(--ink-3)",
            letterSpacing: "0.08em",
          }}
        >
          v0.1.0 · ISSI · 2026
        </p>
      </div>
    </aside>
  );
}
