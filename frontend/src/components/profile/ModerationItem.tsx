'use client';

import { useState } from 'react';
import { Check, X, Clock, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModerationItemProps {
  item: {
    id: string;
    type: 'timeline' | 'memory' | 'comment';
    title?: string;
    content_md?: string;
    content?: string;
    year?: number;
    date_exact?: string;
    description_md?: string;
    created_at: string;
    users?: {
      full_name: string;
      email: string;
    };
  };
  cardId: string;
  onModerate: (itemId: string, action: 'approve' | 'reject') => Promise<void>;
}

export function ModerationItem({ item, cardId, onModerate }: ModerationItemProps) {
  const [loading, setLoading] = useState(false);

  const handleModerate = async (action: 'approve' | 'reject') => {
    setLoading(true);
    try {
      await onModerate(item.id, action);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'timeline':
        return 'Событие таймлайна';
      case 'memory':
        return 'Воспоминание';
      case 'comment':
        return 'Комментарий';
    }
  };

  const getContent = () => {
    if (item.type === 'timeline') {
      return {
        title: item.title || 'Без названия',
        description: item.description_md || '',
        date: item.date_exact
          ? new Date(item.date_exact).toLocaleDateString('ru-RU')
          : item.year?.toString() || '',
      };
    } else if (item.type === 'memory') {
      return {
        title: item.title || 'Без названия',
        description: item.content_md || '',
      };
    } else {
      return {
        description: item.content || '',
      };
    }
  };

  const content = getContent();

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {getTypeLabel()}
            </span>
            {item.type !== 'comment' && content.date && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{content.date}</span>
              </div>
            )}
          </div>

          {content.title && <h3 className="mb-2 text-lg font-semibold">{content.title}</h3>}

          {content.description && (
            <div className="prose prose-sm mb-4 max-w-none text-muted-foreground">
              {content.description}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{item.users?.full_name || 'Неизвестный пользователь'}</span>
            <span>•</span>
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDate(item.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => handleModerate('approve')}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          Одобрить
        </Button>
        <Button
          onClick={() => handleModerate('reject')}
          disabled={loading}
          variant="outline"
          className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
        >
          <X className="mr-2 h-4 w-4" />
          Отклонить
        </Button>
      </div>
    </div>
  );
}
