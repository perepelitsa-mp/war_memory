'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Хук для проверки прав на удаление контента (комментариев и воспоминаний)
 * Может удалять: владелец карточки или admin/superadmin/moderator
 */
export function useCanDeleteContent(fallenId: string) {
  const [canDelete, setCanDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Получаем текущего пользователя
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setCanDelete(false);
          setLoading(false);
          return;
        }

        // Получаем роль пользователя и информацию о карточке
        const [{ data: userData }, { data: fallenData }] = await Promise.all([
          supabase.from('users').select('role, is_deleted').eq('id', user.id).single(),
          supabase.from('fallen').select('owner_id').eq('id', fallenId).single(),
        ]);

        if (!userData || userData.is_deleted || !fallenData) {
          setCanDelete(false);
          setLoading(false);
          return;
        }

        // Проверяем: является ли пользователь владельцем карточки или админом
        const isOwner = fallenData.owner_id === user.id;
        const isAdmin = ['superadmin', 'admin', 'moderator'].includes(userData.role);

        setCanDelete(isOwner || isAdmin);
        setLoading(false);
      } catch (error) {
        console.error('Error checking delete permissions:', error);
        setCanDelete(false);
        setLoading(false);
      }
    };

    checkPermissions();

    // Подписываемся на изменения авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkPermissions();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fallenId]);

  return { canDelete, loading };
}
