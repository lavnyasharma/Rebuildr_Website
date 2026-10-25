import { useRef, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import Button from '../../components/Button'

const steps = [
  { t: 'Paste a URL', short: 'Paste', d: 'Enter the reference site, pick a target stack (Next.js + TypeScript + Tailwind CSS) and a local folder. Nothing is created until you confirm.' },
  { t: 'Choose a mode', short: 'Choose', d: 'Visual reconstruction for a fast, pixel-focused match of one page, or Full reconstruction for a bounded multi-page build with shared layout and components.' },
  { t: 'Review the preview', short: 'Review', d: 'Rebuildr builds the project, starts the dev server and opens a live preview, with validation findings and one-click targeted repairs.' },
]
const progress = ['Inspecting reference', 'Building project', 'Running browser checks', 'Ready for review']

const Dot = ({ on }: { on?: boolean }) => (
  <span className={`h-2 w-2 shrink-0 rounded-full ${on ? 'bg-accent' : 'border border-white/30'}`} />
)

// Three static panels, stacked in one grid cell. Only opacity changes, so the card never resizes or reflows.
const panels = [
  <div key="a" className="space-y-3">
    <p className="text-[13px] text-white/60">Reference website</p>
    <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-[15px] text-white">https://example.com</div>
    <p className="text-[13px] text-white/60">Next.js · TypeScript · Tailwind CSS</p>
  </div>,
  <div key="b" className="space-y-2">
    <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
      <div><p className="text-[15px] text-white">Visual</p><p className="text-[13px] text-white/60">One page, closest match</p></div><Dot />
    </div>
    <div className="flex items-center justify-between rounded-xl border border-accent/50 bg-accent/10 px-4 py-3">
      <div><p className="text-[15px] text-white">Full</p><p className="text-[13px] text-white/60">Multi-page, routes and components</p></div><Dot on />
    </div>
  </div>,
  <ul key="c" className="space-y-2.5">
    {progress.map((p, i) => (
      <li key={p} className="flex items-center gap-3 text-[14px] text-white/80"><Dot on={i === progress.length - 1} />{p}</li>
    ))}
  </ul>,
]

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.min(2, Math.floor(v * 3))))
  // Outgoing layer vanishes instantly (transition-none), incoming fades in: text never double-exposes.
  const fade = (on: boolean) => `col-start-1 row-start-1 ${on ? 'opacity-100 transition-opacity duration-150 ease-out' : 'pointer-events-none opacity-0 transition-none'}`

  return (
    <div id="how-it-works" ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 grid h-svh content-center items-center gap-4 px-5 pb-4 pt-[4.5rem] md:grid-cols-[1.2fr_1fr] md:gap-8 md:px-12 md:pb-0 md:pt-0">
        {/* Card: sized by its tallest panel (all panels share one grid cell), so content can never overflow it */}
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 md:h-[340px] md:p-8 [@media(max-height:600px)]:hidden md:[@media(max-height:600px)]:flex">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">Step {active + 1} of 3</p>
          <div className="grid md:flex-1 md:content-center">
            {panels.map((p, i) => <div key={i} aria-hidden={active !== i} className={fade(active === i)}>{p}</div>)}
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/60">How it works</p>
          <h2 className="mt-1 text-[1.65rem] font-medium leading-tight sm:text-3xl md:mt-3 md:text-5xl [@media(max-height:600px)]:text-2xl">Paste it.<br />Build it.<br />Run it locally.</h2>
          <div className="mt-5 hidden gap-3 sm:flex"><Button waitlist>Join the waitlist</Button><Button to="#pricing" variant="accent">See plans</Button></div>
          {/* Phones: quiet segmented step indicator */}
          <ol className="mt-5 grid grid-cols-3 gap-2 md:hidden" aria-label="Steps">
            {steps.map((s, i) => (
              <li key={s.t} aria-current={active === i ? 'step' : undefined}>
                <span className={`block h-0.5 rounded-full transition-colors duration-200 ${i <= active ? 'bg-accent' : 'bg-white/15'}`} />
                <span className={`mt-2 block text-[13px] transition-colors duration-200 ${active === i ? 'text-white' : 'text-white/60'}`}>{s.short}</span>
              </li>
            ))}
          </ol>
          {/* Tablet and up: full list */}
          <ol className="mt-8 hidden space-y-2 md:block">
            {steps.map((s, i) => (
              <li key={s.t} className={`rounded-2xl border px-4 py-3 text-sm transition-colors duration-200 ${active === i ? 'border-white/20 bg-white/[0.06] text-white' : 'border-white/10 text-white/60'}`}>{s.t}</li>
            ))}
          </ol>
          {/* One fixed-height description slot (3 lines): crossfades, never pushes the layout */}
          <div className="mt-3 grid min-h-[3.75rem] text-[13px] leading-snug text-white/60 md:min-h-[4.5rem]">
            {steps.map((s, i) => <p key={s.t} aria-hidden={active !== i} className={fade(active === i)}>{s.d}</p>)}
          </div>
        </div>
      </div>
    </div>
  )
}
