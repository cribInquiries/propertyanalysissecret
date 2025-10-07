'use client'

import { SupabaseImageUpload } from '@/components/supabase-image-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestImagesPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Image Upload Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Test the new Supabase-based image upload system. This component supports:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground mb-6">
            <li>Drag & drop or click to upload images</li>
            <li>Automatic image processing and optimization</li>
            <li>Metadata management (descriptions, tags)</li>
            <li>Secure user-based storage with Supabase</li>
            <li>Image deletion and editing</li>
            <li>Progress tracking and error handling</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Property Images</CardTitle>
        </CardHeader>
        <CardContent>
          <SupabaseImageUpload
            category="property"
            maxFiles={5}
            maxSize={10 * 1024 * 1024} // 10MB
            showMetadata={true}
            onUploadComplete={(image) => {
              console.log('Image uploaded:', image)
            }}
            onImageDelete={(imageId) => {
              console.log('Image deleted:', imageId)
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Design Inspiration</CardTitle>
        </CardHeader>
        <CardContent>
          <SupabaseImageUpload
            category="design-inspiration"
            maxFiles={10}
            maxSize={5 * 1024 * 1024} // 5MB
            showMetadata={true}
            onUploadComplete={(image) => {
              console.log('Design image uploaded:', image)
            }}
            onImageDelete={(imageId) => {
              console.log('Design image deleted:', imageId)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
