import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export interface User {
  id: string
  email: string
  display_name?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface AuthResponse {
  user: User | null
  error: string | null
}

export class SupabaseAuth {
  private static instance: SupabaseAuth

  static getInstance(): SupabaseAuth {
    if (!SupabaseAuth.instance) {
      SupabaseAuth.instance = new SupabaseAuth()
    }
    return SupabaseAuth.instance
  }

  async signUp(
    email: string,
    password: string,
    displayName?: string
  ): Promise<AuthResponse> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          display_name: data.user.user_metadata?.display_name,
          avatar_url: data.user.user_metadata?.avatar_url,
        }
        return { user, error: null }
      }

      return { user: null, error: 'Failed to create user' }
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        // Get user profile from our custom table
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
          created_at: profile?.created_at,
          updated_at: profile?.updated_at,
        }
        return { user, error: null }
      }

      return { user: null, error: 'Failed to sign in' }
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      }
    }
  }

  async signOut(): Promise<void> {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const supabase = createClient()
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return null
      }

      // Get user profile from our custom table
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        id: user.id,
        email: user.email!,
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
        created_at: profile?.created_at,
        updated_at: profile?.updated_at,
      }
    } catch (error) {
      return null
    }
  }

  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { user: null, error: 'Not authenticated' }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          display_name: updates.display_name,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        return { user: null, error: error.message }
      }

      const updatedUser: User = {
        id: user.id,
        email: user.email!,
        display_name: data.display_name,
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }

      return { user: updatedUser, error: null }
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'An error occurred' 
      }
    }
  }

  // Server-side method to get current user
  async getCurrentUserServer(): Promise<User | null> {
    try {
      const supabase = createServerClient()
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        return null
      }

      // Get user profile from our custom table
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        id: user.id,
        email: user.email!,
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
        created_at: profile?.created_at,
        updated_at: profile?.updated_at,
      }
    } catch (error) {
      return null
    }
  }
}

export const supabaseAuth = SupabaseAuth.getInstance()


