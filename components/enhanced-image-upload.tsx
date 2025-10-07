"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle,
  Download,
  Eye
} from 'lucide-react'
import { supabaseAuth } from '@/lib/auth/supabase-auth'
import { toast } from 'sonner'

export interface ImageUploadProps {
  onImageUploaded: (url: string, metadata: any) => void
  onImageDeleted?: (imageId: string) => void
  category?: string
  maxWidth?: number
  maxHeight?: number
  quality?: number
  accept?: string
  className?: string
  disabled?: boolean
  showPreview?: boolean
  allowMultiple?: boolean
  existingImages?: Array<{
    id: string
    url: string
    filename: string
    description?: string
    uploadedAt: string
  }>
}

export function EnhancedImageUpload({
  onImageUploaded,
  onImageDeleted,
  category = 'general',
  maxWidth,
  maxHeight,
  quality = 0.8,
  accept = 'image/*',
  className = '',
  disabled = false,
  showPreview = true,
  allowMultiple = false,
  existingImages = []
}: ImageUploadProps) {
  const [isClient, setIsClient] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const [editingDescription, setEditingDescription] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }, [disabled])

  const handleFileSelect = (file: File) => {
    setError(null)
    setSelectedFile(file)

    // Create preview
    if (showPreview) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const user = await supabaseAuth.getCurrentUser()
      if (!user?.id) {
        throw new Error('Authentication required for uploads')
      }

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('userId', user.id)
      formData.append('category', category)
      if (description) formData.append('description', description)
      if (tags) formData.append('tags', tags)
      if (maxWidth) formData.append('maxWidth', maxWidth.toString())
      if (maxHeight) formData.append('maxHeight', maxHeight.toString())
      formData.append('quality', quality.toString())

      // Simulate progress (in a real app, you'd track actual upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      onImageUploaded(result.url, result.metadata)
      
      toast.success("Image uploaded successfully")

      // Reset form
      setSelectedFile(null)
      setPreviewUrl(null)
      setDescription('')
      setTags('')
      setUploadProgress(0)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    try {
      const user = await supabaseAuth.getCurrentUser()
      if (!user?.id) return

      const response = await fetch(`/api/upload?userId=${user.id}&imageId=${imageId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      onImageDeleted?.(imageId)
      toast.success("Image has been successfully deleted")
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'Delete failed')
    }
  }

  const handleEditImage = (imageId: string, currentDescription: string) => {
    setEditingImageId(imageId)
    setEditingDescription(currentDescription || '')
  }

  const handleSaveEdit = async () => {
    if (!editingImageId) return

    try {
      const user = await supabaseAuth.getCurrentUser()
      if (!user?.id) return

      const response = await fetch('/api/upload', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          imageId: editingImageId,
          description: editingDescription
        })
      })

      if (!response.ok) {
        throw new Error('Update failed')
      }

      toast.success("Image description has been updated")

      setEditingImageId(null)
      setEditingDescription('')
    } catch (error) {
      console.error('Edit error:', error)
      toast.error(error instanceof Error ? error.message : 'Update failed')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Don't render on server side to avoid hydration issues
  if (!isClient) {
    return <div className={`space-y-4 ${className}`}>Loading...</div>
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        ref={dropRef}
        className={`relative border-2 border-dashed transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="text-lg font-medium mb-2">
            {dragActive ? 'Drop image here' : 'Upload an image'}
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            Drag and drop or click to select
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />

          {selectedFile && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({formatFileSize(selectedFile.size)})
                </span>
              </div>
              
              {previewUrl && (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-32 mx-auto rounded"
                />
              )}
            </div>
          )}

          {uploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="mb-2" />
              <div className="text-sm text-muted-foreground">
                Uploading... {uploadProgress}%
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Upload Options */}
      {selectedFile && !uploading && (
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe this image..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Input
              id="tags"
              placeholder="Enter tags separated by commas..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={disabled}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        </Card>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <Label>Existing Images</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {existingImages.map((image) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img 
                    src={image.url} 
                    alt={image.description || image.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-6 w-6 p-0"
                      onClick={() => handleEditImage(image.id, image.description || '')}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {editingImageId === image.id ? (
                  <div className="p-2 space-y-2">
                    <Textarea
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      rows={2}
                      className="text-xs"
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={handleSaveEdit}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => setEditingImageId(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2">
                    <div className="text-xs font-medium truncate">
                      {image.filename}
                    </div>
                    {image.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {image.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {new Date(image.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
