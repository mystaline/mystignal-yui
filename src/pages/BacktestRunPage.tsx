import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLiveKey } from '@/lib/api/client'
import { usePublicBacktest } from '@/context/PublicBacktestContext'
import { TriggerBacktestForm } from '@/components/backtest/TriggerBacktestForm'
import { GenericStrategyPanel } from '@/components/backtest/GenericStrategyPanel'
import { DEFAULT_GENERIC_STRATEGY, type GenericStrategyConfigDTO } from '@/types/backtest'
import type { PublicSignalParams } from '@/lib/idb'

export default function BacktestRunPage() {
  const navigate = useNavigate()
  const { start } = usePublicBacktest()
  const isPublic = !getLiveKey()
  const [strategyConfig, setStrategyConfig] = useState<GenericStrategyConfigDTO>(DEFAULT_GENERIC_STRATEGY)

  function handleTriggered(workflowId: string, cfg?: GenericStrategyConfigDTO, signalParams?: PublicSignalParams) {
    start(workflowId, cfg, signalParams)
    navigate(`/backtests/public/${workflowId}`)
  }

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

      {isPublic ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.25rem',
          padding: '1.75rem 2.5rem 3rem',
          alignItems: 'start',
        }}>
          <div className="neon-card" style={{ position: 'sticky', top: '1.25rem' }}>
            <h4>Strategy Config</h4>
            <GenericStrategyPanel value={strategyConfig} onChange={setStrategyConfig} />
          </div>
          <div className="neon-card">
            <h4>Run Parameters</h4>
            <TriggerBacktestForm strategyConfig={strategyConfig} onTriggered={handleTriggered} />
          </div>
        </div>
      ) : (
        <div style={{ padding: '1.75rem 2.5rem 3rem', maxWidth: '45rem' }}>
          <div className="neon-card">
            <TriggerBacktestForm onTriggered={handleTriggered} />
          </div>
        </div>
      )}
    </div>
  )
}
