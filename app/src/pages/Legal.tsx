import type { ReactNode } from 'react'
import { LEGAL } from '../data/legal'

export type LegalSection = { id: string; title: string; body: ReactNode }

export default function Legal({ title, intro, sections }: { title: string; intro: ReactNode; sections: LegalSection[] }) {
  return (
    <article className="mx-auto max-w-6xl px-5 pb-24 pt-36 md:px-8">
      <p className="text-[10px] uppercase tracking-widest text-white/60">Legal</p>
      <h1 className="mt-3 text-4xl font-medium md:text-6xl">{title}</h1>
      <p className="mt-3 text-sm text-white/60">Effective {LEGAL.effective}</p>
      <div className="mt-6 max-w-3xl text-white/70">{intro}</div>
      <div className="mt-12 grid gap-12 md:grid-cols-[220px_1fr]">
        <nav aria-label="On this page" className="hidden md:block">
          <ul className="sticky top-28 space-y-2 text-sm text-white/60">
            {sections.map((s, i) => (
              <li key={s.id}><a href={`#${s.id}`} className="hover:text-white">{i + 1}. {s.title}</a></li>
            ))}
          </ul>
        </nav>
        <div className="max-w-3xl space-y-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="text-2xl font-medium">{i + 1}. {s.title}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-white/65 [&_a]:text-white [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-medium [&_strong]:text-white/90">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
