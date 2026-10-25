import { useState, type ReactNode } from 'react'
import { AnimatePresence, m } from 'framer-motion'

export type AccordionItem = { title: string; body: ReactNode }

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="divide-y divide-white/10 border-y border-white/10">
      {items.map((it, i) => (
        <div key={it.title}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between py-5 text-left text-lg"
          >
            {it.title}
            <m.span animate={{ rotate: open === i ? 45 : 0 }} className="text-2xl text-white/60">
              +
            </m.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <m.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="pb-5 text-white/60">{it.body}</div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
