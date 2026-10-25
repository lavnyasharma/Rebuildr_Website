import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, m } from 'framer-motion'
import Button from './Button'
import Logo from './Logo'

// Only links that scroll to a real section on this page.
const links = [
  ['Features', '#features'],
  ['How it works', '#how-it-works'],
  ['Pricing', '#pricing'],
  ['FAQ', '#faq'],
] as const

export default function Header() {
  const [mobile, setMobile] = useState(false)
  const { pathname } = useLocation()
  const NavLink = ({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) =>
    pathname === '/'
      ? <a href={href} onClick={onClick} className="px-3.5 py-2 text-[15px] text-white/90 transition-colors hover:text-white">{label}</a>
      : <Link to={`/${href}`} onClick={onClick} className="px-3.5 py-2 text-[15px] text-white/90 transition-colors hover:text-white">{label}</Link>
  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] border-b border-white/5 bg-black/70 backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-4 sm:h-[72px] sm:gap-8 sm:px-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([label, href]) => (
            <NavLink key={label} href={href} label={label} />
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <Button waitlist className="!px-4 !py-2 sm:!px-5 sm:!py-2.5">Join<span className="hidden sm:inline">&nbsp;waitlist</span></Button>
          <button aria-label="Menu" onClick={() => setMobile(!mobile)} className="glass flex h-11 w-11 items-center justify-center rounded-full md:hidden">
            <span className="block w-3.5 space-y-1"><i className="block h-px bg-white" /><i className="block h-px bg-white" /><i className="block h-px bg-white" /></span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobile && (
          <m.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass mx-5 rounded-2xl bg-black/90 p-5 md:hidden">
            <ul className="grid grid-cols-2 gap-3 text-sm text-white/80">
              {links.map(([label, href]) => <li key={label}><NavLink href={href} label={label} onClick={() => setMobile(false)} /></li>)}
            </ul>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
