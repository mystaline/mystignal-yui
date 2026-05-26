# Mystignal

A React + TypeScript frontend for a trading signal backtesting platform. Provides interactive analysis, backtesting, and journaling tools for equity traders.

## Features

- **Signals** — Fetch, filter, and analyze trading signals with configurable parameters (confidence threshold, composite index, entry timing)
- **Backtesting** — Run manual or grid-search backtests with strategy configuration; view aggregate stats, equity curves, and trade lists
- **Public Backtests** — Share backtest results via link; results persisted in IndexedDB for unauthenticated access
- **Trading Journal** — Log, close, and track open/closed positions with P&L
- **Market Data** — Candlestick charts with date range navigation
- **Dashboard** — Aggregate performance summary across all backtests and signals
- **Dual Mode** — Authenticated (API) or public (IDB) mode auto-detected based on presence of an API key

## Tech Stack

| Layer         | Technology                                  |
| ------------- | ------------------------------------------- |
| Framework     | React 19, TypeScript, Vite 5                |
| Routing       | react-router-dom 6                          |
| Data Fetching | @tanstack/react-query 5                     |
| Charts        | lightweight-charts 4, custom SVG sparklines |
| Animations    | framer-motion 11                            |
| Icons         | lucide-react                                |
| Persistence   | idb (IndexedDB wrapper)                     |
| Styling       | Tailwind CSS 3 + CSS custom properties      |

## Getting Started

```bash
pnpm install
pnpm dev
```

The dev server starts at `http://localhost:5173` and proxies `/api` requests to `http://localhost:8080`.

### Environment

| Variable            | Default                 | Description               |
| ------------------- | ----------------------- | ------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API base URL      |
| `VITE_USE_MOCK`     | `false`                 | Enable mock data (legacy) |

API keys are passed via URL hash fragment: `http://localhost:5173/#key=YOUR_API_KEY` and persisted in sessionStorage.

## Project Structure

```
src/
├── components/
│   ├── backtest/       # Backtest-specific components (form, table, row variants)
│   ├── journal/        # Trading journal components (log, close, table)
│   ├── layout/         # AppShell, Sidebar
│   ├── signals/        # Signal components (card, filter, table row)
│   └── ui/             # Shared primitives (toast, pagination, confirm dialog)
├── context/            # React context providers (analyze, public backtest)
├── hooks/              # Custom hooks wrapping TanStack Query + IDB
├── lib/
│   ├── api/            # HTTP client and endpoint functions
│   └── idb.ts          # IndexedDB wrapper for offline/public persistence
├── pages/              # Route-level page components
└── types/              # TypeScript type definitions
```

## Build

```bash
pnpm build    # tsc + vite build, output to dist/
pnpm preview  # serve built output
```

## Scripts

| Command        | Description                         |
| -------------- | ----------------------------------- |
| `pnpm dev`     | Start development server            |
| `pnpm build`   | Type-check and build for production |
| `pnpm preview` | Preview production build            |

## Architecture Notes

- Queries use a centralized `queryKeys` factory (`src/lib/query-keys.ts`) for cache key consistency
- Hooks auto-select between API calls (authenticated) and IndexedDB (public) based on `getLiveKey()`
- Async backtest jobs use context-based polling with progress toasts
- Styling: Tailwind utility classes for layout, CSS custom properties (`--bg`, `--ink`, `--accent`, etc.) for theming
