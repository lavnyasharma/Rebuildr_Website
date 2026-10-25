// Google Analytics 4, loaded only after the visitor accepts analytics.
// Set VITE_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX) at build time. With no ID, nothing loads and no banner shows.
export const GA_ID = import.meta.env?.VITE_GA_MEASUREMENT_ID as string | undefined

const KEY = 'rebuildr-analytics-consent'
type Consent = 'granted' | 'denied' | null

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'granted' || v === 'denied' ? v : null
  } catch {
    return null
  }
}

export function setConsent(v: 'granted' | 'denied') {
  try {
    localStorage.setItem(KEY, v)
  } catch {
    /* storage unavailable: choice just won't persist */
  }
  if (v === 'granted') loadAnalytics()
}

let loaded = false
export function loadAnalytics() {
  if (!GA_ID || loaded || typeof document === 'undefined') return
  loaded = true
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  // SPA: page views are sent manually on route change (see usePageViews)
  window.gtag('config', GA_ID, { send_page_view: false, anonymize_ip: true })
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(s)
  trackPageView()
}

export function trackPageView() {
  if (!loaded) return
  window.gtag('event', 'page_view', { page_path: location.pathname + location.search, page_title: document.title })
}

/** Custom event. Never pass personal data (emails, names). */
export function track(name: string, params?: Record<string, string | number | boolean>) {
  if (!loaded) return
  window.gtag('event', name, params)
}
