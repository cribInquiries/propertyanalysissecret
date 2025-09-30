// Simple local storage utilities to replace backend dependencies

type JsonValue = any

const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined"

function getStorage(): Storage | null {
  if (!isBrowser) return null
  return window.localStorage
}

export function readJson<T = JsonValue>(key: string, fallback: T): T {
  const storage = getStorage()
  if (!storage) return fallback
  try {
    const raw = storage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson<T = JsonValue>(key: string, value: T): void {
  const storage = getStorage()
  if (!storage) return
  storage.setItem(key, JSON.stringify(value))
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export interface LocalUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
  password?: string
}

const CURRENT_USER_KEY = "current_user_id"
const USERS_KEY = "local_users"

export function getCurrentUser(): LocalUser | null {
  const storage = getStorage()
  if (!storage) return null
  const userId = storage.getItem(CURRENT_USER_KEY)
  if (!userId) return null
  const users = readJson<Record<string, LocalUser>>(USERS_KEY, {})
  return users[userId] || null
}

export function setCurrentUser(user: LocalUser | null): void {
  const storage = getStorage()
  if (!storage) return
  if (user) {
    storage.setItem(CURRENT_USER_KEY, user.id)
  } else {
    storage.removeItem(CURRENT_USER_KEY)
  }
}

export function upsertUser(user: LocalUser): void {
  const users = readJson<Record<string, LocalUser>>(USERS_KEY, {})
  users[user.id] = user
  writeJson(USERS_KEY, users)
}

export function findUserByEmail(email: string): LocalUser | null {
  const users = readJson<Record<string, LocalUser>>(USERS_KEY, {})
  const match = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase())
  return match || null
}

export function getOrCreateAnonUser(): LocalUser {
  const existing = getCurrentUser()
  if (existing) return existing
  const anon: LocalUser = {
    id: "anon",
    email: "guest@example.com",
    name: "Guest",
  }
  upsertUser(anon)
  setCurrentUser(anon)
  return anon
}


