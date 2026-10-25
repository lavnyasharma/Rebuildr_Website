import { useEffect, useState } from 'react'
import { AnimatePresence, m, useScroll, useTransform } from 'framer-motion'
import Button from '../../components/Button'

const combos = [
  ['A founder', 'Startup', 'a landing page'],
  ['A developer', 'Agency', 'a client site'],
  ['A designer', 'Product team', 'a pricing page'],
  ['A builder', 'Side project', 'a full website'],
]
const prompt = 'https://example.com — rebuild as Next.js + Tailwind'

function Chip({ text, tone }: { text: string; tone: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <m.span
        key={text}
        initial={{ y: 14, filter: 'blur(6px)' }}
        animate={{ y: 0, filter: 'blur(0px)' }}
        exit={{ y: -14, filter: 'blur(6px)' }}
        transition={{ duration: 0.35 }}
        className={`inline-block rounded-xl border border-white/10 px-3 py-1 ${tone}`}
      >
        {text}
      </m.span>
    </AnimatePresence>
  )
}

function TypedPrompt() {
  const [typed, setTyped] = useState(prompt)
  useEffect(() => {
    let n = 0
    const t = setInterval(() => {
      n = (n + 1) % (prompt.length + 25)
      setTyped(prompt.slice(0, n))
    }, 55)
    return () => clearInterval(t)
  }, [])
  return <>{typed}</>
}

export default function Hero() {
  const [i, setI] = useState(0)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 500], [1, 0])
  const y = useTransform(scrollY, [0, 500], [0, -80])

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % combos.length), 2800)
    return () => clearInterval(t)
  }, [])

  const [name, team, asset] = combos[i]
  return (
    <section className="relative flex h-svh items-center justify-center px-5 pb-12 pt-20">
      <m.div style={{ opacity, y }} className="flex max-w-3xl flex-col items-center text-center">
        <p className="flex flex-wrap items-center justify-center gap-2 text-lg text-white/60 md:text-2xl">
          Let <Chip text={name} tone="bg-indigo-500/20 text-white" /> from
          <Chip text={team} tone="bg-orange-500/25 text-white" /> rebuild
          <Chip text={asset} tone="bg-white/10 text-white" />
        </p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight md:text-6xl">From URL to reality.</h1>
        <div className="glass mt-8 h-28 w-full max-w-xl sm:mt-10 sm:h-32 rounded-2xl p-4 text-left text-sm text-white/70">
          <TypedPrompt />
          <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-white align-middle" />
          <div className="mt-6 flex justify-end">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black">→</span>
          </div>
        </div>
        <p className="mt-5 max-w-md text-xs text-white/60">
          Rebuildr is a URL to website creator for macOS and Windows. Paste a website URL and our AI website builder inspects it, generates a clean Next.js project on your machine, runs it locally and checks it in a real browser.
        </p>
        <div className="mt-5 flex gap-3">
          <Button waitlist>Join the waitlist</Button>
          <Button to="#how-it-works" variant="accent">See how it works</Button>
        </div>
        <span className="mt-10 text-[10px] uppercase tracking-widest text-white/60 [@media(max-height:720px)]:hidden">Scroll to explore</span>
      </m.div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/5 px-5 py-3 text-xs text-white/60 md:px-8">
        <span>macOS · Windows</span>
        <span className="hidden gap-8 md:flex">{['Next.js', 'TypeScript', 'Tailwind CSS', 'React'].map((l) => <b key={l} className="font-medium">{l}</b>)}</span>
        <span>Your code stays on your machine</span>
      </div>
    </section>
  )
}
