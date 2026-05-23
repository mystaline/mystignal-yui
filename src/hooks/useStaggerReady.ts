import { useEffect, useState } from 'react'

export function useStaggerReady(isSuccess: boolean): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (isSuccess) {
      const id = requestAnimationFrame(() => setReady(true))
      return () => cancelAnimationFrame(id)
    }
  }, [isSuccess])
  return ready
}
