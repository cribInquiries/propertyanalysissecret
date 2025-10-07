-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for user-uploads bucket
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow public access to files (for now - you can restrict this later)
CREATE POLICY "Public files are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'user-uploads');


