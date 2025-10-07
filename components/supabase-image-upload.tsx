'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Upload, Image as ImageIcon, X, Edit3, Save, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { supabaseAuth } from '@/lib/auth/supabase-auth'

interface ImageMetadata {
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

interface SupabaseImageUploadProps {
  onUploadComplete?: (image: ImageMetadata) => void
  onImageDelete?: (imageId: string) => void
  category?: string
  maxFiles?: number
  maxSize?: number
  showMetadata?: boolean
  className?: string
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  id: string
}

export function SupabaseImageUpload({
  onUploadComplete,
  onImageDelete,
  category = 'general',
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  showMetadata = true,
  className = ''
}: SupabaseImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<ImageMetadata[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingImage, setEditingImage] = useState<ImageMetadata | null>(null)
  const [editForm, setEditForm] = useState({
    description: '',
    tags: ''
  })

  // Load existing images on mount
  useEffect(() => {
    loadUserImages()
  }, [category])

  const loadUserImages = async () => {
    try {
      const user = await supabaseAuth.getCurrentUser()
      if (!user) return

      const response = await fetch(`/api/upload?userId=${user.id}&category=${category}`)
      if (response.ok) {
        const data = await response.json()
        setUploadedImages(data.images || [])
      }
    } catch (error) {
      console.error('Error loading images:', error)
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const user = await supabaseAuth.getCurrentUser()
      if (!user) {
        toast.error('Please sign in to upload images')
        return
      }

      // Check file size and count
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > maxSize) {
          toast.error(`${file.name} is larger than ${Math.round(maxSize / 1024 / 1024)}MB`)
          return false
        }
        return true
      })

      if (uploadedImages.length + validFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Initialize uploading files
      const newUploadingFiles = validFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const,
        id: Math.random().toString(36).substring(7)
      }))

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles])

      // Upload each file
      for (const uploadingFile of newUploadingFiles) {
        try {
          const { file, id } = uploadingFile
          const formData = new FormData()
          formData.append('file', file)
          formData.append('userId', user.id)
          formData.append('category', category)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          if (response.ok) {
            const result = await response.json()
            const newImage: ImageMetadata = {
              id: result.metadata.id,
              userId: user.id,
              filename: result.metadata.filename,
              originalName: result.metadata.filename,
              mimeType: file.type,
              size: file.size,
              width: result.metadata.dimensions?.width,
              height: result.metadata.dimensions?.height,
              url: result.url,
              path: result.metadata.filename,
              category: result.metadata.category,
              description: '',
              tags: [],
              uploadedAt: result.metadata.uploadedAt,
              updatedAt: result.metadata.uploadedAt
            }

            setUploadedImages((prev) => [...prev, newImage])
            onUploadComplete?.(newImage)
            toast.success(`${file.name} uploaded successfully`)
          } else {
            const error = await response.json()
            throw new Error(error.error || 'Upload failed')
          }
        } catch (error) {
          console.error('Upload error:', error)
          toast.error(`Failed to upload ${uploadingFile.file.name}`)
        } finally {
          setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadingFile.id))
        }
      }
    },
    [uploadedImages.length, maxFiles, maxSize, category, onUploadComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize,
    multiple: true
  })

  const deleteImage = async (imageId: string) => {
    try {
      const user = await supabaseAuth.getCurrentUser()
      if (!user) return

      const response = await fetch(`/api/upload?userId=${user.id}&imageId=${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUploadedImages((prev) => prev.filter((img) => img.id !== imageId))
        onImageDelete?.(imageId)
        toast.success('Image deleted successfully')
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete image')
    }
  }

  const updateImageMetadata = async (imageId: string, updates: { description?: string; tags?: string[] }) => {
    try {
      const user = await supabaseAuth.getCurrentUser()
      if (!user) return

      const response = await fetch('/api/upload', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          imageId,
          ...updates
        })
      })

      if (response.ok) {
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, ...updates, updatedAt: new Date().toISOString() }
              : img
          )
        )
        setEditingImage(null)
        toast.success('Image updated successfully')
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update image')
    }
  }

  const startEditing = (image: ImageMetadata) => {
    setEditingImage(image)
    setEditForm({
      description: image.description || '',
      tags: image.tags?.join(', ') || ''
    })
  }

  const saveEdit = () => {
    if (!editingImage) return

    const tags = editForm.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    updateImageMetadata(editingImage.id, {
      description: editForm.description,
      tags
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              hover:border-primary hover:bg-primary/5
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to select files
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPEG, PNG, WebP, GIF up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Uploading...</h3>
            <div className="space-y-2">
              {uploadingFiles.map((uploadingFile) => (
                <div key={uploadingFile.id} className="flex items-center space-x-3">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm flex-1">{uploadingFile.file.name}</span>
                  <Progress value={uploadingFile.progress} className="w-20" />
                  <span className="text-xs text-muted-foreground">
                    {uploadingFile.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Uploaded Images ({uploadedImages.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image.url}
                      alt={image.description || image.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => startEditing(image)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Image Info */}
                  {showMetadata && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium truncate">{image.originalName}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(image.size)}</span>
                        {image.width && image.height && (
                          <span>{image.width}×{image.height}</span>
                        )}
                      </div>
                      {image.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {image.description}
                        </p>
                      )}
                      {image.tags && image.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {image.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {image.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{image.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          {editingImage && (
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={editingImage.url}
                  alt={editingImage.originalName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a description..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={editForm.tags}
                  onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="property, luxury, interior..."
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingImage(null)}>
                  Cancel
                </Button>
                <Button onClick={saveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
