import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, LazyMotion, domMax, m, useReducedMotion } from 'framer-motion'
import { submitWaitlist } from '../lib/waitlist'
import { track } from '../lib/analytics'
import { Mark } from './Logo'

const EASE = [0.23, 1, 0.32, 1] as const
const uses = ['Landing page', 'Client site', 'Portfolio', 'Full website']
const platforms = ['macOS', 'Windows', 'Both'] as const

export default function WaitlistModal(props: { onClose: () => void; initialEmail: string }) {
  return (
    <LazyMotion features={domMax} strict>
      <ModalInner {...props} />
    </LazyMotion>
  )
}

function ModalInner({ onClose, initialEmail }: { onClose: () => void; initialEmail: string }) {
  const reduce = useReducedMotion()
  const [email, setEmail] = useState(initialEmail)
  const [name, setName] = useState('')
  const [use, setUse] = useState(uses[0])
  const [platform, setPlatform] = useState<(typeof platforms)[number]>('macOS')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [invalid, setInvalid] = useState(0) // increments to retrigger the shake
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => { emailRef.current?.focus() }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setInvalid((n) => n + 1)
      setStatus('error')
      emailRef.current?.focus()
      return
    }
    setStatus('sending')
    try {
      await submitWaitlist({ email, name, use, platform })
      track('generate_lead', { method: 'waitlist', use_case: use, platform })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const enter = (i: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: EASE, delay: reduce ? 0 : 0.08 + i * 0.045 },
  })

  return (
    <m.div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <m.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wl-title"
        data-lenis-prevent
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.28, ease: EASE }}
        className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b0b0b] p-7 pb-[calc(1.75rem+env(safe-area-inset-bottom))] shadow-[0_30px_120px_rgba(0,0,0,.7)] sm:rounded-3xl"
      >
        {/* Ambient glow — decorative, transform/opacity only */}
        {!reduce && (
          <>
            <m.div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/25 blur-3xl"
              animate={{ x: [0, -20, 0], y: [0, 18, 0], opacity: [0.7, 1, 0.7] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
            <m.div aria-hidden className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl"
              animate={{ x: [0, 24, 0], y: [0, -14, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
          </>
        )}

        <button onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white">
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>

        <AnimatePresence mode="wait" initial={false}>
          {status === 'done' ? (
            <Success key="ok" email={email} reduce={!!reduce} onClose={onClose} />
          ) : (
            <m.form key="form" onSubmit={onSubmit} noValidate exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="relative">
              <m.div {...enter(0)} className="flex items-center gap-2 text-white/80"><Mark className="h-5 w-5" /><span className="text-xs uppercase tracking-[0.2em] text-white/60">Early access</span></m.div>
              <m.h2 id="wl-title" {...enter(1)} className="mt-4 text-3xl font-medium leading-tight">Be first to<br />go from URL to reality.</m.h2>
              <m.p {...enter(2)} className="mt-2 text-sm text-white/60">Join the waitlist. We’ll email you when the beta opens. No spam.</m.p>

              <m.div {...enter(3)} className="mt-6 space-y-3">
                <m.div key={invalid} animate={invalid && !reduce ? { x: [0, -6, 6, -4, 4, 0] } : {}} transition={{ duration: 0.35, ease: 'easeOut' }}>
                  <label className="mb-1 block text-xs text-white/60" htmlFor="wl-email">Email</label>
                  <input
                    id="wl-email" ref={emailRef} type="email" value={email} autoComplete="email" placeholder="you@company.com"
                    onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                    aria-invalid={status === 'error'}
                    className={`w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/60 focus:border-accent/70 focus:shadow-[0_0_0_4px_rgba(255,122,47,.12)] ${status === 'error' ? 'border-red-400/70' : 'border-white/10'}`}
                  />
                  <AnimatePresence>
                    {status === 'error' && (
                      <m.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mt-1.5 text-xs text-red-300" role="alert">
                        {/^\S+@\S+\.\S+$/.test(email) ? 'Something went wrong. Please try again.' : 'Enter a valid email address.'}
                      </m.p>
                    )}
                  </AnimatePresence>
                </m.div>
                <div>
                  <label className="mb-1 block text-xs text-white/60" htmlFor="wl-name">Name <span className="text-white/60">(optional)</span></label>
                  <input id="wl-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ada Lovelace"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-white/60 focus:border-accent/70 focus:shadow-[0_0_0_4px_rgba(255,122,47,.12)]" />
                </div>
              </m.div>

              <m.fieldset {...enter(4)} className="mt-5">
                <legend className="mb-2 text-xs text-white/60">What will you rebuild first?</legend>
                <div className="flex flex-wrap gap-2">
                  {uses.map((u) => (
                    <button key={u} type="button" onClick={() => setUse(u)} aria-pressed={use === u}
                      className={`relative rounded-full border px-3.5 py-1.5 text-xs transition-[color,border-color,background-color,transform] duration-150 active:scale-[0.97] ${use === u ? 'border-accent/60 bg-accent/15 text-white' : 'border-white/10 text-white/60 hover:border-white/25 hover:text-white'}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </m.fieldset>

              <m.fieldset {...enter(5)} className="mt-5">
                <legend className="mb-2 text-xs text-white/60">Platform</legend>
                <div className="relative grid grid-cols-3 rounded-full border border-white/10 bg-white/[0.04] p-1 text-xs">
                  {platforms.map((p) => (
                    <button key={p} type="button" onClick={() => setPlatform(p)} aria-pressed={platform === p} className="relative z-10 rounded-full py-1.5 transition-colors duration-150">
                      {platform === p && <m.span layoutId="wl-platform" transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }} className="absolute inset-0 -z-10 rounded-full bg-white/15" />}
                      <span className={platform === p ? 'text-white' : 'text-white/55'}>{p}</span>
                    </button>
                  ))}
                </div>
              </m.fieldset>

              <m.div {...enter(6)}>
                <m.button
                  type="submit" disabled={status === 'sending'} whileTap={reduce ? undefined : { scale: 0.97 }} transition={{ duration: 0.12 }}
                  className="group relative mt-6 flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#ff9a4d] to-[#ff6a1f] py-3 text-sm font-medium text-black shadow-[0_0_0_5px_rgba(255,122,47,.12),0_10px_40px_rgba(255,122,47,.3)] disabled:opacity-80"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {status === 'sending' ? (
                      <m.span key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/30 border-t-black" /> Joining…
                      </m.span>
                    ) : (
                      <m.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>Join the waitlist</m.span>
                    )}
                  </AnimatePresence>
                </m.button>
                <p className="mt-3 text-center text-[11px] text-white/60">By joining you agree to our <a href="/privacy" className="underline hover:text-white/60">Privacy Policy</a>.</p>
              </m.div>
            </m.form>
          )}
        </AnimatePresence>
      </m.div>
    </m.div>
  )
}

const stages = ['Inspecting reference', 'Mapping pages and components', 'Building project', 'Ready for review']
const URL_TEXT = 'example.com'

// Wireframe blocks: [className, delay-in (outline), accent?]
const blocks: { cls: string; accent?: boolean }[] = [
  { cls: 'h-3 w-8 rounded' }, { cls: 'ml-auto h-2 w-10 rounded' }, { cls: 'h-2 w-10 rounded' }, { cls: 'h-4 w-12 rounded-full', accent: true },
  { cls: 'h-4 w-3/4 rounded' }, { cls: 'h-4 w-1/2 rounded' }, { cls: 'h-2 w-2/3 rounded' }, { cls: 'h-5 w-16 rounded-full', accent: true },
  { cls: 'h-12 rounded-md' }, { cls: 'h-12 rounded-md', accent: true }, { cls: 'h-12 rounded-md' },
]

function Success({ email, reduce, onClose }: { email: string; reduce: boolean; onClose: () => void }) {
  const [stage, setStage] = useState(reduce ? stages.length - 1 : 0)
  const [typed, setTyped] = useState(reduce ? URL_TEXT : '')

  useEffect(() => {
    if (reduce) return
    const timers = [0.8, 1.6, 2.5].map((t, i) => setTimeout(() => setStage(i + 1), t * 1000))
    let n = 0
    const type = setInterval(() => {
      n += 1
      setTyped(URL_TEXT.slice(0, n))
      if (n >= URL_TEXT.length) clearInterval(type)
    }, 55)
    return () => { timers.forEach(clearTimeout); clearInterval(type) }
  }, [reduce])

  const outline = (i: number) => 0.35 + i * 0.09      // dashed "reference" appears as it's inspected
  const fill = (i: number) => 1.5 + i * 0.07           // then gets rebuilt, solid

  // Layout: nav row (4), hero (4), cards row (3)
  const nav = blocks.slice(0, 4), hero = blocks.slice(4, 8), cards = blocks.slice(8)
  const block = (b: { cls: string; accent?: boolean }, i: number) => (
    <m.i
      key={i}
      className={`block shrink-0 border ${b.cls} ${b.cls.includes('h-12') ? 'flex-1' : ''}`}
      initial={reduce ? false : { opacity: 0, transform: 'translateY(6px) scale(0.96)', backgroundColor: 'rgba(255,255,255,0)', borderColor: 'rgba(255,255,255,0.25)', borderStyle: 'dashed' }}
      animate={{
        opacity: 1, transform: 'translateY(0px) scale(1)',
        backgroundColor: b.accent ? 'rgba(255,122,47,0.9)' : 'rgba(255,255,255,0.14)',
        borderColor: b.accent ? 'rgba(255,154,77,1)' : 'rgba(255,255,255,0.14)',
        borderStyle: 'solid',
      }}
      transition={reduce ? { duration: 0 } : {
        opacity: { duration: 0.25, delay: outline(i) },
        transform: { duration: 0.35, ease: EASE, delay: outline(i) },
        backgroundColor: { duration: 0.35, delay: fill(i) },
        borderColor: { duration: 0.35, delay: fill(i) },
        borderStyle: { duration: 0, delay: fill(i) },
      }}
    />
  )

  return (
    <m.div initial={{ opacity: 0, y: reduce ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="relative text-center">
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">URL → reality</p>

      {/* Mini browser: the reference is inspected, then rebuilt */}
      <m.div
        className="relative mx-auto mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/50 text-left"
        initial={false}
        animate={reduce ? undefined : { boxShadow: ['0 0 0 rgba(255,122,47,0)', '0 0 50px rgba(255,122,47,0.35)', '0 0 24px rgba(255,122,47,0.15)'] }}
        transition={{ duration: 1.2, delay: 2.5, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <span className="flex gap-1">{[0, 1, 2].map((d) => <i key={d} className="h-1.5 w-1.5 rounded-full bg-white/25" />)}</span>
          <span className="flex-1 truncate rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/60">https://{typed}{typed.length < URL_TEXT.length && <span className="ml-px inline-block h-2.5 w-px animate-pulse bg-white/70 align-middle" />}</span>
        </div>
        <div className="relative h-[168px] space-y-3 p-3">
          <div className="flex items-center gap-2">{nav.map(block)}</div>
          <div className="space-y-2 pt-1">
            {hero.slice(0, 3).map((b, k) => block(b, k + 4))}
            {block(hero[3], 7)}
          </div>
          <div className="flex gap-2">{cards.map((b, k) => block(b, k + 8))}</div>
          {/* Inspection scan line */}
          {!reduce && (
            <m.i aria-hidden className="pointer-events-none absolute inset-x-0 top-0 block h-px bg-accent shadow-[0_0_14px_3px_rgba(255,122,47,.7)]"
              initial={{ opacity: 0, transform: 'translateY(0px)' }}
              animate={{ opacity: [0, 1, 1, 0], transform: ['translateY(0px)', 'translateY(0px)', 'translateY(166px)', 'translateY(166px)'] }}
              transition={{ duration: 1.5, delay: 0.3, times: [0, 0.08, 0.92, 1], ease: 'easeInOut' }} />
          )}
        </div>
      </m.div>

      {/* Product progress labels */}
      <div className="mx-auto mt-4 max-w-[19rem]">
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <m.div className="h-full origin-left rounded-full bg-gradient-to-r from-[#ff9a4d] to-[#ff6a1f]"
            initial={{ transform: reduce ? 'scaleX(1)' : 'scaleX(0)' }} animate={{ transform: 'scaleX(1)' }} transition={{ duration: 2.7, ease: 'linear' }} />
        </div>
        <div className="relative mt-2 h-4 text-xs text-white/60">
          <AnimatePresence mode="wait" initial={false}>
            <m.span key={stage} initial={{ opacity: 0, y: reduce ? 0 : 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              className={`absolute inset-x-0 ${stage === stages.length - 1 ? 'text-accent' : ''}`}>
              {stages[stage]}{stage < stages.length - 1 && '…'}
            </m.span>
          </AnimatePresence>
        </div>
      </div>

      <m.div initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 2.6 }}>
        <h2 id="wl-title" className="mt-6 text-3xl font-medium">You’re on the list.</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-white/60">We’ll email <b className="font-medium text-white/80">{email}</b> when the Rebuildr beta opens.</p>
        <button onClick={onClose} className="mt-6 rounded-full border border-white/15 px-6 py-2.5 text-sm transition-[background-color,transform] duration-150 hover:bg-white/10 active:scale-[0.97]">Back to site</button>
      </m.div>
    </m.div>
  )
}
