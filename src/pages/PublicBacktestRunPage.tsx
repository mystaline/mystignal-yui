import { useNavigate } from 'react-router-dom'
import { usePublicBacktest } from '@/context/PublicBacktestContext'
import { TriggerBacktestForm } from '@/components/backtest/TriggerBacktestForm'

export default function PublicBacktestRunPage() {
  const { start } = usePublicBacktest()
  const navigate = useNavigate()

  function handleTriggered(workflowId: string) {
    start(workflowId)
    navigate(`/backtests/public/${workflowId}`)
  }

  return (
    <div>
      <div className="pg-head">
        <div>
          <div className="eyebrow">Public Backtest</div>
          <h1>Strategy Simulator<em>.</em></h1>
        </div>
      </div>
      <div style={{ padding: '40px', maxWidth: 680 }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)',
          background: 'color-mix(in srgb, var(--accent) 6%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
          borderRadius: 6, padding: '10px 14px', marginBottom: 24,
        }}>
          No API key required — configure your own indicator weights and run a free backtest on live IDX data.
          Results are stored only in your browser.
        </div>
        <div className="neon-card">
          <TriggerBacktestForm mode="public" onTriggered={handleTriggered} />
        </div>
      </div>
    </div>
  )
}
