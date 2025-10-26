-- Создание bucket для фотографий погибших
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fallen-photos',
  'fallen-photos',
  true, -- публичный bucket для доступа к фото
  1048576, -- 1 МБ = 1024 * 1024 байт
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Политика: Authenticated users могут загружать фото
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'fallen-photos');

-- Политика: Публичный доступ на чтение фото
CREATE POLICY "Public read access to photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fallen-photos');

-- Политика: Владельцы могут удалять свои фото
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'fallen-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Политика: Владельцы могут обновлять свои фото
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'fallen-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
