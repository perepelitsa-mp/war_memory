'use client';

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ModerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void>;
  cardName: string;
  action: 'approve' | 'reject';
  loading?: boolean;
}

export function ModerationDialog({
  isOpen,
  onClose,
  onConfirm,
  cardName,
  action,
  loading = false,
}: ModerationDialogProps) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    // Для отклонения заметка обязательна
    if (action === 'reject' && !note.trim()) {
      setError('Для отклонения необходимо указать причину');
      return;
    }

    setError('');
    await onConfirm(note.trim());
    setNote(''); // Очищаем после успеха
  };

  const handleClose = () => {
    if (!loading) {
      setNote('');
      setError('');
      onClose();
    }
  };

  const isApprove = action === 'approve';
  const title = isApprove ? 'Одобрить карточку' : 'Отклонить карточку';
  const description = isApprove
    ? `Вы собираетесь одобрить карточку "${cardName}". Карточка станет доступна для публичного просмотра.`
    : `Вы собираетесь отклонить карточку "${cardName}". Владелец получит уведомление с причиной отклонения.`;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className={isApprove ? 'text-green-600' : 'text-red-600'}>
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isApprove && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>Причина отклонения обязательна для заполнения</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="moderation-note">
              {isApprove ? 'Заметка (необязательно)' : 'Причина отклонения*'}
            </Label>
            <Textarea
              id="moderation-note"
              placeholder={
                isApprove
                  ? 'Дополнительные комментарии...'
                  : 'Укажите причину отклонения карточки...'
              }
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (error) setError('');
              }}
              rows={4}
              className={error ? 'border-red-500' : ''}
              disabled={loading}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={
              isApprove
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }
          >
            {loading
              ? 'Обработка...'
              : isApprove
              ? 'Одобрить'
              : 'Отклонить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
