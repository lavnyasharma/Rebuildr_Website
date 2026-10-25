import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GA_ID, getConsent, loadAnalytics, setConsent, trackPageView } from '../lib/analytics'

/** Loads GA once consent is stored, reports SPA page views, and shows a minimal consent bar. */
export default function Analytics() {
  const { pathname } = useLocation()
  const [ask, setAsk] = useState(false) // false on the server and first client render, so hydration matches
  const first = useRef(true)

  useEffect(() => {
    if (!GA_ID) return
    const c = getConsent()
    if (c === 'granted') loadAnalytics()
    else if (c === null) setAsk(true)
  }, [])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return // initial page view is sent by loadAnalytics
    }
    trackPageView()
  }, [pathname])

  if (!GA_ID || !ask) return null
  const choose = (v: 'granted' | 'denied') => {
    setConsent(v)
    setAsk(false)
  }
  return (
    <div role="dialog" aria-label="Analytics consent" className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#0b0b0b]/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl sm:bottom-5">
      <p className="text-[13px] leading-snug text-white/70">
        We use Google Analytics to understand how the site is used. It only runs if you accept. <Link to="/privacy#cookies" className="text-white underline">Learn more</Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => choose('denied')} className="min-h-11 flex-1 rounded-full border border-white/15 text-sm text-white/80">Decline</button>
        <button onClick={() => choose('granted')} className="min-h-11 flex-1 rounded-full bg-gradient-to-b from-[#ff9a4d] to-[#ff6a1f] text-sm font-medium text-black">Accept</button>
      </div>
    </div>
  )
}
