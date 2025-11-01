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
        // Ensure profile is created (trigger might not have fired or might not exist)
        const displayNameValue = displayName || email.split('@')[0]
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!existingProfile) {
          // Create profile if it doesn't exist
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              display_name: displayNameValue,
              avatar_url: data.user.user_metadata?.avatar_url,
            })

          if (profileError) {
            console.error('Failed to create user profile:', profileError)
            // Continue anyway, as the auth user was created
          }
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          display_name: displayNameValue,
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

      if (data.user && data.session) {
        // Verify session is properly set by checking user
        const { data: { user: verifiedUser }, error: verifyError } = await supabase.auth.getUser()
        
        if (verifyError || !verifiedUser) {
          console.error('Session verification failed:', verifyError)
          return { user: null, error: 'Session could not be established' }
        }

        // Get user profile from our custom table (use maybeSingle to handle missing profiles)
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        // If profile doesn't exist, create it
        if (!profile && !profileError) {
          const displayName = data.user.user_metadata?.display_name || email.split('@')[0]
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              display_name: displayName,
              avatar_url: data.user.user_metadata?.avatar_url,
            })

          if (insertError) {
            console.error('Failed to create user profile:', insertError)
            // Continue with basic user info even if profile creation fails
          } else {
            // Fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle()

            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              display_name: newProfile?.display_name || displayName,
              avatar_url: newProfile?.avatar_url,
              created_at: newProfile?.created_at,
              updated_at: newProfile?.updated_at,
            }
            return { user, error: null }
          }
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          display_name: profile?.display_name || data.user.user_metadata?.display_name || email.split('@')[0],
          avatar_url: profile?.avatar_url || data.user.user_metadata?.avatar_url,
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

      // Get user profile from our custom table (use maybeSingle to handle missing profiles)
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      // If profile doesn't exist, create it
      if (!profile && !profileError) {
        const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email!,
            display_name: displayName,
            avatar_url: user.user_metadata?.avatar_url,
          })

        if (!insertError) {
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

          return {
            id: user.id,
            email: user.email!,
            display_name: newProfile?.display_name || displayName,
            avatar_url: newProfile?.avatar_url,
            created_at: newProfile?.created_at,
            updated_at: newProfile?.updated_at,
          }
        }
      }

      return {
        id: user.id,
        email: user.email!,
        display_name: profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0],
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        created_at: profile?.created_at,
        updated_at: profile?.updated_at,
      }
    } catch (error) {
      console.error('Error getting current user:', error)
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

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      let data
      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email!,
            display_name: updates.display_name || user.user_metadata?.display_name || user.email?.split('@')[0],
            avatar_url: updates.avatar_url || user.user_metadata?.avatar_url,
          })
          .select()
          .single()

        if (insertError) {
          return { user: null, error: insertError.message }
        }
        data = newProfile
      } else {
        // Update existing profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            display_name: updates.display_name,
            avatar_url: updates.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single()

        if (updateError) {
          return { user: null, error: updateError.message }
        }
        data = updatedProfile
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

      // Get user profile from our custom table (use maybeSingle to handle missing profiles)
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      // If profile doesn't exist, create it
      if (!profile && !profileError) {
        const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email!,
            display_name: displayName,
            avatar_url: user.user_metadata?.avatar_url,
          })

        if (!insertError) {
          // Fetch the newly created profile
          const { data: newProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

          return {
            id: user.id,
            email: user.email!,
            display_name: newProfile?.display_name || displayName,
            avatar_url: newProfile?.avatar_url,
            created_at: newProfile?.created_at,
            updated_at: newProfile?.updated_at,
          }
        }
      }

      return {
        id: user.id,
        email: user.email!,
        display_name: profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0],
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        created_at: profile?.created_at,
        updated_at: profile?.updated_at,
      }
    } catch (error) {
      console.error('Error getting current user (server):', error)
      return null
    }
  }
}

export const supabaseAuth = SupabaseAuth.getInstance()


