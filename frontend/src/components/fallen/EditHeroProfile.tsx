'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarDays, MapPin, Shield, Flame, User, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

const heroProfileSchema = z.object({
  first_name: z.string().min(1, 'Обязательное поле'),
  last_name: z.string().min(1, 'Обязательное поле'),
  middle_name: z.string().optional(),
  birth_date: z.string().optional(),
  death_date: z.string().optional(),
  rank: z.string().optional(),
  military_unit: z.string().optional(),
  hometown: z.string().optional(),
  burial_location: z.string().optional(),
  memorial_text: z.string().optional(),
  biography_md: z.string().optional(),
  hero_photo_url: z.string().optional(),
});

type HeroProfileData = z.infer<typeof heroProfileSchema>;

interface EditHeroProfileProps {
  initialData?: Partial<HeroProfileData>;
  onSave: (data: HeroProfileData) => Promise<void>;
  onCancel?: () => void;
}

export function EditHeroProfile({ initialData, onSave, onCancel }: EditHeroProfileProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.hero_photo_url || null);
  const [uploadProgress, setUploadProgress] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<HeroProfileData>({
    resolver: zodResolver(heroProfileSchema),
    defaultValues: initialData || {},
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Валидация размера (1 МБ)
    if (file.size > 1 * 1024 * 1024) {
      setError('Файл слишком большой. Максимальный размер: 1 МБ');
      return;
    }

    // Валидация типа
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Недопустимый тип файла. Разрешены: JPEG, PNG, WebP');
      return;
    }

    setPhotoFile(file);
    setError(null);

    // Создаем preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setValue('hero_photo_url', '');
  };

  const onSubmit = async (data: HeroProfileData) => {
    setLoading(true);
    setError(null);
    try {
      let photoUrl = data.hero_photo_url;

      // Если выбрано новое фото - загружаем его
      if (photoFile) {
        setUploadProgress(true);
        const formData = new FormData();
        formData.append('file', photoFile);

        const uploadResponse = await fetch('/api/upload/photo', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || 'Ошибка загрузки фото');
        }

        const uploadData = await uploadResponse.json();
        photoUrl = uploadData.url;
        setUploadProgress(false);
      }

      // Сохраняем данные карточки с URL фото
      await onSave({ ...data, hero_photo_url: photoUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setLoading(false);
      setUploadProgress(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Основная информация */}
      <Card className="border border-border/50 bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Основная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="last_name">
                Фамилия <span className="text-destructive">*</span>
              </Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Иванов"
                disabled={loading}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">
                Имя <span className="text-destructive">*</span>
              </Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="Александр"
                disabled={loading}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="middle_name">Отчество</Label>
              <Input
                id="middle_name"
                {...register('middle_name')}
                placeholder="Сергеевич"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_photo">Фотография героя</Label>

            {/* Preview фото */}
            {photoPreview && (
              <div className="relative w-full max-w-md">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border">
                  <Image
                    src={photoPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={removePhoto}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Input для загрузки файла */}
            {!photoPreview && (
              <div className="flex items-center gap-4">
                <Input
                  id="hero_photo"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  disabled={loading}
                  className="cursor-pointer"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Максимальный размер: 1 МБ. Форматы: JPEG, PNG, WebP
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Даты и служба */}
      <Card className="border border-border/50 bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Даты и служба
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="birth_date">Дата рождения</Label>
              <Input
                id="birth_date"
                type="date"
                {...register('birth_date')}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="death_date">Дата гибели</Label>
              <Input
                id="death_date"
                type="date"
                {...register('death_date')}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rank">Звание</Label>
            <Input
              id="rank"
              {...register('rank')}
              placeholder="Сержант"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="military_unit">Подразделение</Label>
            <Input
              id="military_unit"
              {...register('military_unit')}
              placeholder="200-я мотострелковая бригада"
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Места */}
      <Card className="border border-border/50 bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Места
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hometown">Родной город</Label>
            <Input
              id="hometown"
              {...register('hometown')}
              placeholder="пос. Кавалерово"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="burial_location">Место захоронения</Label>
            <Input
              id="burial_location"
              {...register('burial_location')}
              placeholder="ДНР, г. Мариуполь"
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Тексты */}
      <Card className="border border-border/50 bg-background/70 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Тексты памяти
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memorial_text">Слова памяти</Label>
            <Textarea
              id="memorial_text"
              {...register('memorial_text')}
              placeholder="Герой, отдавший свою жизнь за свободу Донбасса..."
              rows={4}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Короткий текст памяти (400-600 символов)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="biography_md">Биография (Markdown)</Label>
            <Textarea
              id="biography_md"
              {...register('biography_md')}
              placeholder="# Биография&#10;&#10;Александр родился..."
              rows={10}
              disabled={loading}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Поддерживается Markdown для форматирования
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Кнопки */}
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadProgress ? 'Загрузка фото...' : 'Сохранение...'}
            </>
          ) : (
            'Сохранить'
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}
