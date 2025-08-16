import fs from "fs"
import path from "path"

export type FollowupSession = {
  sessionId: string
  cv: any
  gaps?: any
  asked: Array<{ id: string; target: string }>
  answers: Record<string, any>
  createdAt: string
  updatedAt: string
}

const BASE = path.join(process.cwd(), "data")
const SESS_DIR = path.join(BASE, "sessions")

function ensureDir() {
  try {
    fs.mkdirSync(SESS_DIR, { recursive: true })
  } catch {}
}

function safePath(file: string) {
  const p = path.join(SESS_DIR, file)
  const resolved = path.resolve(p)
  if (!resolved.startsWith(SESS_DIR)) throw new Error("Path escape detected")
  return resolved
}

function randomId() {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function createSession(
  initial: Omit<FollowupSession, "sessionId" | "createdAt" | "updatedAt">
): FollowupSession {
  ensureDir()
  const sessionId = randomId()
  const now = new Date().toISOString()
  const sess: FollowupSession = {
    sessionId,
    createdAt: now,
    updatedAt: now,
    ...initial
  }
  const file = safePath(`${sessionId}.json`)
  fs.writeFileSync(file, JSON.stringify(sess, null, 2), "utf8")
  return sess
}

export function getSession(sessionId: string): FollowupSession | null {
  ensureDir()
  if (!/^[\w-]+$/.test(sessionId)) return null
  const file = safePath(`${sessionId}.json`)
  try {
    const raw = fs.readFileSync(file, "utf8")
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function updateSession(
  sessionId: string,
  patch: Partial<FollowupSession>
): FollowupSession | null {
  const existing = getSession(sessionId)
  if (!existing) return null
  const merged: FollowupSession = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString()
  }
  const file = safePath(`${sessionId}.json`)
  fs.writeFileSync(file, JSON.stringify(merged, null, 2), "utf8")
  return merged
}
