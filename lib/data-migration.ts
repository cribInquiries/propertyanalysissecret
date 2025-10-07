import { supabaseAuth } from '@/lib/auth/supabase-auth'
import { supabaseDataStore } from '@/lib/supabase-data-store'

export interface MigrationData {
  key: string
  data: any
}

export class DataMigration {
  private static instance: DataMigration

  static getInstance(): DataMigration {
    if (!DataMigration.instance) {
      DataMigration.instance = new DataMigration()
    }
    return DataMigration.instance
  }

  /**
   * Get all local storage keys that contain user data
   */
  getLocalStorageKeys(): string[] {
    if (typeof window === 'undefined') return []
    
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && this.isUserDataKey(key)) {
        keys.push(key)
      }
    }
    return keys
  }

  /**
   * Check if a localStorage key contains user data
   */
  private isUserDataKey(key: string): boolean {
    const userDataPatterns = [
      'revenue_projections_',
      'company_portfolio_',
      'maintenance_breakdown_',
      'setup_costs_',
      'purchase_motivation_',
      'value_maximization_',
      'user_settings_',
    ]
    
    return userDataPatterns.some(pattern => key.startsWith(pattern))
  }

  /**
   * Extract user ID from a localStorage key
   */
  private extractUserId(key: string): string {
    const parts = key.split('_')
    return parts[parts.length - 1] || 'anon'
  }

  /**
   * Extract data type from a localStorage key
   */
  private extractDataType(key: string): string {
    const parts = key.split('_')
    return parts.slice(0, -1).join('_')
  }

  /**
   * Get all local user data
   */
  getAllLocalData(): MigrationData[] {
    if (typeof window === 'undefined') return []
    
    const keys = this.getLocalStorageKeys()
    const migrationData: MigrationData[] = []
    
    keys.forEach(key => {
      try {
        const data = localStorage.getItem(key)
        if (data) {
          const parsed = JSON.parse(data)
          const dataType = this.extractDataType(key)
          migrationData.push({
            key: dataType,
            data: parsed
          })
        }
      } catch (error) {
        console.error(`Failed to parse data for key ${key}:`, error)
      }
    })
    
    return migrationData
  }

  /**
   * Migrate local data to Supabase
   */
  async migrateToSupabase(): Promise<{ success: boolean; migrated: number; errors: string[] }> {
    const user = await supabaseAuth.getCurrentUser()
    if (!user) {
      return { success: false, migrated: 0, errors: ['User not authenticated'] }
    }

    const localData = this.getAllLocalData()
    const errors: string[] = []
    let migrated = 0

    for (const item of localData) {
      try {
        await supabaseDataStore.saveUserData(user.id, item.key, item.data)
        migrated++
      } catch (error) {
        const errorMsg = `Failed to migrate ${item.key}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    return {
      success: errors.length === 0,
      migrated,
      errors
    }
  }

  /**
   * Clear local data after successful migration
   */
  clearLocalData(): void {
    if (typeof window === 'undefined') return
    
    const keys = this.getLocalStorageKeys()
    keys.forEach(key => {
      localStorage.removeItem(key)
    })
  }

  /**
   * Check if user has local data that can be migrated
   */
  hasLocalData(): boolean {
    return this.getLocalStorageKeys().length > 0
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    hasLocalData: boolean
    hasSupabaseData: boolean
    needsMigration: boolean
  }> {
    const user = await supabaseAuth.getCurrentUser()
    const hasLocalData = this.hasLocalData()
    
    if (!user) {
      return {
        hasLocalData,
        hasSupabaseData: false,
        needsMigration: false
      }
    }

    // Check if user has any data in Supabase
    const localKeys = this.getLocalStorageKeys()
    const dataTypes = [...new Set(localKeys.map(key => this.extractDataType(key)))]
    
    let hasSupabaseData = false
    for (const dataType of dataTypes) {
      const data = await supabaseDataStore.loadUserData(user.id, dataType)
      if (data) {
        hasSupabaseData = true
        break
      }
    }

    return {
      hasLocalData,
      hasSupabaseData,
      needsMigration: hasLocalData && !hasSupabaseData
    }
  }
}

export const dataMigration = DataMigration.getInstance()


