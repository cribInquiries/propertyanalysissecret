import { z } from 'zod'

// Comprehensive validation schemas
export const UserDataSchema = z.object({
  renovationItems: z.array(z.object({
    category: z.string().min(1).max(100),
    cost: z.number().min(0).max(10000000),
    description: z.string().max(500).optional()
  })).max(50),
  furnishingItems: z.array(z.object({
    category: z.string().min(1).max(100),
    cost: z.number().min(0).max(10000000),
    description: z.string().max(500).optional()
  })).max(50),
  designInspirations: z.array(z.object({
    id: z.number().int().positive(),
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    image: z.string().url().optional()
  })).max(20)
})

export const PropertyAnalysisSchema = z.object({
  address: z.string().min(1).max(500),
  purchasePrice: z.number().min(0).max(1000000000).optional(),
  analysisData: z.record(z.any()).optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(['draft', 'completed', 'archived']).optional()
})

export const ImageMetadataSchema = z.object({
  filename: z.string().min(1).max(255),
  originalName: z.string().min(1).max(255),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp|gif)$/),
  size: z.number().int().min(1).max(50 * 1024 * 1024), // 50MB max
  width: z.number().int().min(1).max(8000).optional(),
  height: z.number().int().min(1).max(8000).optional(),
  category: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional()
})

// Validation utilities
export class DataValidator {
  static validateUserData(data: unknown): { success: boolean; data?: any; errors?: string[] } {
    try {
      const validatedData = UserDataSchema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }
      }
      return { success: false, errors: ['Unknown validation error'] }
    }
  }

  static validatePropertyAnalysis(data: unknown): { success: boolean; data?: any; errors?: string[] } {
    try {
      const validatedData = PropertyAnalysisSchema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }
      }
      return { success: false, errors: ['Unknown validation error'] }
    }
  }

  static validateImageMetadata(data: unknown): { success: boolean; data?: any; errors?: string[] } {
    try {
      const validatedData = ImageMetadataSchema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }
      }
      return { success: false, errors: ['Unknown validation error'] }
    }
  }

  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .substring(0, 1000) // Limit length
  }

  static sanitizeNumber(input: number): number {
    if (!Number.isFinite(input)) return 0
    return Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, input))
  }

  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    // File type validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only images are allowed.' }
    }

    // File size validation (50MB max)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 50MB.' }
    }

    // File name validation
    const invalidChars = /[<>:"/\\|?*]/
    if (invalidChars.test(file.name)) {
      return { valid: false, error: 'Invalid file name. Contains forbidden characters.' }
    }

    return { valid: true }
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map()
  private static readonly WINDOW_MS = 60 * 1000 // 1 minute
  private static readonly MAX_REQUESTS = 100 // Max requests per window

  static isAllowed(userId: string): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(userId) || []
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.WINDOW_MS)
    
    if (validRequests.length >= this.MAX_REQUESTS) {
      return false
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(userId, validRequests)
    
    return true
  }

  static getRemainingRequests(userId: string): number {
    const now = Date.now()
    const userRequests = this.requests.get(userId) || []
    const validRequests = userRequests.filter(time => now - time < this.WINDOW_MS)
    
    return Math.max(0, this.MAX_REQUESTS - validRequests.length)
  }

  static reset(userId: string): void {
    this.requests.delete(userId)
  }
}
