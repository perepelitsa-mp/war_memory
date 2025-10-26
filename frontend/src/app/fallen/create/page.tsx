'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { EditHeroProfile } from '@/components/fallen/EditHeroProfile';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CreateFallenPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/fallen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Не удалось создать карточку');
      }

      const result = await response.json();

      // Перенаправляем на страницу редактирования чтобы добавить контент
      router.push(`/fallen/${result.id}/edit`);
    } catch (error) {
      console.error('Error creating fallen:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/profile');
  };

  if (authLoading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        {/* Шапка */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/profile">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к профилю
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Создание карточки памяти</h1>
          <p className="text-muted-foreground">
            Заполните основную информацию о погибшем герое. После создания вы сможете добавить события жизни, фотографии и награды.
          </p>
        </div>

        {/* Важное примечание */}
        <div className="mb-8 rounded-lg border border-orange-500/50 bg-orange-500/10 p-4">
          <h3 className="mb-2 font-semibold text-orange-600">Важная информация</h3>
          <ul className="space-y-1 text-sm text-orange-600/90">
            <li>• Создавать карточки могут только родственники погибших</li>
            <li>• Сначала заполните основную информацию, затем добавите события, фото и награды</li>
            <li>• После создания карточка будет отправлена на модерацию администраторам</li>
            <li>• Обязательные поля: Фамилия и Имя</li>
          </ul>
        </div>

        {/* Форма */}
        <EditHeroProfile onSave={handleSave} onCancel={handleCancel} />
      </div>
    </div>
  );
}
