// Prerenders every route to static HTML (with full <head> + structured data), and writes robots/sitemap.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = new URL('../dist/', import.meta.url).pathname
const serverDir = new URL('../dist-server/', import.meta.url).pathname

const entry = (await readdir(serverDir)).find((f) => f.startsWith('entry-server') && f.endsWith('.js'))
const { render, routes, headHtml, absolute } = await import(pathToFileURL(join(serverDir, entry)).href)

let template = await readFile(join(dist, 'index.html'), 'utf8')
// Inline the (small) stylesheet so first paint doesn't wait on a CSS request.
const cssLink = template.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/)
if (cssLink) {
  const css = await readFile(join(dist, cssLink[1]), 'utf8')
  template = template.replace(cssLink[0], `<style>${css}</style>`)
}
const assets = await readdir(join(dist, 'assets'))
// Preload the Latin variable font so text paints without a layout-shifting swap.
const font = assets.find((f) => /inter-latin-wght-normal.*\.woff2$/.test(f))
const preload = font ? `<link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin />\n    ` : ''

for (const r of routes) {
  const html = template
    .replace('<title>Rebuildr – URL to Website Creator</title>', '')
    .replace('<!--seo-head-->', preload + headHtml(r.path))
    .replace('<!--app-html-->', render(r.path))
  const dir = r.path === '/' ? dist : join(dist, r.path)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'index.html'), html)
  console.log('prerendered', r.path)
}

const today = new Date().toISOString().slice(0, 10)
await writeFile(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    routes.map((r) => `  <url><loc>${absolute(r.path)}</loc><lastmod>${today}</lastmod><priority>${r.priority}</priority></url>`).join('\n') +
    `\n</urlset>\n`,
)
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`)
console.log('wrote sitemap.xml and robots.txt')
