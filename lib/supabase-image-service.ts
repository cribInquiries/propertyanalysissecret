import { createClient } from '@supabase/supabase-js'

export interface ImageMetadata {
  id: string
  userId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  url: string
  path: string
  category: string
  description?: string
  tags?: string[]
  uploadedAt: string
  updatedAt: string
}

export interface ImageUploadOptions {
  userId: string
  category: string
  description?: string
  tags?: string[]
  maxWidth?: number
  maxHeight?: number
  quality?: number
  folder?: string
}

class SupabaseImageService {
  private supabase: any
  private initialized: boolean = false

  private initialize() {
    if (this.initialized && this.supabase) {
      return
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Require valid Supabase configuration
    if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
      throw new Error('Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY must be set')
    }

    // Prefer service role key for server-side operations, fallback to anon key
    const supabaseKey = supabaseServiceKey || supabaseAnonKey

    if (!supabaseKey) {
      throw new Error('Supabase key not found: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY must be set')
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.initialized = true
  }

  /**
   * Upload an image to Supabase Storage
   */
  async uploadImage(
    file: File,
    options: ImageUploadOptions
  ): Promise<{ url: string; metadata: ImageMetadata }> {
    this.initialize()
    try {
      // Validate file
      if (!this.isValidImageFile(file)) {
        throw new Error('Invalid image file type')
      }

      // Generate unique filename
      const fileId = this.generateFileId()
      const safeName = this.sanitizeFileName(file.name)
      const fileName = `${fileId}-${safeName}`
      const folder = options.folder || options.category || 'general'
      const filePath = `${options.userId}/${folder}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath)

      // Get image dimensions (basic implementation)
      const dimensions = await this.getImageDimensions(file)

      // Create metadata object
      const metadata: ImageMetadata = {
        id: fileId,
        userId: options.userId,
        filename: fileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        width: dimensions.width,
        height: dimensions.height,
        url: publicUrl,
        path: filePath,
        category: options.category,
        description: options.description,
        tags: options.tags || [],
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save metadata to database
      await this.saveImageMetadata(metadata)

      return { url: publicUrl, metadata }
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  /**
   * Get all images for a user
   */
  async getUserImages(userId: string, category?: string): Promise<ImageMetadata[]> {
    this.initialize()
    try {
      let query = this.supabase
        .from('image_metadata')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch images: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error fetching user images:', error)
      return []
    }
  }

  /**
   * Delete an image and its metadata
   */
  async deleteImage(userId: string, imageId: string): Promise<boolean> {
    this.initialize()
    try {
      // Get image metadata
      const { data: metadata, error: fetchError } = await this.supabase
        .from('image_metadata')
        .select('path')
        .eq('id', imageId)
        .eq('user_id', userId)
        .single()

      if (fetchError || !metadata) {
        throw new Error('Image not found')
      }

      // Delete from storage
      const { error: deleteError } = await this.supabase.storage
        .from('user-uploads')
        .remove([metadata.path])

      if (deleteError) {
        console.warn('Failed to delete from storage:', deleteError)
      }

      // Delete metadata
      const { error: metadataError } = await this.supabase
        .from('image_metadata')
        .delete()
        .eq('id', imageId)
        .eq('user_id', userId)

      if (metadataError) {
        throw new Error(`Failed to delete metadata: ${metadataError.message}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting image:', error)
      return false
    }
  }

  /**
   * Update image metadata
   */
  async updateImageMetadata(
    userId: string,
    imageId: string,
    updates: Partial<Pick<ImageMetadata, 'description' | 'tags' | 'category'>>
  ): Promise<boolean> {
    this.initialize()
    try {
      const { error } = await this.supabase
        .from('image_metadata')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', imageId)
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to update metadata: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error('Error updating image metadata:', error)
      return false
    }
  }

  /**
   * Get image dimensions (server-side compatible)
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    // For server-side, we'll return 0,0 and let the client update it later
    // In a production app, you might use a library like 'sharp' for server-side image processing
    return { width: 0, height: 0 }
  }

  /**
   * Validate image file
   */
  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 10 * 1024 * 1024 // 10MB

    return validTypes.includes(file.type) && file.size <= maxSize
  }

  /**
   * Sanitize filename
   */
  private sanitizeFileName(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  }

  /**
   * Generate unique file ID
   */
  private generateFileId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Save image metadata to database
   */
  private async saveImageMetadata(metadata: ImageMetadata): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('image_metadata')
        .insert({
          id: metadata.id,
          user_id: metadata.userId,
          filename: metadata.filename,
          original_name: metadata.originalName,
          mime_type: metadata.mimeType,
          size: metadata.size,
          width: metadata.width,
          height: metadata.height,
          url: metadata.url,
          path: metadata.path,
          category: metadata.category,
          description: metadata.description,
          tags: metadata.tags,
          uploaded_at: metadata.uploadedAt,
          updated_at: metadata.updatedAt
        })

      if (error) {
        throw new Error(`Failed to save metadata: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving image metadata:', error)
      // Don't throw here as the upload was successful
    }
  }
}

export const supabaseImageService = new SupabaseImageService()
