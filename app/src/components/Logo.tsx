import { Link } from 'react-router-dom'

// Small pre-cropped assets (see public/brand): the full lockup is only used in the footer.
export function Mark({ className = 'h-5 w-5' }: { className?: string }) {
  return <img src="/brand/mark.png" width={192} height={186} alt="" aria-hidden decoding="async" className={`inline-block object-contain ${className}`} />
}

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" aria-label="Rebuildr home" className={`block py-3 ${className}`}>
      <img src="/brand/logo-header.png" width={150} height={31} alt="Rebuildr" fetchPriority="high" decoding="async" className="h-auto w-[120px] sm:w-[150px]" />
    </Link>
  )
}
