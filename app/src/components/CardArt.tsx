export default function CardArt({ title, hue, className = '' }: { title: string; hue: number; className?: string }) {
  return (
    <div
      className={`flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-lg p-3 text-black ${className}`}
      style={{ background: `linear-gradient(145deg, hsl(${hue} 90% 62%), hsl(${(hue + 50) % 360} 85% 45%))` }}
    >
      <div className="mb-auto h-8 w-8 rounded-full bg-white/50" />
      <b className="text-sm leading-tight">{title}</b>
      <i className="mt-1 block h-1.5 w-10 rounded bg-black/40" />
    </div>
  )
}
