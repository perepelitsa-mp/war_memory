'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CardItem } from '@/components/profile/CardItem';
import { Loader2, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Card {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  birth_date: string | null;
  death_date: string | null;
  rank: string | null;
  hero_photo_url: string | null;
  status: string;
  created_at: string;
  pendingCounts: {
    timeline: number;
    memory: number;
    comments: number;
    total: number;
  };
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchCards = async () => {
      try {
        const response = await fetch('/api/profile/my-cards');
        if (!response.ok) {
          throw new Error('Не удалось загрузить карточки');
        }
        const data = await response.json();
        setCards(data.cards || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [user]);

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

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        {/* Заголовок */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Личный кабинет</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button asChild className="gap-2">
            <Link href="/fallen/create">
              <Plus className="h-5 w-5" />
              Создать карточку
            </Link>
          </Button>
        </div>

        {/* Карточки */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-6 text-2xl font-semibold">Мои карточки</h2>

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {cards.length === 0 && !error && (
            <div className="py-12 text-center">
              <User className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">У вас пока нет карточек</h3>
              <p className="mb-6 text-muted-foreground">
                Создайте первую карточку памяти о погибшем герое
              </p>
              <Button asChild>
                <Link href="/fallen/create">
                  <Plus className="mr-2 h-5 w-5" />
                  Создать карточку
                </Link>
              </Button>
            </div>
          )}

          {cards.length > 0 && (
            <div className="space-y-4">
              {cards.map((card) => (
                <CardItem key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>

        {/* Статистика */}
        {cards.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="text-3xl font-bold text-primary">{cards.length}</div>
              <div className="text-sm text-muted-foreground">Всего карточек</div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="text-3xl font-bold text-orange-600">
                {cards.reduce((sum, card) => sum + card.pendingCounts.timeline, 0)}
              </div>
              <div className="text-sm text-muted-foreground">События на модерации</div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="text-3xl font-bold text-blue-600">
                {cards.reduce((sum, card) => sum + card.pendingCounts.memory, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Воспоминания на модерации</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
