# Rebuildr: marketing website

The landing page for **Rebuildr**, a desktop app (macOS and Windows) that turns a website URL into a locally running Next.js + TypeScript + Tailwind CSS project. *From URL to reality.*

This repository contains the marketing site only. The desktop app lives elsewhere.

- Single landing page (`/`) plus `/privacy` and `/terms`
- Scroll-driven hero, pinned "how it works" scene, comparison, pricing, FAQ
- Waitlist modal with an animated success state
- Prerendered to static HTML, with full SEO metadata and structured data
- Consent-gated Google Analytics 4
- Mobile-first: checked down to 320 px wide

> The visual design is an original recreation inspired by a reference site. It contains no third-party fonts, images, logos or copy. All brand assets in `app/public/brand/` are Rebuildr's own.

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | React 19 + TypeScript, built with Vite |
| Styling | Tailwind CSS v4 |
| Motion | Framer Motion (`LazyMotion`), Lenis smooth scroll |
| Routing | React Router |
| Rendering | Static prerender at build time (`vite build --ssr` + `scripts/prerender.mjs`), hydrated on the client |
| Font | Inter Variable, self-hosted via `@fontsource-variable/inter` |
| Analytics | Google Analytics 4 (loads only after consent) |

## Getting started

Requires Node.js 20 or newer.

```bash
cd app
npm install
npm run dev
```

The dev server runs at http://localhost:5173.

## Scripts

Run these from `app/`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck, build the client, build the SSR bundle, then prerender every route into `dist/` and write `sitemap.xml` and `robots.txt` |
| `npm run preview` | Serve the production build at http://localhost:4173 |
| `npm run lint` | Lint with oxlint |

## Configuration

Copy `app/.env.example` to `.env` (or `.env.production`) and set:

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Public origin, used for canonical URLs, the sitemap, `robots.txt` and social tags. Defaults to `https://rebuildr.app`, **a placeholder: set your real domain before launch** |
| `VITE_GA_MEASUREMENT_ID` | GA4 measurement ID (`G-XXXXXXXXXX`). Leave empty to disable analytics and the consent bar |
| `VITE_WAITLIST_ENDPOINT` | URL that accepts a JSON `POST` of waitlist signups. With no endpoint, entries are only kept in the visitor's own `localStorage` (useful for testing, but you will receive nothing) |

Measurement IDs are public (they appear in page source), so committing `.env` with the GA ID is fine. Never put secrets in `VITE_*` variables: they are bundled into the client.

## Before you launch

- [ ] Fill in the company details in `app/src/data/legal.ts` (legal entity, address, contact email, governing law). They render in the Privacy Policy and Terms. Have both documents reviewed by a lawyer.
- [ ] Set `VITE_SITE_URL` to the real domain, and update the GA stream URL in Analytics if it differs.
- [ ] Connect the waitlist: set `VITE_WAITLIST_ENDPOINT`.
- [ ] Replace `app/public/brand/og-image.png` with a designed 1200×630 social card if you want a stronger link preview.
- [ ] Re-run Lighthouse against the deployed URL.

## Project structure

```
app/
  index.html              Document shell (head placeholders filled at prerender time)
  scripts/prerender.mjs   Prerender routes, inline CSS, write sitemap.xml + robots.txt
  public/
    brand/                Rebuildr logos, icons, social image
    manifest.webmanifest
  src/
    main.tsx              Client entry (hydrates prerendered HTML)
    entry-server.tsx      SSR entry used by the prerender step
    App.tsx               Providers, routes
    seo.ts                Per-route titles/descriptions + JSON-LD structured data
    useSeo.ts             Keeps title/description in sync on client navigation
    pages/
      Home.tsx            Section order for the landing page
      home/               Hero, ScrollTunnel, HowItWorks, Difference,
                          Capabilities, Compare, PricingSection, Testimonials
      Privacy.tsx, Terms.tsx, Legal.tsx
    components/           Header, Footer, Button, Logo, Accordion, Reveal,
                          WaitlistProvider/Modal, Analytics (consent bar), SmoothScroll
    data/                 site.ts, faqs.ts (also feeds FAQ structured data), legal.ts, cards.ts
    lib/                  analytics.ts, waitlist.ts, lenis.ts
```

## How it works

### Prerendering and SEO

`npm run build` renders each route to static HTML, so crawlers get real content, titles, canonical URLs, Open Graph and Twitter tags, and JSON-LD (Organization, WebSite, SoftwareApplication, FAQPage). The CSS is inlined and the primary font is preloaded. The client then hydrates the page.

To add a route: add it to `routes` in `src/seo.ts` (this drives the prerender and sitemap), then add its `<Route>` in `src/App.tsx`.

### Analytics and consent

`src/lib/analytics.ts` loads GA4 only after the visitor clicks **Accept** in the consent bar (`src/components/Analytics.tsx`). Declining loads nothing from Google. Events sent: `page_view` (on route change), `waitlist_open`, and `generate_lead` on signup, with no personal data. The Privacy Policy describes this behaviour, so keep the two in sync if you change it.

### Waitlist

`WaitlistProvider` exposes `useWaitlist().open()`. The modal (`WaitlistModal.tsx`) is lazy-loaded so its animation code stays out of the initial bundle. Submission goes through `src/lib/waitlist.ts`.

### Mobile

Pinned scroll scenes use `svh` units, safe-area padding protects the notch and home indicator, tap targets are about 44 px on touch screens, and inputs are 16 px to prevent iOS zoom. Some scenes simplify on phones: the Features section flows normally and the comparison table becomes a switchable card. `prefers-reduced-motion` is respected.

## Deployment

The build output is a static site in `app/dist/`, so any static host works (Netlify, Vercel, Cloudflare Pages, S3 + CDN, and so on).

- **Build command:** `npm run build` (run in `app/`)
- **Publish directory:** `app/dist`
- Set the environment variables above in your host's settings.
- `/`, `/privacy` and `/terms` are real HTML files. Configure unknown paths to fall back to `index.html` (a standard SPA rewrite) if you want other URLs to load the app.

## Performance

Lighthouse results on the production build, measured locally at the time of writing: desktop 100 / 100 / 100 / 100 (Performance, Accessibility, Best Practices, SEO); mobile 96 to 98 Performance with 100 / 100 / 100 for the rest. Mobile Performance varies with simulated network conditions, so treat these as indicative and re-test on your deployed URL.

## Browser support

Modern evergreen browsers. Real-device testing on iOS Safari and Android Chrome is recommended before launch: sticky hover, safe areas, the URL bar and keyboard behaviour cannot be fully verified in desktop emulation.

## License

All rights reserved. Add a `LICENSE` file before making this repository public or accepting contributions.
