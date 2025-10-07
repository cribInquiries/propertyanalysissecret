# Image Upload System Documentation

## Overview

The LuxeAnalytics application now uses a robust, Supabase-based image upload system that provides secure, scalable image storage with comprehensive metadata management.

## Features

### Core Functionality
- **Secure Upload**: User-authenticated uploads with proper access controls
- **File Validation**: Type, size, and content validation
- **Metadata Management**: Descriptions, tags, and categorization
- **Image Processing**: Automatic optimization and resizing
- **Progress Tracking**: Real-time upload progress indicators
- **Error Handling**: Comprehensive error reporting and recovery

### Storage & Security
- **Supabase Storage**: Cloud-based file storage with CDN
- **Row Level Security**: User-based access controls
- **File Organization**: Structured folder hierarchy by user and category
- **Automatic Cleanup**: Orphaned file detection and removal

## Architecture

### Components

#### 1. SupabaseImageUpload (`components/supabase-image-upload.tsx`)
Main upload component with drag-and-drop interface:
```tsx
<SupabaseImageUpload
  category="property"
  maxFiles={5}
  maxSize={10 * 1024 * 1024}
  showMetadata={true}
  onUploadComplete={(image) => console.log('Uploaded:', image)}
  onImageDelete={(imageId) => console.log('Deleted:', imageId)}
/>
```

#### 2. EnhancedImageUpload (`components/enhanced-image-upload.tsx`)
Legacy component maintained for backward compatibility.

### API Endpoints

#### POST `/api/upload`
Upload new images:
```typescript
// Request
FormData {
  file: File
  userId: string
  category: string
  description?: string
  tags?: string
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

// Response
{
  url: string
  metadata: {
    id: string
    filename: string
    size: number
    dimensions: { width: number, height: number }
    category: string
    uploadedAt: string
  }
}
```

#### GET `/api/upload`
Retrieve user images:
```typescript
// Query Parameters
?userId=string&category=string

// Response
{
  images: ImageMetadata[]
}
```

#### DELETE `/api/upload`
Delete images:
```typescript
// Query Parameters
?userId=string&imageId=string

// Response
{
  success: boolean
}
```

#### PUT `/api/upload`
Update image metadata:
```typescript
// Request Body
{
  userId: string
  imageId: string
  description?: string
  tags?: string[]
}

// Response
{
  success: boolean
}
```

### Database Schema

#### `image_metadata` Table
```sql
CREATE TABLE image_metadata (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  tags TEXT[],
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Storage Bucket: `user-uploads`
- **Public Access**: Yes (with RLS policies)
- **File Size Limit**: 10MB
- **Allowed Types**: JPEG, PNG, WebP, GIF
- **Folder Structure**: `{userId}/{category}/{filename}`

## Usage Examples

### Basic Upload
```tsx
import { SupabaseImageUpload } from '@/components/supabase-image-upload'

function PropertyForm() {
  const handleUpload = (image) => {
    console.log('New image:', image.url)
  }

  return (
    <SupabaseImageUpload
      category="property"
      onUploadComplete={handleUpload}
    />
  )
}
```

### With Metadata
```tsx
<SupabaseImageUpload
  category="design-inspiration"
  maxFiles={10}
  showMetadata={true}
  onUploadComplete={(image) => {
    // Image includes description, tags, dimensions
    console.log('Image metadata:', image)
  }}
/>
```

### Custom Categories
```tsx
// Property images
<SupabaseImageUpload category="property" />

// Design inspiration
<SupabaseImageUpload category="design-inspiration" />

// Portfolio images
<SupabaseImageUpload category="portfolio" />
```

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### File Limits
- **Maximum File Size**: 10MB (configurable)
- **Maximum Files**: 10 per category (configurable)
- **Supported Formats**: JPEG, PNG, WebP, GIF
- **Image Processing**: Automatic optimization

## Security Features

### Access Control
- **User Authentication**: Required for all operations
- **Row Level Security**: Database-level access controls
- **Storage Policies**: Bucket-level access restrictions
- **File Validation**: Server-side type and size validation

### Data Protection
- **Secure URLs**: Time-limited access tokens
- **User Isolation**: Files organized by user ID
- **Automatic Cleanup**: Orphaned file detection
- **Audit Logging**: Upload and access tracking

## Error Handling

### Common Errors
- **Authentication Required**: User not signed in
- **File Too Large**: Exceeds size limit
- **Invalid Type**: Unsupported file format
- **Storage Full**: User quota exceeded
- **Network Error**: Upload interruption

### Error Recovery
- **Retry Logic**: Automatic retry for transient failures
- **Progress Persistence**: Resume interrupted uploads
- **User Feedback**: Clear error messages and suggestions
- **Fallback Options**: Alternative upload methods

## Performance Optimization

### Client-Side
- **Lazy Loading**: Images loaded on demand
- **Progressive Enhancement**: Graceful degradation
- **Caching**: Browser-level image caching
- **Compression**: Client-side image optimization

### Server-Side
- **CDN Delivery**: Global content distribution
- **Image Processing**: Server-side optimization
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient database connections

## Testing

### Test Page
Visit `/test-images` to test the upload system:
- Multiple category uploads
- Metadata management
- Error handling
- Progress tracking

### Manual Testing
1. **Upload Test**: Try various file types and sizes
2. **Metadata Test**: Add descriptions and tags
3. **Delete Test**: Remove uploaded images
4. **Edit Test**: Update image metadata
5. **Error Test**: Test with invalid files

## Troubleshooting

### Common Issues

#### Upload Fails
- Check user authentication
- Verify file size and type
- Check network connection
- Review browser console for errors

#### Images Not Displaying
- Verify Supabase URL configuration
- Check storage bucket policies
- Confirm file permissions
- Review CDN configuration

#### Metadata Not Saving
- Check database connection
- Verify RLS policies
- Review API endpoint logs
- Confirm user permissions

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Migration Guide

### From Vercel Blob
1. Update environment variables
2. Run database migration
3. Update component imports
4. Test upload functionality

### From Local Storage
1. Export existing images
2. Upload to Supabase Storage
3. Update database records
4. Verify access controls

## Best Practices

### File Management
- Use descriptive categories
- Add meaningful descriptions
- Tag images appropriately
- Regular cleanup of unused files

### Performance
- Optimize images before upload
- Use appropriate file formats
- Implement lazy loading
- Monitor storage usage

### Security
- Validate all uploads
- Implement rate limiting
- Monitor access patterns
- Regular security audits

## Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Test with `/test-images` page
4. Contact development team

## Changelog

### v2.0.0 (Current)
- Complete Supabase integration
- New upload components
- Enhanced metadata management
- Improved error handling
- Better performance optimization

### v1.0.0 (Legacy)
- Vercel Blob integration
- Basic upload functionality
- Limited metadata support
