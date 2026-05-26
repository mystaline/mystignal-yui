import { AnimatePresence, motion } from 'framer-motion'
import { useAnalyze, type AnalyzePhase } from '@/context/AnalyzeContext'

const PHASE_LABEL: Record<AnalyzePhase, string> = {
  idle:    '',
  start:   'Initializing…',
  market:  'Market check…',
  bearish: 'Market bearish',
  fetch:   'Fetching candles…',
  analyze: 'Analyzing stocks…',
  store:   'Saving signals…',
  done:    'Done',
  error:   'Error',
}

const PHASE_COLOR: Partial<Record<AnalyzePhase, string>> = {
  bearish: 'var(--down)',
  done:    'var(--up)',
  error:   'var(--down)',
}

const ACTIVE_PHASES: AnalyzePhase[] = ['start', 'market', 'fetch', 'analyze', 'store']

function ProgressBar({ phase }: { phase: AnalyzePhase }) {
  const steps: AnalyzePhase[] = ['market', 'fetch', 'analyze', 'store', 'done']
  const idx = steps.indexOf(phase)
  const pct = idx < 0 ? (phase === 'start' ? 0 : 100) : Math.round(((idx + 1) / steps.length) * 100)
  const indeterminate = ACTIVE_PHASES.includes(phase)

  return (
    <div style={{ height: '0.125rem', background: 'var(--line)', borderRadius: '0.0625rem', overflow: 'hidden', marginTop: '0.625rem' }}>
      <motion.div
        style={{ height: '100%', background: phase === 'error' ? 'var(--down)' : 'var(--accent)', borderRadius: 1 }}
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

export function AnalyzeProgressToast() {
  const { state, dismiss } = useAnalyze()
  const visible = state.phase !== 'idle'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
            width: '18.75rem',
            background: 'var(--bg-2)',
            border: '1px solid var(--line)',
            borderRadius: '0.75rem',
            padding: '0.875rem 1rem',
            boxShadow: '0 8px 32px rgba(0,0,0,.35)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6875rem', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.1875rem' }}>
                Signal Analysis
              </div>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: '0.8125rem', fontWeight: 600,
                color: PHASE_COLOR[state.phase] ?? 'var(--ink)',
              }}>
                {PHASE_LABEL[state.phase]}
              </div>
            </div>
            {(state.phase === 'done' || state.phase === 'error' || state.phase === 'bearish') && (
              <button
                onClick={dismiss}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', fontSize: '0.875rem', padding: '0 0 0 0.5rem' }}
              >✕</button>
            )}
          </div>

          {/* Message */}
          {state.message && (
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6875rem', color: 'var(--ink-2)', marginTop: '0.375rem', lineHeight: 1.5 }}>
              {state.message}
            </div>
          )}

          {/* Stats row for done */}
          {state.phase === 'done' && (
            <div style={{
              marginTop: '0.625rem',
              padding: '0.5rem 0.625rem',
              background: 'rgba(74,222,128,.08)',
              border: '1px solid rgba(74,222,128,.2)',
              borderRadius: '0.5rem',
              fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--up)',
            }}>
              ✅ {state.signalsFound} signal{state.signalsFound !== 1 ? 's' : ''} saved — table refreshed
            </div>
          )}

          {/* Stats row for bearish */}
          {state.phase === 'bearish' && (
            <div style={{
              marginTop: '0.625rem',
              padding: '0.5rem 0.625rem',
              background: 'rgba(239,68,68,.08)',
              border: '1px solid rgba(239,68,68,.2)',
              borderRadius: '0.5rem',
              fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--down)',
            }}>
              🔴 IHSG close {state.lastClose?.toFixed(0)} &lt; EMA50 {state.ema50?.toFixed(0)}
            </div>
          )}

          <ProgressBar phase={state.phase} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
