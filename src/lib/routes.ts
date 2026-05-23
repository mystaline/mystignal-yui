/**
 * Centralized route string constants to avoid hardcoded paths scattered across components.
 * Update here when adding or modifying routes.
 */

export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  signals: '/signals',
  backtests: {
    root: '/backtests',
    detail: (id: string) => `/backtests/${id}`,
    triggerForm: '/backtests/trigger',
  },
  journal: {
    root: '/journal',
    trades: '/journal/trades',
  },
} as const
