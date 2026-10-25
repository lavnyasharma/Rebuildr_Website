import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWaitlist } from './WaitlistProvider'

const cols: Record<string, { label: string; to: string }[]> = {
  Product: [
    { label: 'Features', to: '/#features' },
    { label: 'How it works', to: '/#how-it-works' },
    { label: 'Compare', to: '/#compare' },
    { label: 'Pricing', to: '/#pricing' },
  ],
  Resources: [{ label: 'FAQ', to: '/#faq' }],
  Legal: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
  ],
}
const stack = ['Next.js', 'TypeScript', 'Tailwind CSS', 'React', 'Responsive layouts', 'Reusable components', 'Local dev server', 'Browser checks']

export default function Footer() {
  const { open } = useWaitlist()
  const [email, setEmail] = useState('')
  return (
    <footer id="contact" className="px-5 pb-[env(safe-area-inset-bottom)] pt-20 md:px-11">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,auto)] md:gap-16">
          <div className="max-w-sm">
            <h2 className="text-2xl font-medium">Be first to rebuild.</h2>
            <p className="mt-2 text-sm text-white/60">Rebuildr is in development. Leave your email and we will let you know when the beta opens.</p>
            <form onSubmit={(e) => { e.preventDefault(); open(email) }} className="mt-4 flex gap-2">
              <input type="email" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="glass min-w-0 flex-1 rounded-full bg-transparent px-4 py-2 text-sm outline-none placeholder:text-white/45 focus:border-white/30" />
              <button className="rounded-full bg-gradient-to-b from-[#ff9a4d] to-[#ff6a1f] px-5 py-2 text-sm font-medium text-black">Join</button>
            </form>
          </div>
          {Object.entries(cols).map(([h, links]) => (
            <nav key={h} aria-label={h}>
              <h3 className="mb-4 text-xs uppercase tracking-widest text-white/60">{h}</h3>
              <ul className="text-sm text-white/70">
                {links.map((l) => <li key={l.label}><Link to={l.to} className="block py-3 hover:text-white md:py-1.5">{l.label}</Link></li>)}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-y border-white/10 py-4 text-sm text-white/70">
          <span>English</span>
          <span>Available for macOS and Windows</span>
        </div>

        <img src="/brand/logo-dark-full.webp" width="2000" height="667" loading="lazy" decoding="async" alt="Rebuildr, from URL to reality" className="mx-auto my-6 h-auto w-full max-w-[1100px]" />

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-white/60">
          <span>Copyright © 2026 Rebuildr. All rights reserved</span>
          <span className="hidden md:block">From URL to reality.</span>
        </div>

        <div aria-hidden className="mt-6 overflow-hidden border-t border-white/10 py-6 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <div className="marquee flex w-max gap-16 text-2xl font-medium text-white/60">
            {[...stack, ...stack].map((p, i) => <span key={i}>{p}</span>)}
          </div>
        </div>
      </div>
    </footer>
  )
}
