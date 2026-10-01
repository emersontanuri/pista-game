const store = new Map<string, number[]>(); const windowMs = 10 * 60 * 1000
export function checkRateLimit(key: string) { const now = Date.now(); const recent = (store.get(key) || []).filter((x) => now - x < windowMs); if (recent.length >= 10) return false; store.set(key, [...recent, now]); return true }
