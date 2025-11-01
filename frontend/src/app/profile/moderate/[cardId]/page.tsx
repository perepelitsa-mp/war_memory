'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ModerationItem } from '@/components/profile/ModerationItem';
import { ArrowLeft, Loader2, Clock, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom';

interface PendingData {
  timeline: any[];
  memory: any[];
  comments: any[];
}

export default function ModerationPage({ params }: { params: { cardId: string } }) {
  const { alert } = useConfirmDialog();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<PendingData>({ timeline: [], memory: [], comments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'memory' | 'comments'>('timeline');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchPendingItems = async () => {
      try {
        const response = await fetch(`/api/profile/pending/${params.cardId}`);
        if (!response.ok) {
          throw new Error('Не удалось загрузить элементы');
        }
        const fetchedData = await response.json();
        setData(fetchedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingItems();
  }, [user, params.cardId]);

  const handleModerate = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/profile/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          itemType: activeTab === 'timeline' ? 'timeline' : activeTab === 'memory' ? 'memory' : 'comment',
          action,
          cardId: params.cardId,
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось выполнить модерацию');
      }

      // Обновляем список
      setData((prev) => {
        const newData = { ...prev };
        if (activeTab === 'timeline') {
          newData.timeline = newData.timeline.filter((item) => item.id !== itemId);
        } else if (activeTab === 'memory') {
          newData.memory = newData.memory.filter((item) => item.id !== itemId);
        } else {
          newData.comments = newData.comments.filter((item) => item.id !== itemId);
        }
        return newData;
      });
    } catch (err) {
      await alert({
        title: 'Ошибка',
        description: err instanceof Error ? err.message : 'Ошибка модерации',
        confirmText: 'Закрыть',
        variant: 'error',
      });
    }
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

  const activeItems =
    activeTab === 'timeline'
      ? data.timeline.map((item) => ({ ...item, type: 'timeline' as const }))
      : activeTab === 'memory'
        ? data.memory.map((item) => ({ ...item, type: 'memory' as const }))
        : data.comments.map((item) => ({ ...item, type: 'comment' as const }));

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-5xl">
        {/* Шапка */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/profile">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к списку карточек
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Модерация элементов</h1>
          <p className="text-muted-foreground">
            Проверьте и одобрите элементы, добавленные другими пользователями
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Табы */}
        <div className="mb-6 flex gap-2 rounded-lg border border-border bg-surface p-1">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'timeline'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="h-4 w-4" />
            События ({data.timeline.length})
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'memory'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            Воспоминания ({data.memory.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Комментарии ({data.comments.length})
          </button>
        </div>

        {/* Список элементов */}
        <div className="space-y-4">
          {activeItems.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Нет элементов для модерации</p>
            </div>
          )}

          {activeItems.map((item) => (
            <ModerationItem
              key={item.id}
              item={item}
              cardId={params.cardId}
              onModerate={handleModerate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
