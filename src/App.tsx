import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnalyzeProvider } from '@/context/AnalyzeContext'
import { AnalyzeProgressToast } from '@/components/ui/AnalyzeProgressToast'
import { AppShell } from '@/components/layout/AppShell'
import DashboardPage from '@/pages/DashboardPage'
import TradingJournalPage from '@/pages/TradingJournalPage'
import BacktestListPage from '@/pages/BacktestListPage'
import BacktestDetailPage from '@/pages/BacktestDetailPage'
import BacktestRunPage from '@/pages/BacktestRunPage'
import PublicBacktestRunPage from '@/pages/PublicBacktestRunPage'
import PublicBacktestPage from '@/pages/PublicBacktestPage'
import SignalsPage from '@/pages/SignalsPage'
import CandlesPage from '@/pages/CandlesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalyzeProvider>
        <AnalyzeProgressToast />
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="trade" element={<TradingJournalPage />} />
            <Route path="backtests" element={<BacktestListPage />} />
            <Route path="backtests/run" element={<BacktestRunPage />} />
            <Route path="backtests/public/run" element={<PublicBacktestRunPage />} />
            <Route path="backtests/public/:id" element={<PublicBacktestPage />} />
            <Route path="backtests/:id" element={<BacktestDetailPage />} />
            <Route path="signals" element={<SignalsPage />} />
            <Route path="candles" element={<CandlesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AnalyzeProvider>
    </QueryClientProvider>
  )
}
