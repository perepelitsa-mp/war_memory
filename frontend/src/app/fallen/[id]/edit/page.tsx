'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { EditHeroProfile } from '@/components/fallen/EditHeroProfile';
import { TimelineWithForm } from '@/components/fallen/TimelineWithForm';
import { MemoryBoard } from '@/components/fallen/MemoryBoard';
import { AwardsSection } from '@/components/fallen/AwardsSection';
import { ArrowLeft, Loader2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import type {
  TimelineItem,
  MemoryItemWithDetails,
  Award,
  FallenAwardWithDetails,
} from '@/types';

interface Fallen {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  birth_date: string | null;
  death_date: string | null;
  rank: string | null;
  military_unit: string | null;
  call_sign: string | null;
  hometown: string | null;
  burial_location: string | null;
  memorial_text: string | null;
  biography_md: string | null;
  hero_photo_url: string | null;
  owner_id: string;
}

export default function EditFallenPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [fallen, setFallen] = useState<Fallen | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [memories, setMemories] = useState<MemoryItemWithDetails[]>([]);
  const [awards, setAwards] = useState<FallenAwardWithDetails[]>([]);
  const [availableAwards, setAvailableAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch fallen data
        const fallenResponse = await fetch(`/api/fallen/${params.id}/detail`);
        if (!fallenResponse.ok) {
          throw new Error('Не удалось загрузить карточку');
        }
        const fallenData = await fallenResponse.json();

        // Check ownership
        if (fallenData.fallen.owner_id !== user.id) {
          setError('У вас нет прав на редактирование этой карточки');
          return;
        }

        setFallen(fallenData.fallen);

        // Fetch timeline, memories, and awards
        // Note: For edit mode, we might want to show ALL items (not just approved)
        // but for now we'll follow the same pattern as the view page

        // Timeline
        if (fallenData.timeline) {
          setTimeline(fallenData.timeline);
        }

        // Memories
        if (fallenData.memories) {
          setMemories(fallenData.memories);
        }

        // Awards
        if (fallenData.awards) {
          setAwards(fallenData.awards);
        }

        // Fetch available awards
        const awardsResponse = await fetch('/api/awards');
        if (awardsResponse.ok) {
          const awardsData = await awardsResponse.json();
          setAvailableAwards(awardsData.awards || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, params.id]);

  const handleSave = async (data: any) => {
    try {
      const response = await fetch(`/api/fallen/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Не удалось обновить карточку');
      }

      // Refresh the page to show updated data
      router.refresh();
      setShowProfileEdit(false);
    } catch (error) {
      console.error('Error updating fallen:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push(`/fallen/${params.id}`);
  };

  if (authLoading || loading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold text-red-600">Ошибка</h2>
            <p className="text-red-600/90">{error}</p>
            <Button asChild className="mt-4">
              <Link href="/profile">Вернуться к профилю</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!fallen) {
    return null;
  }

  return (
    <div className="container space-y-12 py-10 md:space-y-16 md:py-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href={`/fallen/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к карточке
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Режим редактирования</span>
        </div>
      </div>

      {/* Profile Section */}
      <Card className="border border-primary/30 bg-surface/80 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {fallen.last_name} {fallen.first_name} {fallen.middle_name}
            </h2>
            <p className="text-sm text-muted-foreground">Основная информация о герое</p>
          </div>
          <Button
            onClick={() => setShowProfileEdit(!showProfileEdit)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            {showProfileEdit ? 'Скрыть форму' : 'Редактировать профиль'}
          </Button>
        </div>

        {showProfileEdit && (
          <EditHeroProfile
            initialData={{
              first_name: fallen.first_name,
              last_name: fallen.last_name,
              middle_name: fallen.middle_name || undefined,
              birth_date: fallen.birth_date || undefined,
              death_date: fallen.death_date || undefined,
              rank: fallen.rank || undefined,
              military_unit: fallen.military_unit || undefined,
              call_sign: fallen.call_sign || undefined,
              hometown: fallen.hometown || undefined,
              burial_location: fallen.burial_location || undefined,
              memorial_text: fallen.memorial_text || undefined,
              biography_md: fallen.biography_md || undefined,
              hero_photo_url: fallen.hero_photo_url || undefined,
            }}
            onSave={handleSave}
            onCancel={() => setShowProfileEdit(false)}
          />
        )}
      </Card>

      {/* Awards Section */}
      <AwardsSection
        awards={awards}
        fallenId={params.id}
        availableAwards={availableAwards}
      />

      {/* Timeline and Memories */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TimelineWithForm items={timeline} fallenId={params.id} />
        <MemoryBoard memories={memories} fallenId={params.id} />
      </div>

      {/* Actions */}
      <Card className="border border-border/50 bg-background/70 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">Готовы завершить редактирование?</h3>
            <p className="text-sm text-muted-foreground">
              Все изменения сохраняются автоматически
            </p>
          </div>
          <Button onClick={handleCancel} className="sm:w-auto">
            Вернуться к просмотру
          </Button>
        </div>
      </Card>
    </div>
  );
}
