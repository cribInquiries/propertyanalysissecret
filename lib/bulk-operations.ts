import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase/config'

export interface BulkOperation<T> {
  type: 'insert' | 'update' | 'upsert' | 'delete'
  table: string
  data?: T | T[]
  filter?: Record<string, any>
  batchSize?: number
}

export interface BulkResult {
  success: boolean
  processed: number
  errors: string[]
  duration: number
}

export class BulkOperationsManager {
  private supabase: any
  private readonly defaultBatchSize = 100

  constructor(supabase: any) {
    this.supabase = supabase
  }

  async executeBulkOperation<T>(operation: BulkOperation<T>): Promise<BulkResult> {
    const startTime = Date.now()
    const errors: string[] = []
    let processed = 0

    try {
      const batchSize = operation.batchSize || this.defaultBatchSize
      
      switch (operation.type) {
        case 'insert':
          processed = await this.bulkInsert(operation.table, operation.data as T[], batchSize, errors)
          break
        case 'update':
          processed = await this.bulkUpdate(operation.table, operation.data as T, operation.filter!, batchSize, errors)
          break
        case 'upsert':
          processed = await this.bulkUpsert(operation.table, operation.data as T[], batchSize, errors)
          break
        case 'delete':
          processed = await this.bulkDelete(operation.table, operation.filter!, batchSize, errors)
          break
        default:
          errors.push(`Unknown operation type: ${operation.type}`)
      }
    } catch (error) {
      errors.push(`Bulk operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    const duration = Date.now() - startTime

    return {
      success: errors.length === 0,
      processed,
      errors,
      duration
    }
  }

  private async bulkInsert<T>(table: string, data: T[], batchSize: number, errors: string[]): Promise<number> {
    let processed = 0

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      
      try {
        const { error } = await this.supabase
          .from(table)
          .insert(batch)

        if (error) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`)
        } else {
          processed += batch.length
        }
      } catch (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return processed
  }

  private async bulkUpdate<T>(table: string, data: T, filter: Record<string, any>, batchSize: number, errors: string[]): Promise<number> {
    try {
      const { data: updatedData, error } = await this.supabase
        .from(table)
        .update(data)
        .match(filter)

      if (error) {
        errors.push(`Bulk update failed: ${error.message}`)
        return 0
      }

      return updatedData?.length || 0
    } catch (error) {
      errors.push(`Bulk update failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return 0
    }
  }

  private async bulkUpsert<T>(table: string, data: T[], batchSize: number, errors: string[]): Promise<number> {
    let processed = 0

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      
      try {
        const { error } = await this.supabase
          .from(table)
          .upsert(batch, { onConflict: 'user_id,data_key' })

        if (error) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`)
        } else {
          processed += batch.length
        }
      } catch (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return processed
  }

