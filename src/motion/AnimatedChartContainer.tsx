import { motion, useReducedMotion } from 'framer-motion'
import { chartRevealVariant } from './variants'
import type { ReactNode } from 'react'

interface AnimatedChartContainerProps {
  children: ReactNode
  className?: string
  isReady?: boolean
}

export function AnimatedChartContainer({ children, className, isReady = true }: AnimatedChartContainerProps) {
  const shouldReduce = useReducedMotion()
  return (
    <motion.div
      variants={chartRevealVariant}
      initial={shouldReduce ? false : 'hidden'}
      animate={isReady ? 'visible' : 'hidden'}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}
