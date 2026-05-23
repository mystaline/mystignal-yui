import { motion, useReducedMotion } from 'framer-motion'
import { fadeUpVariant } from './variants'
import type { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function AnimatedCard({ children, delay = 0, className }: AnimatedCardProps) {
  const shouldReduce = useReducedMotion()
  return (
    <motion.div
      variants={fadeUpVariant}
      initial={shouldReduce ? false : 'hidden'}
      animate="visible"
      transition={{ delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