  private async bulkDelete(table: string, filter: Record<string, any>, batchSize: number, errors: string[]): Promise<number> {
    try {
      const { data: deletedData, error } = await this.supabase
        .from(table)
        .delete()
        .match(filter)

      if (error) {
        errors.push(`Bulk delete failed: ${error.message}`)
        return 0
      }

      return deletedData?.length || 0
    } catch (error) {
      errors.push(`Bulk delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return 0
    }
  }

  // Specialized bulk operations for common use cases
  async bulkUpdateUserData(userId: string, dataUpdates: Array<{ key: string; data: any }>): Promise<BulkResult> {
    const operations = dataUpdates.map(update => ({
      type: 'upsert' as const,
      table: 'user_data',
      data: {
        user_id: userId,
        data_key: update.key,
        data_value: update.data,
        updated_at: new Date().toISOString()
      }
    }))

    return this.executeMultipleOperations(operations)
  }

  async bulkCreatePropertyAnalyses(userId: string, analyses: Array<any>): Promise<BulkResult> {
    const data = analyses.map(analysis => ({
      ...analysis,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    return this.executeBulkOperation({
      type: 'insert',
      table: 'property_analyses',
      data,
      batchSize: 50
    })
  }

  async bulkUpdateImageMetadata(updates: Array<{ id: string; description?: string; tags?: string[] }>): Promise<BulkResult> {
    const operations = updates.map(update => ({
      type: 'update' as const,
      table: 'image_metadata',
      data: {
        ...update,
        updated_at: new Date().toISOString()
      },
      filter: { id: update.id }
    }))

    return this.executeMultipleOperations(operations)
  }

  private async executeMultipleOperations(operations: BulkOperation<any>[]): Promise<BulkResult> {
    const startTime = Date.now()
    const errors: string[] = []
    let totalProcessed = 0

    for (const operation of operations) {
      const result = await this.executeBulkOperation(operation)
      totalProcessed += result.processed
      errors.push(...result.errors)
    }

    const duration = Date.now() - startTime

    return {
      success: errors.length === 0,
      processed: totalProcessed,
      errors,
      duration
    }
  }
}

// Data migration utilities
export class DataMigrationManager {
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  async migrateUserDataToNewSchema(userId: string): Promise<BulkResult> {
    const startTime = Date.now()
    const errors: string[] = []
    let processed = 0

    try {
      // Get all user data
      const { data: userData, error: fetchError } = await this.supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)

      if (fetchError) {
        errors.push(`Failed to fetch user data: ${fetchError.message}`)
        return { success: false, processed: 0, errors, duration: Date.now() - startTime }
      }

      if (!userData || userData.length === 0) {
        return { success: true, processed: 0, errors: [], duration: Date.now() - startTime }
      }

      // Transform data to new schema format
      const transformedData = userData.map((item: any) => ({
        ...item,
        metadata: {
          migrated_at: new Date().toISOString(),
          migration_version: '2.0'
        }
      }))

      // Bulk update with new schema
      const { error: updateError } = await this.supabase
        .from('user_data')
        .upsert(transformedData, { onConflict: 'user_id,data_key' })

      if (updateError) {
        errors.push(`Failed to migrate data: ${updateError.message}`)
      } else {
        processed = transformedData.length
      }

    } catch (error) {
      errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    const duration = Date.now() - startTime

    return {
      success: errors.length === 0,
      processed,
      errors,
      duration
    }
  }

  async cleanupOrphanedData(): Promise<BulkResult> {
    const startTime = Date.now()
    const errors: string[] = []
    let processed = 0

    try {
      // Delete orphaned image metadata
      const { data: orphanedImages, error: orphanedError } = await this.supabase
        .from('image_metadata')
        .select('id')
        .not('user_id', 'in', `(SELECT id FROM auth.users)`)

      if (!orphanedError && orphanedImages) {
        const { error: deleteError } = await this.supabase
          .from('image_metadata')
          .delete()
          .in('id', orphanedImages.map((img: any) => img.id))

        if (!deleteError) {
          processed += orphanedImages.length
        } else {
          errors.push(`Failed to delete orphaned images: ${deleteError.message}`)
        }
      }

      // Delete orphaned user data
      const { data: orphanedData, error: dataError } = await this.supabase
        .from('user_data')
        .select('id')
        .not('user_id', 'in', `(SELECT id FROM auth.users)`)

      if (!dataError && orphanedData) {
        const { error: deleteError } = await this.supabase
          .from('user_data')
          .delete()
          .in('id', orphanedData.map((data: any) => data.id))

        if (!deleteError) {
          processed += orphanedData.length
        } else {
          errors.push(`Failed to delete orphaned user data: ${deleteError.message}`)
        }
      }

    } catch (error) {
      errors.push(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    const duration = Date.now() - startTime

    return {
      success: errors.length === 0,
      processed,
      errors,
      duration
    }
  }
}

export const bulkOperationsManager = new BulkOperationsManager(createClient(SUPABASE_URL, SUPABASE_ANON_KEY))
