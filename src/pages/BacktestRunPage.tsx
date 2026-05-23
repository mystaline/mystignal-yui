import { useNavigate } from 'react-router-dom'
import { TriggerBacktestForm } from '@/components/backtest/TriggerBacktestForm'

export default function BacktestRunPage() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="pg-head">
        <div>
          <div className="eyebrow" style={{ cursor: 'pointer' }} onClick={() => navigate('/backtests')}>
            ← Backtests · New run
          </div>
          <h1>New Backtest<em>.</em></h1>
        </div>
      </div>

      <div style={{ padding: '40px', maxWidth: 680 }}>
        <div className="neon-card">
          <TriggerBacktestForm />
        </div>
      </div>
    </div>
  )
}
