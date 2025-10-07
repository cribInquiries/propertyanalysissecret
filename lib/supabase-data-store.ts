import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

export class SupabaseDataStore {
  private static instance: SupabaseDataStore

  static getInstance(): SupabaseDataStore {
    if (!SupabaseDataStore.instance) {
      SupabaseDataStore.instance = new SupabaseDataStore()
    }
    return SupabaseDataStore.instance
  }

  async saveUserData(userId: string, key: string, data: any): Promise<void> {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_key: key,
          data_value: data,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,data_key'
        })

      if (error) {
        throw new Error(`Failed to save data: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving user data:', error)
      throw error
    }
  }

  async loadUserData<T = any>(userId: string, key: string): Promise<T | null> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('user_data')
        .select('data_value')
        .eq('user_id', userId)
        .eq('data_key', key)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null
        }
        throw new Error(`Failed to load data: ${error.message}`)
      }

      return data?.data_value as T
    } catch (error) {
      console.error('Error loading user data:', error)
      return null
    }
  }

  async deleteUserData(userId: string, key: string): Promise<void> {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('user_data')
        .delete()
        .eq('user_id', userId)
        .eq('data_key', key)

      if (error) {
        throw new Error(`Failed to delete data: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting user data:', error)
      throw error
    }
  }

  async savePropertyAnalysis(userId: string, propertyName: string, analysisData: any): Promise<string> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('property_analyses')
        .insert({
          user_id: userId,
          property_name: propertyName,
          analysis_data: analysisData,
        })
        .select('id')
        .single()

      if (error) {
        throw new Error(`Failed to save property analysis: ${error.message}`)
      }

      return data.id
    } catch (error) {
      console.error('Error saving property analysis:', error)
      throw error
    }
  }

  async loadPropertyAnalysis(analysisId: string): Promise<any | null> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('property_analyses')
        .select('*')
        .eq('id', analysisId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw new Error(`Failed to load property analysis: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error loading property analysis:', error)
      return null
    }
  }

  async loadUserPropertyAnalyses(userId: string): Promise<any[]> {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('property_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to load property analyses: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error loading property analyses:', error)
      return []
    }
  }

  async updatePropertyAnalysis(analysisId: string, updates: any): Promise<void> {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('property_analyses')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', analysisId)

      if (error) {
        throw new Error(`Failed to update property analysis: ${error.message}`)
      }
    } catch (error) {
      console.error('Error updating property analysis:', error)
      throw error
    }
  }

  async deletePropertyAnalysis(analysisId: string): Promise<void> {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('property_analyses')
        .delete()
        .eq('id', analysisId)

      if (error) {
        throw new Error(`Failed to delete property analysis: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting property analysis:', error)
      throw error
    }
  }

  // Server-side methods
  async saveUserDataServer(userId: string, key: string, data: any): Promise<void> {
    try {
      const supabase = createServerClient()
      
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          data_key: key,
          data_value: data,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,data_key'
        })

      if (error) {
        throw new Error(`Failed to save data: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving user data:', error)
      throw error
    }
  }

  async loadUserDataServer<T = any>(userId: string, key: string): Promise<T | null> {
    try {
      const supabase = createServerClient()
      
      const { data, error } = await supabase
        .from('user_data')
        .select('data_value')
        .eq('user_id', userId)
        .eq('data_key', key)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw new Error(`Failed to load data: ${error.message}`)
      }

      return data?.data_value as T
    } catch (error) {
      console.error('Error loading user data:', error)
      return null
    }
  }
}

export const supabaseDataStore = SupabaseDataStore.getInstance()

// Convenience functions for backward compatibility
export async function remoteSave(userId: string, key: string, data: any): Promise<void> {
  return supabaseDataStore.saveUserData(userId, key, data)
}

export async function remoteLoad<T = any>(userId: string, key: string): Promise<T | null> {
  return supabaseDataStore.loadUserData<T>(userId, key)
}
