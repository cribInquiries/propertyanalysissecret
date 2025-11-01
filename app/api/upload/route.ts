import { NextResponse } from "next/server"
import { supabaseImageService, ImageUploadOptions } from "@/lib/supabase-image-service"
import { DataValidator } from "@/lib/data-validation"
import { securityManager } from "@/lib/security-manager"
import { RateLimiter } from "@/lib/data-validation"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get("file") as File | null
    const userId = (form.get("userId") as string) || "anon"
    const category = (form.get("category") as string) || "general"
    const folder = (form.get("folder") as string) || category // Use folder if provided, otherwise use category
    const description = (form.get("description") as string) || ""
    const tags = (form.get("tags") as string) || ""
    const maxWidth = form.get("maxWidth") ? parseInt(form.get("maxWidth") as string) : undefined
    const maxHeight = form.get("maxHeight") ? parseInt(form.get("maxHeight") as string) : undefined
    const quality = form.get("quality") ? parseFloat(form.get("quality") as string) : 0.8

    // Security checks
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Rate limiting
    if (!RateLimiter.isAllowed(userId)) {
      await securityManager.logSecurityEvent({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'rate_limit_exceeded',
        severity: 'medium',
        details: 'Upload rate limit exceeded',
        ipAddress,
        timestamp: new Date().toISOString(),
        resolved: false
      })
      return NextResponse.json({ 
        error: "Rate limit exceeded. Please try again later." 
      }, { status: 429 })
    }

    // Input validation and sanitization
    const sanitizedDescription = DataValidator.sanitizeString(description)
    const sanitizedCategory = DataValidator.sanitizeString(category)

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 })
    }

    if (userId === "anon") {
      return NextResponse.json({ error: "Authentication required for uploads" }, { status: 401 })
    }

    // Enhanced file validation
    const fileValidation = DataValidator.validateFileUpload(file)
    if (!fileValidation.valid) {
      return NextResponse.json({ 
        error: fileValidation.error 
      }, { status: 400 })
    }

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed." 
      }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 10MB." 
      }, { status: 400 })
    }

    // Prepare upload options
    const uploadOptions: ImageUploadOptions = {
      userId,
      category,
      folder,
      description: description || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined,
      maxWidth,
      maxHeight,
      quality
    }

        // Upload using Supabase image service
        const result = await supabaseImageService.uploadImage(file, uploadOptions)

        // Log successful upload
        await securityManager.monitorDataAccess(
          userId, 
          'image', 
          'upload', 
          ipAddress
        )

        return NextResponse.json({
          url: result.url,
          metadata: {
            id: result.metadata.id,
            filename: result.metadata.filename,
            size: result.metadata.size,
            dimensions: {
              width: result.metadata.width,
              height: result.metadata.height
            },
            category: result.metadata.category,
            uploadedAt: result.metadata.uploadedAt
          }
        })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: (error as Error).message,
      code: 'UPLOAD_ERROR'
    }, { status: 500 })
  }
}

// GET endpoint to retrieve user's images
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const category = searchParams.get("category")

    if (!userId || userId === "anon") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const images = await supabaseImageService.getUserImages(userId, category || undefined)

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json({ 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

// DELETE endpoint to remove images
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const imageId = searchParams.get("imageId")

    if (!userId || userId === "anon") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!imageId) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 })
    }

    const success = await supabaseImageService.deleteImage(userId, imageId)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ 
      error: (error as Error).message 
    }, { status: 500 })
  }
}

// PUT endpoint to update image metadata
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { userId, imageId, description, tags } = body

    if (!userId || userId === "anon") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!imageId) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 })
    }

    const success = await supabaseImageService.updateImageMetadata(userId, imageId, {
      description,
      tags
    })

    if (!success) {
      return NextResponse.json({ error: "Failed to update image" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json({ 
      error: (error as Error).message 
    }, { status: 500 })
  }
}


