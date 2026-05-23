import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { shakeVariant } from '@/motion/variants'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <motion.div
      animate="shake"
      variants={shakeVariant}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '48px 0', textAlign: 'center' }}
    >
      <div style={{
        padding: 12, borderRadius: '50%',
        background: 'color-mix(in srgb, var(--down) 10%, transparent)',
        border: '1px solid color-mix(in srgb, var(--down) 20%, transparent)',
      }}>
        <AlertTriangle style={{ width: 22, height: 22, color: 'var(--down)' }} />
      </div>
      <p className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn" style={{ fontSize: 12 }}>
          Try again
        </button>
      )}
    </motion.div>
  )
}
