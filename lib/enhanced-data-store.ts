import { createClient } from '@supabase/supabase-js'
import { imageService, ImageUploadOptions } from './image-service'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase/config'

export interface DataChange {
  id: string
  userId: string
  dataKey: string
  changeType: 'create' | 'update' | 'delete'
  oldValue?: any
  newValue?: any
  timestamp: string
  metadata?: {
    component?: string
    field?: string
    description?: string
  }
}

export interface BatchOperation {
  operations: Array<{
    type: 'upsert' | 'delete' | 'image_upload'
    key: string
    data?: any
    options?: ImageUploadOptions
  }>
  userId: string
  metadata?: {
    component?: string
    description?: string
  }
}

class EnhancedDataStore {
  private supabase: any
  private changeQueue: DataChange[] = []
  private batchTimer: NodeJS.Timeout | null = null
  private readonly BATCH_DELAY = 1000 // 1 second
  private readonly MAX_BATCH_SIZE = 50

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  /**
   * Enhanced save with change tracking and batching
   */
  async saveUserData<T>(
    userId: string,
    dataKey: string,
    data: T,
    options?: {
      component?: string
      field?: string
      description?: string
      immediate?: boolean
    }
  ): Promise<void> {
    try {
      if (!userId || userId === 'anon') {
        console.warn('Cannot save data for anonymous user')
        return
      }

      // Get current data for change tracking
      const currentData = await this.getCurrentData(userId, dataKey)
      
      // Record change
      const change: DataChange = {
        id: this.generateChangeId(),
        userId,
        dataKey,
        changeType: currentData ? 'update' : 'create',
        oldValue: currentData,
        newValue: data,
        timestamp: new Date().toISOString(),
        metadata: {
          component: options?.component,
          field: options?.field,
          description: options?.description
        }
      }

      // Add to change queue
      this.addToChangeQueue(change)

      // Save immediately if requested or if queue is full
      if (options?.immediate || this.changeQueue.length >= this.MAX_BATCH_SIZE) {
        await this.processBatch()
      }
    } catch (error) {
      console.error('Error saving user data:', error)
      throw error
    }
  }

  /**
   * Batch operations for multiple changes at once
   */
  async batchOperations(batch: BatchOperation): Promise<void> {
    try {
      const { operations, userId, metadata } = batch

      if (!userId || userId === 'anon') {
        console.warn('Cannot perform batch operations for anonymous user')
        return
      }

      // Process each operation
      for (const operation of operations) {
        switch (operation.type) {
          case 'upsert':
            await this.supabase
              .from('user_data')
              .upsert({
                user_id: userId,
                data_key: operation.key,
                data_value: operation.data,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id,data_key'
              })
            break

          case 'delete':
            await this.supabase
              .from('user_data')
              .delete()
              .eq('user_id', userId)
              .eq('data_key', operation.key)
            break

          case 'image_upload':
            if (operation.options) {
              // This would be handled by the image service
              // For now, we'll just log it
              console.log('Image upload operation:', operation.key, operation.options)
            }
            break
        }
      }

      // Log batch operation
      console.log(`Batch operation completed: ${operations.length} operations`, metadata)
    } catch (error) {
      console.error('Error in batch operations:', error)
      throw error
    }
  }

  /**
   * Load user data with caching
   */
  async loadUserData<T>(userId: string, dataKey: string): Promise<T | null> {
    try {
      if (!userId || userId === 'anon') {
        return null
      }

      const { data, error } = await this.supabase
        .from('user_data')
        .select('data_value, updated_at')
        .eq('user_id', userId)
        .eq('data_key', dataKey)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No data found
        }
        throw new Error(`Failed to load data: ${error.message}`)
      }

