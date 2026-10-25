import type Lenis from 'lenis'

// Shared handle so overlays can pause smooth scrolling while open.
export const scroller: { current: Lenis | null } = { current: null }
