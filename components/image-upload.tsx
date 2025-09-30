"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, Upload, ImageIcon } from "lucide-react"
import { readJson, writeJson, generateId, getCurrentUser } from "@/lib/local-db"
import { toast } from "@/hooks/use-toast"

interface ImageUploadProps {
  onUploadComplete?: (imageData: any) => void
  propertyAnalysisId?: string
  maxFiles?: number
  maxSize?: number // in bytes
}

interface UploadingFile {
  file: File
  progress: number
  status: "uploading" | "completed" | "error"
  id: string
}

interface StoredImage {
  id: string
  user_id: string
  property_analysis_id: string | null
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  upload_status: "completed" | "error" | "uploading"
  publicUrl: string
  alt_text?: string
}

export function ImageUpload({
  onUploadComplete,
  propertyAnalysisId,
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
}: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [uploadedImages, setUploadedImages] = useState<StoredImage[]>([])

  // Load previously saved images for this user on mount
  useEffect(() => {
    const user = getCurrentUser()
    const STORAGE_KEY = `property_images_${user?.id || "anon"}`
    const existing = readJson<StoredImage[]>(STORAGE_KEY, [])
    setUploadedImages(existing)
  }, [])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const user = getCurrentUser()
      if (!user) {
        toast({ title: "Not signed in", description: "Guest mode: uploads are stored locally" })
      }

      // Check file size
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > maxSize) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB`,
            variant: "destructive",
          })
          return false
        }
        return true
      })

      // Check total file count
      if (uploadedImages.length + validFiles.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive",
        })
        return
      }

      // Initialize uploading files
      const newUploadingFiles = validFiles.map((file) => ({
        file,
        progress: 0,
        status: "uploading" as const,
        id: Math.random().toString(36).substring(7),
      }))

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles])

      // Upload each file
      for (const uploadingFile of newUploadingFiles) {
        try {
          const { file, id } = uploadingFile
          const fileExt = file.name.split(".").pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const filePath = `property-images/${fileName}`

          // Convert to data URL for local storage preview
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = (e) => reject(e)
            reader.readAsDataURL(file)
          })

          const imageRecord: StoredImage = {
            id: generateId(),
            user_id: user?.id || "anon",
            property_analysis_id: propertyAnalysisId || null,
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            upload_status: "completed" as const,
            publicUrl: dataUrl,
          }

          const STORAGE_KEY = `property_images_${imageRecord.user_id}`
          const existing = readJson<StoredImage[]>(STORAGE_KEY, [])
          const next = [...existing, imageRecord]
          writeJson(STORAGE_KEY, next)

          setUploadingFiles((prev) => prev.filter((f) => f.id !== id))
          setUploadedImages((prev) => [...prev, imageRecord])

          onUploadComplete?.(imageRecord)

          toast({
            title: "Upload successful",
            description: `${file.name} uploaded successfully`,
          })
        } catch (error) {
          console.error("Upload error:", error)
          setUploadingFiles((prev) => prev.map((f) => (f.id === uploadingFile.id ? { ...f, status: "error" } : f)))
          toast({
            title: "Upload failed",
            description: `Failed to upload ${uploadingFile.file.name}`,
            variant: "destructive",
          })
        }
      }
    },
    [maxFiles, maxSize, onUploadComplete, propertyAnalysisId, uploadedImages.length],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
    multiple: true,
    maxFiles,
  })

  const removeImage = async (imageId: string) => {
    try {
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId))
      const user = getCurrentUser()
      const STORAGE_KEY = `property_images_${user?.id || "anon"}`
      const existing = readJson<StoredImage[]>(STORAGE_KEY, [])
      writeJson(
        STORAGE_KEY,
        existing.filter((img) => img.id !== imageId),
      )
      toast({
        title: "Image removed",
        description: "Image deleted successfully",
      })
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">{isDragActive ? "Drop images here" : "Upload property images"}</p>
            <p className="text-sm text-muted-foreground mb-4">Drag and drop images here, or click to select files</p>
            <p className="text-xs text-muted-foreground">
              Supports JPEG, PNG, WebP, GIF up to 5MB each. Max {maxFiles} files.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Uploading...</h3>
          {uploadingFiles.map((uploadingFile) => (
            <Card key={uploadingFile.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{uploadingFile.file.name}</p>
                    <Progress value={uploadingFile.progress} className="mt-2" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {uploadingFile.status === "error" ? "Error" : `${Math.round(uploadingFile.progress)}%`}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Uploaded Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <Card key={image.id} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded-md">
                    <img
                      src={image.publicUrl || "/placeholder.svg"}
                      alt={image.alt_text || image.file_name}
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 truncate">{image.file_name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
