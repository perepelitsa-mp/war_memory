'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { ModerationCardItem } from '@/components/admin/ModerationCardItem';
import { Loader2, Shield, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { FallenForModeration, ModerationStats } from '@/types';

export default function ModerationPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAdminAuth();

  const [cards, setCards] = useState<FallenForModeration[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchCards = async () => {
      try {
        const response = await fetch('/api/admin/moderation/cards');
        if (!response.ok) {
          throw new Error('Не удалось загрузить карточки');
        }
        const data = await response.json();
        setCards(data.cards || []);
        setStats(data.stats || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [isAdmin]);

  const handleModerate = async (
    cardId: string,
    action: 'approve' | 'reject',
    note?: string
  ) => {
    try {
      const response = await fetch('/api/admin/moderation/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId,
          action,
          moderationNote: note,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка модерации');
      }

      // Удаляем карточку из списка
      setCards((prev) => prev.filter((card) => card.id !== cardId));

      // Обновляем статистику
      if (stats) {
        setStats({
          ...stats,
          total_pending: stats.total_pending - 1,
          urgent_pending:
            cards.find((c) => c.id === cardId)?.priority === 'urgent'
              ? stats.urgent_pending - 1
              : stats.urgent_pending,
          approved_today:
            action === 'approve' ? stats.approved_today + 1 : stats.approved_today,
        });
      }
    } catch (err) {
      console.error('Error moderating card:', err);
      throw err;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        {/* Заголовок */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Модерация карточек</h1>
            <p className="text-muted-foreground">
              Проверка и одобрение новых карточек погибших
            </p>
          </div>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>На модерации</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.total_pending}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span>Срочные</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {stats.urgent_pending}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span>Одобрено сегодня</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.approved_today}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4" />
                <span>За неделю</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.approved_this_week}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Среднее время</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.avg_moderation_time_hours
                  ? `${stats.avg_moderation_time_hours}ч`
                  : '—'}
              </div>
            </div>
          </div>
        )}

        {/* Ошибка */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Список карточек */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-6 text-2xl font-semibold">
            Карточки на модерации ({cards.length})
          </h2>

          {cards.length === 0 && !error && (
            <div className="py-12 text-center">
              <Shield className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">Нет карточек на модерации</h3>
              <p className="text-muted-foreground">
                Все карточки проверены. Отличная работа!
              </p>
            </div>
          )}

          {cards.length > 0 && (
            <div className="space-y-6">
              {cards.map((card) => (
                <ModerationCardItem
                  key={card.id}
                  card={card}
                  onModerate={handleModerate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
