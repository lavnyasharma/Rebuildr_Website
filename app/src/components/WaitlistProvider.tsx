import { Suspense, createContext, lazy, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import { scroller } from '../lib/lenis'
import { track } from '../lib/analytics'

// The modal (and its animation code) loads only when first opened.
const WaitlistModal = lazy(() => import('./WaitlistModal'))

type Ctx = { open: (email?: string) => void }
const WaitlistContext = createContext<Ctx>({ open: () => {} })
export const useWaitlist = () => useContext(WaitlistContext)

export default function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [prefill, setPrefill] = useState('')
  const trigger = useRef<HTMLElement | null>(null)

  const open = useCallback((email = '') => {
    trigger.current = document.activeElement as HTMLElement
    setPrefill(email)
    setIsOpen(true)
    track('waitlist_open')
  }, [])
  const close = useCallback(() => {
    setIsOpen(false)
    trigger.current?.focus?.()
  }, [])

  useEffect(() => {
    if (!isOpen) return
    scroller.current?.stop()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => {
      scroller.current?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, close])

  return (
    <WaitlistContext.Provider value={{ open }}>
      {children}
      <AnimatePresence>{isOpen && <Suspense fallback={null}><WaitlistModal key="wl" onClose={close} initialEmail={prefill} /></Suspense>}</AnimatePresence>
    </WaitlistContext.Provider>
  )
}
