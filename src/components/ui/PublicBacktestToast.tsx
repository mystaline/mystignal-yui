import { AnimatePresence, motion } from 'framer-motion'
import { usePublicBacktest, type BacktestJobPhase } from '@/context/PublicBacktestContext'

const PHASE_LABEL: Record<BacktestJobPhase, string> = {
  idle:       '',
  queued:     'Queued…',
  fetching:   'Fetching market data…',
  simulating: 'Running simulation…',
  done:       'Done',
  error:      'Error',
  expired:    'Expired',
}

const ACTIVE_PHASES: BacktestJobPhase[] = ['queued', 'fetching', 'simulating']

function ProgressBar({ phase }: { phase: BacktestJobPhase }) {
  const steps: BacktestJobPhase[] = ['fetching', 'simulating', 'done']
  const idx = steps.indexOf(phase)
  const pct = idx < 0 ? (phase === 'queued' ? 5 : 100) : Math.round(((idx + 1) / steps.length) * 100)
  const indeterminate = ACTIVE_PHASES.includes(phase)

  return (
    <div style={{ height: 2, background: 'var(--line)', borderRadius: 1, overflow: 'hidden', marginTop: 10 }}>
      <motion.div
        style={{
          height: '100%',
          background: phase === 'error' || phase === 'expired' ? 'var(--down)' : 'var(--accent)',
          borderRadius: 1,
        }}
        animate={indeterminate
          ? { x: ['0%', '60%', '0%'], width: ['30%', '50%', '30%'] }
          : { width: `${pct}%`, x: 0 }
        }
        transition={indeterminate
          ? { repeat: Infinity, duration: 1.4, ease: 'easeInOut' }
          : { duration: 0.3 }
        }
      />
    </div>
  )
}

export function PublicBacktestToast() {
  const { state, dismiss } = usePublicBacktest()
  const visible = state.phase !== 'idle'
  const terminal = state.phase === 'done' || state.phase === 'error' || state.phase === 'expired'
  const isError = state.phase === 'error' || state.phase === 'expired'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            width: 300,
            background: 'var(--bg-2)',
            border: '1px solid var(--line)',
            borderRadius: 12,
            padding: '14px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,.35)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                Public Backtest
              </div>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600,
                color: isError ? 'var(--down)' : state.phase === 'done' ? 'var(--up)' : 'var(--ink)',
              }}>
                {PHASE_LABEL[state.phase]}
              </div>
            </div>
            {terminal && (
              <button
                onClick={dismiss}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: 14, padding: '0 0 0 8px' }}
              >✕</button>
            )}
          </div>

          {state.phase === 'done' && (
            <div style={{
              marginTop: 10, padding: '8px 10px',
              background: 'rgba(74,222,128,.08)',
              border: '1px solid rgba(74,222,128,.2)',
              borderRadius: 8,
              fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--up)',
            }}>
              ✅ Result saved to your browser
            </div>
          )}

          {isError && state.label && state.label !== PHASE_LABEL[state.phase] && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)', marginTop: 6 }}>
              {state.label}
            </div>
          )}

          <ProgressBar phase={state.phase} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
