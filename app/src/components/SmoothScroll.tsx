import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import { scroller } from '../lib/lenis'

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: true })
    scroller.current = lenis
    let raf = 0
    const loop = (t: number) => {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      scroller.current = null
    }
  }, [])
  return <>{children}</>
}
