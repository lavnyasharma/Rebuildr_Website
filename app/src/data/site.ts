// Production origin. Set VITE_SITE_URL at build time; replace the fallback with your real domain.
export const SITE = {
  url: (import.meta.env?.VITE_SITE_URL as string | undefined) ?? 'https://rebuildr.app',
  name: 'Rebuildr',
  tagline: 'From URL to reality',
  ogImage: '/brand/og-image.png',
}
