import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { staggerContainerVariant, staggerItemVariant } from './variants'
import type { ReactNode } from 'react'

interface StaggeredListProps {
  children: ReactNode[]
  isReady: boolean
  className?: string
  itemClassName?: string
  listKey?: string
}

export function StaggeredList({ children, isReady, className, itemClassName, listKey }: StaggeredListProps) {
  const shouldReduce = useReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.ul
        key={listKey}
        variants={staggerContainerVariant}
        initial={shouldReduce ? false : 'hidden'}
        animate={isReady ? 'visible' : 'hidden'}
        className={className}
      >
        {children.map((child, i) => (
          <motion.li key={i} variants={staggerItemVariant} className={itemClassName}>
            {child}
          </motion.li>
        ))}
      </motion.ul>
    </AnimatePresence>
  )
}
