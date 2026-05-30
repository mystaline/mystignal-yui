import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { pageTransitionVariant } from '@/motion/variants'

export function AppShell() {
  const location = useLocation()
  const isEmbed = new URLSearchParams(location.search).get('embed') === '1'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {!isEmbed && <Sidebar />}
      <main className="flex-1 overflow-y-auto" role="main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageTransitionVariant}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
