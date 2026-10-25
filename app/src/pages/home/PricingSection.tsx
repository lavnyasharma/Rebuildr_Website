import { useState } from 'react'
import Accordion from '../../components/Accordion'
import Button from '../../components/Button'
import Reveal from '../../components/Reveal'
import { faqs } from '../../data/faqs'

// Prices are intentionally not published: the product plan validates willingness to pay
// with beta users before finalizing them.
const plans = [
  { name: 'Free', blurb: 'Try Rebuildr on a real site.', price: '$0', note: 'Limited jobs per billing period', feats: ['Small route limit', 'Basic validation', 'Visual reconstruction', 'Your code stays local'], cta: 'Join the waitlist' },
  { name: 'Pro', blurb: 'For people who rebuild sites regularly.', price: 'Announced at launch', note: 'Monthly or annual billing', feats: ['Higher job and route limits', 'Full reconstruction mode', 'Visual repair', 'Project history', 'Your code stays yours after cancelling'], cta: 'Join the waitlist', featured: true },
]


export default function PricingSection() {
  const [yearly, setYearly] = useState(false)
  return (
    <section id="pricing" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-32 md:px-8">
      <Reveal className="text-center">
        <p className="text-[10px] uppercase tracking-widest text-white/60">Plans</p>
        <h2 className="mt-3 text-5xl font-medium md:text-6xl">Start free.<br />Upgrade when you build more.</h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/60">Rebuildr is in development. Join the waitlist and we will tell you when the beta opens.</p>
        <div className="glass relative mx-auto mt-8 grid w-56 grid-cols-2 rounded-full p-1 text-sm">
          <span aria-hidden className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]" style={{ transform: yearly ? 'translateX(100%)' : 'translateX(0)' }} />
          {['Monthly', 'Annual'].map((l, k) => (
            <button key={l} onClick={() => setYearly(k === 1)} aria-pressed={(k === 1) === yearly} className="relative z-10 py-3 sm:py-2">{l}</button>
          ))}
        </div>
      </Reveal>
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.07}>
            <div className={`glass relative flex h-full flex-col rounded-3xl p-7 ${p.featured ? 'border-accent/60 shadow-[0_0_60px_rgba(255,122,47,.15)]' : ''}`}>
              {p.featured && <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-0.5 text-[10px] font-medium text-black">Most capable</span>}
              <h3 className="text-xl">{p.name}{p.featured && <span className="ml-2 text-sm text-white/60">{yearly ? 'annual' : 'monthly'}</span>}</h3>
              <p className="mt-1 text-sm text-white/60">{p.blurb}</p>
              <div className="mt-6 text-4xl font-light">{p.price}</div>
              <p className="mt-2 text-xs text-white/60">{p.note}</p>
              <Button waitlist variant={p.featured ? 'accent' : 'dark'} className="mt-5">{p.cta}</Button>
              <ul className="mt-6 space-y-2 text-sm text-white/70">{p.feats.map((f) => <li key={f}>• {f}</li>)}</ul>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mx-auto mt-24 max-w-3xl scroll-mt-24">
        <h2 id="faq" className="mb-8 scroll-mt-24 text-center text-4xl font-medium">Frequently asked questions</h2>
        <Accordion items={faqs} />
      </Reveal>
    </section>
  )
}
