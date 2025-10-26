'use client';

import { useState } from 'react';
import { Check, X, Clock, User, Calendar, MapPin, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DocumentViewer } from './DocumentViewer';
import { ModerationDialog } from './ModerationDialog';
import { FallenForModeration } from '@/types';

interface ModerationCardItemProps {
  card: FallenForModeration;
  onModerate: (cardId: string, action: 'approve' | 'reject', note?: string) => Promise<void>;
}

export function ModerationCardItem({ card, onModerate }: ModerationCardItemProps) {
  const [loading, setLoading] = useState(false);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject' | null;
  }>({ isOpen: false, action: null });

  const handleOpenDialog = (action: 'approve' | 'reject') => {
    setDialogState({ isOpen: true, action });
  };

  const handleCloseDialog = () => {
    setDialogState({ isOpen: false, action: null });
  };

  const handleConfirmModeration = async (note: string) => {
    if (!dialogState.action) return;

    setLoading(true);
    try {
      await onModerate(card.id, dialogState.action, note);
      handleCloseDialog();
    } catch (error) {
      console.error('Error moderating card:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const fullName = [card.last_name, card.first_name, card.middle_name]
    .filter(Boolean)
    .join(' ');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Срочно';
      case 'high':
        return 'Высокий';
      default:
        return 'Обычный';
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
        {/* Заголовок с приоритетом */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {card.hero_photo_url ? (
              <img
                src={card.hero_photo_url}
                alt={fullName}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <Avatar className="h-16 w-16">
                <AvatarFallback>
                  {card.first_name[0]}
                  {card.last_name[0]}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h3 className="text-xl font-semibold">{fullName}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(card.birth_date)} — {formatDate(card.death_date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(card.priority)}>
              {getPriorityLabel(card.priority)}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {card.days_in_queue} дн.
            </Badge>
          </div>
        </div>

        {/* Информация о погибшем */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {card.rank && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Звание:</span>
              <span>{card.rank}</span>
            </div>
          )}
          {card.military_unit && (
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Воинская часть:</span>
              <span>{card.military_unit}</span>
            </div>
          )}
          {card.hometown && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Населенный пункт:</span>
              <span>{card.hometown}</span>
            </div>
          )}
          {card.relationship && (
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Родство:</span>
              <span>{card.relationship}</span>
            </div>
          )}
        </div>

        {/* Памятный текст */}
        {card.memorial_text && (
          <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm italic leading-relaxed text-muted-foreground">
              {card.memorial_text}
            </p>
          </div>
        )}

        {/* Биография */}
        {card.biography_md && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-semibold">Биография</h4>
            <div className="prose prose-sm max-w-none rounded-lg border border-border bg-background p-4">
              {card.biography_md}
            </div>
          </div>
        )}

        {/* Владелец карточки */}
        <div className="mb-4 rounded-lg border border-border bg-background p-4">
          <h4 className="mb-3 text-sm font-semibold">Владелец карточки</h4>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {card.owner.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{card.owner.full_name}</p>
              <p className="text-sm text-muted-foreground">{card.owner.email || '—'}</p>
            </div>
          </div>
        </div>

        {/* Справка о родстве */}
        <div className="mb-6">
          <DocumentViewer
            documentUrl={card.proof_document_url}
            label="Справка о родстве"
          />
        </div>

        {/* Метаданные */}
        <div className="mb-4 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>Создана: {formatDate(card.created_at)}</span>
          </div>
        </div>

        {/* Кнопки модерации */}
        <div className="flex gap-3">
          <Button
            onClick={() => handleOpenDialog('approve')}
            disabled={loading}
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4" />
            Одобрить
          </Button>
          <Button
            onClick={() => handleOpenDialog('reject')}
            disabled={loading}
            variant="outline"
            className="flex-1 gap-2 border-red-500 text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
            Отклонить
          </Button>
        </div>
      </div>

      {/* Диалог модерации */}
      {dialogState.action && (
        <ModerationDialog
          isOpen={dialogState.isOpen}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmModeration}
          cardName={fullName}
          action={dialogState.action}
          loading={loading}
        />
      )}
    </>
  );
}
