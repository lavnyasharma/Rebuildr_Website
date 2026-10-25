import { useRef, useState } from 'react'
import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'framer-motion'
import Button from '../../components/Button'
import CardArt from '../../components/CardArt'
import { Mark } from '../../components/Logo'

const items = [
  { t: 'Visual reconstruction', d: 'Layout, typography, spacing, colors and responsive behavior of a single page, matched closely and built from reusable components.', hue: 20, icon: '◎' },
  { t: 'Full reconstruction', d: 'A bounded multi-page route plan with shared navigation, layouts and visible interactions. Observed behavior is kept separate from inferred behavior.', hue: 280, icon: '✻' },
  { t: 'Browser validation', d: 'Rebuildr runs your project in a real browser and compares it to the reference, reporting what passed, what failed and what is uncertain.', hue: 150, icon: '⌂' },
  { t: 'Targeted repairs', d: 'Point at a section that is off and ask for a fix. Rebuildr applies it and re-runs the checks, keeping your own edits.', hue: 200, icon: '◔' },
  { t: 'Local-first', d: 'Projects are created in a folder you choose. Your source stays on your machine and remains yours after any subscription ends.', hue: 330, icon: '✺' },
]

export default function Capabilities() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)
  // Scroll drives the selection only where the scene is pinned (md+); on phones it's tap-to-select.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (window.matchMedia('(min-width: 768px)').matches) setActive(Math.min(items.length - 1, Math.floor(v * items.length)))
  })
  const it = items[active]

  return (
    <div id="features" ref={ref} className="relative md:h-[450vh]">
      <div className="grid items-center gap-6 px-5 py-24 md:sticky md:top-0 md:h-svh md:grid-cols-[1.1fr_1fr] md:overflow-hidden md:px-10 md:py-0 md:pt-16">
        <div className="relative flex h-[300px] items-center justify-center overflow-hidden md:h-[80svh] md:overflow-visible">
          <div className="absolute left-[-10%] top-1/2 h-[60svh] w-[60svh] max-w-[110%] -translate-y-1/2 rounded-full border border-white/10" />
          <div className="absolute left-[-6%] top-1/2 h-[44svh] w-[44svh] max-w-[100%] -translate-y-1/2 animate-[spin-slow_40s_linear_infinite] rounded-full border border-dashed border-white/20">
            {[0, 1, 2, 3].map((n) => <i key={n} className="absolute h-2 w-2 rounded-full bg-white/70" style={{ left: `${50 + 50 * Math.cos(n * 1.7)}%`, top: `${50 + 50 * Math.sin(n * 1.7)}%` }} />)}
          </div>
          <Mark className="absolute left-0 top-1/2 hidden h-24 w-24 -translate-y-1/2 md:block" />
          <AnimatePresence mode="wait">
            <m.div
              key={active}
              initial={{ opacity: 0, y: 40, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40, scale: 0.94 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative grid grid-cols-2 items-end gap-4"
            >
              <CardArt title={it.t} hue={it.hue} className="w-40 md:w-56" />
              <CardArt title="Preview" hue={it.hue + 40} className="mb-10 w-28 md:w-40" />
            </m.div>
          </AnimatePresence>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">Built for how builders actually work</p>
          <h2 className="mt-3 text-5xl font-medium leading-[1.05] md:text-6xl">One URL.<br />A whole codebase.</h2>
          <div className="mt-6 flex gap-3"><Button waitlist>Join the waitlist</Button><Button to="#how-it-works" variant="accent">How it works</Button></div>
          <div className="mt-8 space-y-2.5">
            {items.map((x, i) => (
              <m.button
                key={x.t}
                onClick={() => setActive(i)}
                animate={{ backgroundColor: active === i ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,0)' }}
                className="flex w-full items-center gap-4 rounded-2xl border border-white/10 px-4 py-3.5 text-left"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl">{x.icon}</span>
                <span>
                  <b className={`block font-normal ${active === i ? 'text-white' : 'text-white/60'}`}>{x.t}</b>
                  <m.span initial={false} animate={{ height: active === i ? 'auto' : 0, opacity: active === i ? 1 : 0 }} className="block overflow-hidden text-sm text-white/60">{x.d}</m.span>
                </span>
              </m.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
