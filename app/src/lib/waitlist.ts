export type WaitlistEntry = { email: string; name: string; use: string; platform: 'macOS' | 'Windows' | 'Both' }

// Set VITE_WAITLIST_ENDPOINT to POST entries to your backend/form service (JSON body).
// With no endpoint configured, entries are kept in localStorage so the flow can be tested.
export async function submitWaitlist(entry: WaitlistEntry): Promise<void> {
  const endpoint = import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined
  if (endpoint) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...entry, submittedAt: new Date().toISOString() }),
    })
    if (!res.ok) throw new Error('Request failed')
    return
  }
  await new Promise((r) => setTimeout(r, 900))
  try {
    const list = JSON.parse(localStorage.getItem('rebuildr-waitlist') ?? '[]')
    list.push({ ...entry, submittedAt: new Date().toISOString() })
    localStorage.setItem('rebuildr-waitlist', JSON.stringify(list))
  } catch {
    /* storage unavailable: still resolve in dev mode */
  }
}
