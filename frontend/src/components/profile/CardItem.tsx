'use client';

import Link from 'next/link';
import { Calendar, Clock, User, MessageSquare, Image, Award, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CardItemProps {
  card: {
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
  };
}

export function CardItem({ card }: CardItemProps) {
  const fullName = `${card.last_name} ${card.first_name} ${card.middle_name || ''}`.trim();
  const hasPending = card.pendingCounts.total > 0;

  // Форматирование даты
  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU');
  };

  // Статус карточки
  const getStatusBadge = () => {
    switch (card.status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Опубликована</Badge>;
      case 'pending':
        return <Badge variant="secondary">На модерации</Badge>;
      case 'draft':
        return <Badge variant="outline">Черновик</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 transition-all hover:border-primary/50 hover:shadow-lg">
      <div className="flex items-start gap-6">
        {/* Фото */}
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          {card.hero_photo_url ? (
            <img
              src={card.hero_photo_url}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Информация */}
        <div className="flex-1">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold">{fullName}</h3>
              {card.rank && <p className="text-sm text-muted-foreground">{card.rank}</p>}
            </div>
            {getStatusBadge()}
          </div>

          <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {card.birth_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(card.birth_date)}</span>
              </div>
            )}
            {card.death_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(card.death_date)}</span>
              </div>
            )}
          </div>

          {/* Счетчики модерации */}
          {hasPending && (
            <div className="flex flex-wrap gap-3">
              {card.pendingCounts.timeline > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-600">
                  <Clock className="h-4 w-4" />
                  <span>События: {card.pendingCounts.timeline}</span>
                </div>
              )}
              {card.pendingCounts.memory > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-600">
                  <Image className="h-4 w-4" />
                  <span>Воспоминания: {card.pendingCounts.memory}</span>
                </div>
              )}
              {card.pendingCounts.comments > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600">
                  <MessageSquare className="h-4 w-4" />
                  <span>Комментарии: {card.pendingCounts.comments}</span>
                </div>
              )}
            </div>
          )}

          {!hasPending && (
            <p className="text-sm text-muted-foreground">Нет элементов на модерации</p>
          )}
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-4">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={`/fallen/${card.id}`}>
            <Eye className="h-4 w-4" />
            Просмотр
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={`/fallen/${card.id}/edit`}>
            <Edit className="h-4 w-4" />
            Редактировать
          </Link>
        </Button>
        {hasPending && (
          <Button asChild variant="default" size="sm" className="gap-2">
            <Link href={`/profile/moderate/${card.id}`}>
              <MessageSquare className="h-4 w-4" />
              Модерация ({card.pendingCounts.total})
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
