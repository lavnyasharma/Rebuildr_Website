import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWaitlist } from './WaitlistProvider'

type Props = { to?: string; waitlist?: boolean; variant?: 'dark' | 'accent'; children: ReactNode; className?: string }

// Landing page only: `to` is an in-page anchor (or external href).
export default function Button({ to = '#', waitlist, variant = 'dark', children, className = '' }: Props) {
  const { pathname } = useLocation()
  const { open } = useWaitlist()
  const base =
    'relative inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium sm:min-h-0 transition-transform duration-200 hover:scale-[1.04] active:scale-95'
  const styles =
    variant === 'accent'
      ? 'bg-gradient-to-b from-[#ff9a4d] to-[#ff6a1f] text-black shadow-[0_0_0_5px_rgba(255,122,47,.12),0_0_30px_rgba(255,122,47,.35)]'
      : 'bg-gradient-to-b from-white/15 to-white/[0.03] text-white shadow-[0_0_0_5px_rgba(255,255,255,.06)] hover:bg-white/10'
  return (
    <>
      {waitlist ? (
        <button type="button" onClick={() => open()} className={`${base} ${styles} ${className}`}>{children}</button>
      ) : to.startsWith('#') && pathname !== '/' ? (
        <Link to={`/${to}`} className={`${base} ${styles} ${className}`}>{children}</Link>
      ) : (
        <a href={to} className={`${base} ${styles} ${className}`}>{children}</a>
      )}
    </>
  )
}
