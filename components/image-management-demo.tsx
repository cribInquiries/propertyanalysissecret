"use client"

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnhancedImageUpload } from './enhanced-image-upload'
import { imageService } from '@/lib/image-service'
import { ImageMetadata } from '@/lib/image-service'
import { Download, Eye, Calendar } from 'lucide-react'

export function ImageManagementDemo() {
  const [userImages, setUserImages] = useState<ImageMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadUserAndImages()
  }, [])

  const loadUserAndImages = async () => {
    try {
      const userId = "anon"
      setUserId(userId)
      await loadImages(userId)
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadImages = async (userId: string) => {
    setLoading(true)
    try {
      const images = await imageService.getUserImages(userId)
      setUserImages(images)
    } catch (error) {
      console.error('Error loading images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUploaded = async (url: string, metadata: any) => {
    console.log('Image uploaded:', url, metadata)
    if (userId) {
      await loadImages(userId)
    }
  }

  const handleImageDeleted = async (imageId: string) => {
    console.log('Image deleted:', imageId)
    setUserImages(prev => prev.filter(img => img.id !== imageId))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!userId) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">Please sign in to manage images</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Enhanced Image Management</h2>
        <p className="text-muted-foreground">
          Upload, organize, and manage your images with advanced features
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upload New Image</h3>
        <EnhancedImageUpload
          onImageUploaded={handleImageUploaded}
          onImageDeleted={handleImageDeleted}
          category="demo"
          maxWidth={1920}
          maxHeight={1080}
          quality={0.9}
          showPreview={true}
          allowMultiple={false}
        />
      </Card>

      {/* Images Gallery */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Your Images</h3>
          <Badge variant="secondary">
            {userImages.length} image{userImages.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading images...</p>
          </div>
        ) : userImages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No images uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  <img
                    src={image.url}
                    alt={image.description || image.originalName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(image.url, '_blank')}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = image.url
                        link.download = image.originalName
                        link.click()
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">
                      {image.originalName}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {image.category}
                    </Badge>
                  </div>
                  
                  {image.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {image.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(image.size)}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(image.uploadedAt)}</span>
                    </div>
                  </div>
                  
                  {image.width && image.height && (
                    <div className="text-xs text-muted-foreground">
                      {image.width} × {image.height}px
                    </div>
                  )}
                  
                  {image.tags && image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {image.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {image.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{image.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Features Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Enhanced Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Image Processing</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Automatic resizing and compression</li>
              <li>• Multiple format support (JPEG, PNG, WebP)</li>
              <li>• Quality optimization</li>
              <li>• File size validation</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Metadata Management</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Description and tags</li>
              <li>• Category organization</li>
              <li>• Upload timestamps</li>
              <li>• File dimensions tracking</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">User Experience</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Drag and drop upload</li>
              <li>• Real-time progress tracking</li>
              <li>• Preview before upload</li>
              <li>• Error handling and validation</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Data Management</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Change tracking and history</li>
              <li>• Batch operations</li>
              <li>• Smart synchronization</li>
              <li>• Cross-device compatibility</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
