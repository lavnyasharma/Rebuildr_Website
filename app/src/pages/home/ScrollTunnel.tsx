import { useRef, useState } from 'react'
import { m, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion'
import CardArt from '../../components/CardArt'
import { cards } from '../../data/cards'

const words = ['Inspected', 'Planned', 'Built']
const copy = [
  'Rebuildr maps the pages, layout, typography, spacing and visible interactions of your reference site.',
  'It plans reusable components and routes, so you get a codebase, not a screenshot-shaped single page.',
  'A Next.js + TypeScript + Tailwind project is generated, started locally and checked in a real browser.',
]

function FlyingCard({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const angle = (i / cards.length) * Math.PI * 2 + 0.4
  const dist = 38 + (i % 3) * 8
  const start = (i / cards.length) * 0.4
  const x = useTransform(progress, [start, start + 0.5], [0, Math.cos(angle) * dist * 12])
  const y = useTransform(progress, [start, start + 0.5], [0, Math.sin(angle) * dist * 8])
  const scale = useTransform(progress, [start, start + 0.5], [0.2, 1.2])
  const opacity = useTransform(progress, [start, start + 0.08, start + 0.45, start + 0.55], [0, 1, 1, 0])
  return (
    <m.div style={{ x, y, scale, opacity }} className="absolute w-32 md:w-44">
      <CardArt {...cards[i]} className="shadow-2xl" />
    </m.div>
  )
}

export default function ScrollTunnel() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [idx, setIdx] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setIdx(Math.min(2, Math.floor(v * 3))))
  const glow = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0])

  return (
    <div ref={ref} className="relative h-[450vh]">
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        <m.div style={{ opacity: glow }} className="edge-glow absolute inset-0" />
        {cards.map((_, i) => <FlyingCard key={i} i={i} progress={scrollYProgress} />)}
        <div className="relative z-10 max-w-md px-5 text-center">
          <p className="text-[10px] uppercase tracking-widest text-white/60">From a single URL</p>
          <m.h2 key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-3xl font-medium md:text-4xl">
            <span className="relative">{words[idx]}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 8" preserveAspectRatio="none">
                <m.path d="M0 5 Q 25 0 50 4 T 100 3" fill="none" stroke="#4ade80" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
              </svg>
            </span>
            <br />from a URL<br />Running &amp; editable.
          </m.h2>
          <p className="mt-4 text-xs text-white/60">{copy[idx]}</p>
          <div className="mt-4 flex justify-center gap-1.5">
            {words.map((_, k) => <i key={k} className={`h-1 w-1 rounded-full ${k === idx ? 'bg-white' : 'bg-white/30'}`} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
