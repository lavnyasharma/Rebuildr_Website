import { SITE } from './data/site'
import { faqs } from './data/faqs'

export type RouteMeta = { path: string; title: string; description: string; priority: string }

export const routes: RouteMeta[] = [
  {
    path: '/',
    title: 'Rebuildr – URL to Website Creator | AI Website Builder for Any URL',
    description:
      'Rebuildr is a URL to website creator for macOS and Windows. Paste a URL and get a clean, editable Next.js + Tailwind project that runs locally and is checked in a real browser.',
    priority: '1.0',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Rebuildr',
    description: 'How Rebuildr handles your data. Projects are generated locally and stay on your computer by default.',
    priority: '0.3',
  },
  {
    path: '/terms',
    title: 'Terms of Service | Rebuildr',
    description: 'The terms for using the Rebuildr website and desktop app, including rules for rebuilding websites you have permission to reproduce.',
    priority: '0.3',
  },
]

export const metaFor = (path: string) => routes.find((r) => r.path === path) ?? routes[0]
export const absolute = (p: string) => `${SITE.url.replace(/\/$/, '')}${p}`

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function jsonLd(path: string) {
  if (path !== '/') return []
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE.name,
      url: absolute('/'),
      logo: absolute('/brand/app-icon.png'),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      url: absolute('/'),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE.name,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'macOS, Windows',
      description: metaFor('/').description,
      url: absolute('/'),
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/PreOrder' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.title, acceptedAnswer: { '@type': 'Answer', text: f.body } })),
    },
  ]
}

/** HTML for <head> (prerender). The client keeps title/description in sync on navigation via useSeo. */
export function headHtml(path: string) {
  const m = metaFor(path)
  const url = absolute(path === '/' ? '/' : path)
  const img = absolute(SITE.ogImage)
  const tags = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta name="robots" content="index,follow,max-image-preview:large" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE.name}" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${img}" />`,
    `<meta property="og:image:alt" content="Rebuildr logo: from URL to reality" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.description)}" />`,
    `<meta name="twitter:image" content="${img}" />`,
    ...jsonLd(path).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ]
  return tags.join('\n    ')
}
