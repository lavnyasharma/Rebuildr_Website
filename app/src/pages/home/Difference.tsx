import Reveal from '../../components/Reveal'
import CardArt from '../../components/CardArt'

const layers = ['app/layout.tsx', 'components/Header.tsx', 'components/Hero.tsx', 'components/PricingCards.tsx', 'tailwind.config.ts']

export default function Difference() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-32">
      <Reveal className="text-center">
        <p className="text-[10px] uppercase tracking-widest text-white/60">The difference</p>
        <h2 className="mt-3 text-4xl font-medium md:text-5xl">Screenshots give you a picture.<br />We give you a project.</h2>
        <p className="mt-3 text-white/60">A screenshot-to-code snippet is where your work starts. A project you can run, read and extend is where it ends.</p>
      </Reveal>
      <div className="mt-14 grid gap-6 md:grid-cols-2 [&>*]:min-w-0">
        <Reveal>
          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg">One long file.</h3>
            <p className="text-sm text-white/60">Pixel-matched, but hard to maintain.</p>
            <CardArt title="index.html" hue={200} className="mx-auto mt-6 w-56" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg">A real codebase.</h3>
            <p className="text-sm text-white/60">Reusable components, routes, ready to run.</p>
            <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:gap-6">
              <CardArt title="Next.js app" hue={20} className="w-40" />
              <ul className="w-full min-w-0 flex-1 space-y-2 text-sm">
                <li className="text-xs uppercase tracking-widest text-white/60">Project files</li>
                {layers.map((l) => (
                  <li key={l} className="truncate rounded-lg border border-white/10 px-3 py-1.5 transition-colors hover:bg-white/10">{l}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
