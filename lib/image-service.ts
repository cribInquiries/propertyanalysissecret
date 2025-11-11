import { createClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase/config'

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

export interface ImageResizeOptions {
  width?: number
  height?: number
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

class ImageService {
  private supabase: any

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  /**
   * Upload an image with comprehensive metadata and processing
   */
  async uploadImage(
    file: File,
    options: ImageUploadOptions
  ): Promise<{ url: string; metadata: ImageMetadata }> {
    try {
      // Validate file
      if (!this.isValidImageFile(file)) {
        throw new Error('Invalid image file type')
      }

      // Process image if needed
      const processedFile = await this.processImage(file, {
        maxWidth: options.maxWidth,
        maxHeight: options.maxHeight,
        quality: options.quality
      })

      // Generate unique filename
      const fileId = this.generateFileId()
      const safeName = this.sanitizeFileName(file.name)
      const fileName = `${fileId}-${safeName}`
      const folder = options.folder || 'uploads'
      const filePath = `userdata/${encodeURIComponent(options.userId)}/${folder}/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('user-uploads')
        .upload(filePath, processedFile, {
          contentType: processedFile.type || file.type,
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

      // Get image dimensions
      const dimensions = await this.getImageDimensions(processedFile)

      // Create metadata object
      const metadata: ImageMetadata = {
        id: fileId,
        userId: options.userId,
        filename: fileName,
        originalName: file.name,
        mimeType: processedFile.type || file.type,
        size: processedFile.size,
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
   * Process image (resize, compress, etc.)
   */
  private async processImage(
    file: File,
    options: ImageResizeOptions = {}
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        const { maxWidth, maxHeight, quality = 0.8 } = options

        if (maxWidth && width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (maxHeight && height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // Set canvas dimensions
        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: options.format ? `image/${options.format}` : file.type,
                lastModified: Date.now()
              })
              resolve(processedFile)
            } else {
              resolve(file) // Fallback to original
            }
          },
          options.format ? `image/${options.format}` : file.type,
          quality
        )
      }

      img.onerror = () => resolve(file) // Fallback to original
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => resolve({ width: 0, height: 0 })
      img.src = URL.createObjectURL(file)
    })
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

export const imageService = new ImageService()
