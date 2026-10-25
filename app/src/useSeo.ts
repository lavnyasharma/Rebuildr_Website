import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { absolute, metaFor } from './seo'

// Keeps title, description and canonical correct after client-side navigation.
export function useSeo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const m = metaFor(pathname)
    document.title = m.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', m.description)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', absolute(pathname))
  }, [pathname])
}
