import { findUserByEmail, generateId, getCurrentUser as getLocalCurrentUser, setCurrentUser, upsertUser } from "@/lib/local-db"

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export interface Profile {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export class ClientAuth {
  private static instance: ClientAuth

  static getInstance(): ClientAuth {
    if (!ClientAuth.instance) {
      ClientAuth.instance = new ClientAuth()
    }
    return ClientAuth.instance
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    const existing = findUserByEmail(email)
    if (!existing || (existing.password && existing.password !== password)) {
      return { user: null, error: "Invalid credentials" }
    }
    setCurrentUser(existing)
    const user: User = { id: existing.id, email: existing.email, name: existing.name, avatar_url: existing.avatar_url }
    return { user, error: null }
  }

  async signUp(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const existing = findUserByEmail(email)
      if (existing) return { user: null, error: "User already exists" }
      const id = generateId()
      const newUser = { id, email, name: displayName || email.split("@")[0], password }
      upsertUser(newUser)
      setCurrentUser(newUser)
      const user: User = { id, email, name: newUser.name }
      return { user, error: null }
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : "An error occurred" }
    }
  }

  async signOut(): Promise<void> {
    setCurrentUser(null)
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = getLocalCurrentUser()
      if (!user) return null
      return { id: user.id, email: user.email, name: user.name, avatar_url: user.avatar_url }
    } catch (error) {
      return null
    }
  }
}

export const auth = ClientAuth.getInstance()