      return data?.data_value as T
    } catch (error) {
      console.error('Error loading user data:', error)
      return null
    }
  }

  /**
   * Get data change history
   */
  async getChangeHistory(
    userId: string,
    dataKey?: string,
    limit: number = 50
  ): Promise<DataChange[]> {
    try {
      let query = this.supabase
        .from('data_changes')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (dataKey) {
        query = query.eq('data_key', dataKey)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to load change history: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error loading change history:', error)
      return []
    }
  }

  /**
   * Enhanced image upload with metadata
   */
  async uploadImageWithData(
    file: File,
    userId: string,
    dataKey: string,
    options: ImageUploadOptions
  ): Promise<{ url: string; metadata: any }> {
    try {
      // Upload image using image service
      const result = await imageService.uploadImage(file, options)

      // Save image reference in user data
      const imageRef = {
        url: result.url,
        id: result.metadata.id,
        filename: result.metadata.filename,
        uploadedAt: result.metadata.uploadedAt,
        category: result.metadata.category
      }

      // Get current data and add image reference
      const currentData = await this.loadUserData(userId, dataKey) || {}
      const updatedData = {
        ...currentData,
        images: {
          ...(currentData as any).images,
          [result.metadata.id]: imageRef
        }
      }

      // Save updated data
      await this.saveUserData(userId, dataKey, updatedData, {
        component: options.category,
        description: `Image uploaded: ${result.metadata.originalName}`,
        immediate: true
      })

      return { url: result.url, metadata: result.metadata }
    } catch (error) {
      console.error('Error uploading image with data:', error)
      throw error
    }
  }

  /**
   * Smart data synchronization
   */
  async syncUserData(userId: string, dataKey: string, localData: any): Promise<any> {
    try {
      const remoteData = await this.loadUserData(userId, dataKey)
      
      if (!remoteData) {
        // No remote data, save local data
        await this.saveUserData(userId, dataKey, localData, {
          description: 'Initial data sync',
          immediate: true
        })
        return localData
      }

      // Check for conflicts and merge if possible
      const mergedData = this.mergeData(remoteData, localData)
      
      // Save merged data if different
      if (JSON.stringify(mergedData) !== JSON.stringify(remoteData)) {
        await this.saveUserData(userId, dataKey, mergedData, {
          description: 'Data sync merge',
          immediate: true
        })
      }

      return mergedData
    } catch (error) {
      console.error('Error syncing user data:', error)
      return localData // Fallback to local data
    }
  }

  /**
   * Private helper methods
   */
  private addToChangeQueue(change: DataChange): void {
    this.changeQueue.push(change)

    // Start batch timer if not already running
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch()
      }, this.BATCH_DELAY)
    }
  }

  private async processBatch(): Promise<void> {
    if (this.changeQueue.length === 0) return

    const changes = [...this.changeQueue]
    this.changeQueue = []

    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }

    try {
      // Save changes to database
      await this.saveChanges(changes)
      
      // Process the actual data updates
      const dataUpdates = new Map<string, any>()
      
      for (const change of changes) {
        if (change.changeType === 'delete') {
          await this.supabase
            .from('user_data')
            .delete()
            .eq('user_id', change.userId)
            .eq('data_key', change.dataKey)
        } else {
          dataUpdates.set(`${change.userId}-${change.dataKey}`, change.newValue)
        }
      }

      // Batch upsert remaining data
      if (dataUpdates.size > 0) {
        const upsertData = Array.from(dataUpdates.entries()).map(([key, value]) => {
          const [userId, dataKey] = key.split('-', 2)
          return {
            user_id: userId,
            data_key: dataKey,
            data_value: value,
            updated_at: new Date().toISOString()
          }
        })

        await this.supabase
          .from('user_data')
          .upsert(upsertData, {
            onConflict: 'user_id,data_key'
          })
      }
    } catch (error) {
      console.error('Error processing batch:', error)
      // Re-queue changes for retry
      this.changeQueue.unshift(...changes)
    }
  }

  private async saveChanges(changes: DataChange[]): Promise<void> {
    try {
      const changeRecords = changes.map(change => ({
        id: change.id,
        user_id: change.userId,
        data_key: change.dataKey,
        change_type: change.changeType,
        old_value: change.oldValue,
        new_value: change.newValue,
        timestamp: change.timestamp,
        component: change.metadata?.component,
        field: change.metadata?.field,
        description: change.metadata?.description
      }))

      await this.supabase
        .from('data_changes')
        .insert(changeRecords)
    } catch (error) {
      console.error('Error saving changes:', error)
      // Don't throw here as data operations should continue
    }
  }

  private async getCurrentData(userId: string, dataKey: string): Promise<any> {
    try {
      const { data } = await this.supabase
        .from('user_data')
        .select('data_value')
        .eq('user_id', userId)
        .eq('data_key', dataKey)
        .single()

      return data?.data_value
    } catch {
      return null
    }
  }

  private mergeData(remoteData: any, localData: any): any {
    // Simple merge strategy - in a real app, you'd want more sophisticated conflict resolution
    if (typeof remoteData !== 'object' || typeof localData !== 'object') {
      return localData // Prefer local for primitives
    }

    const merged = { ...remoteData }
    
    for (const key in localData) {
      if (localData.hasOwnProperty(key)) {
        if (typeof localData[key] === 'object' && typeof merged[key] === 'object') {
          merged[key] = this.mergeData(merged[key], localData[key])
        } else {
          merged[key] = localData[key]
        }
      }
    }

    return merged
  }

  private generateChangeId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

export const enhancedDataStore = new EnhancedDataStore()
