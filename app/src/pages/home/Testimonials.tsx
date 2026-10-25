import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import Reveal from '../../components/Reveal'
import Button from '../../components/Button'

const quotes = [
  { q: 'Your code stays on your machine, and it stays yours, even if you cancel.', a: 'Local-first' },
  { q: 'We show what was tested, what passed, what failed, and what is still uncertain.', a: 'Honest validation' },
  { q: 'We tell you when a page needs sign-in or can’t be reproduced, instead of guessing.', a: 'No overclaiming' },
]

export default function Testimonials() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((n) => (n + 1) % quotes.length), 5000); return () => clearInterval(t) }, [])
  return (
    <section className="px-5 py-32 text-center">
      <div className="mx-auto h-40 max-w-3xl">
        <AnimatePresence mode="wait">
          <m.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <p className="text-2xl font-light md:text-4xl">“{quotes[i].q}”</p>
            <p className="mt-4 text-sm text-white/60">{quotes[i].a}</p>
          </m.div>
        </AnimatePresence>
      </div>
      <div className="mt-4 flex justify-center">
        {quotes.map((_, k) => <button key={k} aria-label={`Quote ${k + 1}`} aria-current={k === i} onClick={() => setI(k)} className="flex h-11 w-8 items-center justify-center sm:h-6 sm:w-6"><span className={`h-1.5 w-1.5 rounded-full ${k === i ? 'bg-white' : 'bg-white/30'}`} /></button>)}
      </div>
      <Reveal className="mt-32">
        <h2 className="text-4xl font-medium md:text-6xl">Ready to rebuild your first site?</h2>
        <div className="mt-6 flex justify-center gap-3"><Button waitlist>Join the waitlist</Button><Button to="#how-it-works" variant="accent">See how it works</Button></div>
      </Reveal>
    </section>
  )
}
