import { createHash, randomBytes, randomUUID } from 'node:crypto'

const SESSION_COOKIE = 'perfil-session-id'

export interface SessionContext { id: string; seed: string; random: () => number }

function createRandom(seed: string) {
  let state = createHash('sha256').update(seed).digest().readUInt32BE(0) || 1
  return () => { state = (Math.imul(1664525, state) + 1013904223) >>> 0; return state / 0x100000000 }
}

export function createSessionContext(id: string = randomUUID(), seed = randomBytes(32).toString('hex')): SessionContext {
  return { id, seed, random: createRandom(`${id}:${seed}`) }
}

export function getSessionContext(event: Parameters<typeof getCookie>[0]) {
  const existingId = getCookie(event, SESSION_COOKIE)
  const context = createSessionContext(existingId || undefined)
  if (!existingId) setCookie(event, SESSION_COOKIE, context.id, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 30, path: '/' })
  return context
}
