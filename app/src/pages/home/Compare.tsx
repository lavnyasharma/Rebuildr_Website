import { useState } from 'react'
import Reveal from '../../components/Reveal'

const cols = ['Drag-and-drop builders', 'Screenshot-to-code tools', 'Rebuildr']
const rows: [string, string, string, string][] = [
  ['Starts from', 'A template you fill in', 'An image of a page', 'A website URL'],
  ['What you get', 'A hosted site on their platform', 'A single long file', 'A Next.js + TypeScript + Tailwind project'],
  ['Code structure', 'Generated, often locked in', 'One file, hard to maintain', 'Reusable components and routes'],
  ['Where it runs', 'Their servers', 'Wherever you paste it', 'On your computer, with a local preview'],
  ['Checked in a browser', 'Manual', 'Rarely', 'Yes, with a report of what passed and failed'],
  ['Who owns the code', 'Depends on the platform', 'You', 'You, even if you cancel'],
]

// Phone view: one approach at a time. Index = column in each row below (1 builders, 2 screenshot tools, 3 Rebuildr).
const tabs = [
  { name: 'Rebuildr', col: 3 },
  { name: 'Builders', col: 1 },
  { name: 'Screenshot', col: 2 },
] as const

export default function Compare() {
  const [tab, setTab] = useState(0)
  return (
    <section id="compare" className="mx-auto max-w-5xl scroll-mt-24 px-5 py-24 md:px-8">
      <Reveal className="text-center">
        <p className="text-[10px] uppercase tracking-widest text-white/60">Compare</p>
        <h2 className="mt-3 text-4xl font-medium md:text-5xl">Looking for a website builder like this?</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/60">
          Most website builders start from a template, and screenshot-to-code tools start from a picture. Rebuildr, a URL to website creator, starts from the site you point it at and gives you a real codebase.
        </p>
      </Reveal>
      {/* Phones: one compact card, switch between approaches (a 3-column table won't fit, six stacked cards scroll too long) */}
      <Reveal className="mt-8 md:hidden">
        <div role="tablist" aria-label="Compare approaches" className="grid grid-cols-3 gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 text-[13px]">
          {tabs.map((t, i) => (
            <button
              key={t.name}
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i)}
              className={`min-h-11 rounded-full px-2 transition-colors duration-150 ${tab === i ? (i === 0 ? 'bg-accent text-black' : 'bg-white/15 text-white') : 'text-white/60'}`}
            >
              {t.name}
            </button>
          ))}
        </div>
        {/* All three lists share one grid cell, so the card is as tall as the longest and never jumps */}
        <div className="mt-3 grid rounded-2xl border border-white/10 bg-white/[0.03] px-4">
          {tabs.map((t, i) => (
            <dl key={t.name} role="tabpanel" aria-hidden={tab !== i} className={`col-start-1 row-start-1 divide-y divide-white/10 ${tab === i ? 'opacity-100 transition-opacity duration-150' : 'pointer-events-none opacity-0'}`}>
              {rows.map((r) => (
                <div key={r[0]} className="grid grid-cols-[6.5rem_1fr] gap-3 py-3 text-[13px] leading-snug">
                  <dt className="text-white/60">{r[0]}</dt>
                  <dd className={i === 0 ? 'text-white' : 'text-white/80'}>{r[t.col]}</dd>
                </div>
              ))}
            </dl>
          ))}
        </div>
      </Reveal>
      <Reveal className="mt-10 hidden overflow-x-auto rounded-3xl border border-white/10 md:block">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <caption className="sr-only">How Rebuildr compares with other ways to build a website</caption>
          <thead>
            <tr className="border-b border-white/10">
              <th scope="col" className="p-4 font-normal text-white/60"><span className="sr-only">Feature</span></th>
              {cols.map((c, i) => (
                <th key={c} scope="col" className={`p-4 font-medium ${i === 2 ? 'text-accent' : 'text-white/80'}`}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, a, b, c]) => (
              <tr key={k} className="border-b border-white/5 last:border-0">
                <th scope="row" className="p-4 font-normal text-white/60">{k}</th>
                <td className="p-4 text-white/70">{a}</td>
                <td className="p-4 text-white/70">{b}</td>
                <td className="bg-accent/[0.06] p-4 text-white">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
      <p className="mt-3 text-center text-xs text-white/60">General comparison of approaches; individual products vary.</p>
    </section>
  )
}
