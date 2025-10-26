'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

type UserRole = 'superadmin' | 'admin' | 'moderator' | 'owner' | 'editor' | 'user' | 'guest';

interface AdminAuthState {
  user: User | null;
  role: UserRole | null;
  isAdmin: boolean;
  loading: boolean;
}

/**
 * Хук для проверки прав администратора на клиенте
 * Автоматически редиректит на главную, если нет прав
 */
export function useAdminAuth(options: { redirectOnUnauthorized?: boolean } = {}) {
  const { redirectOnUnauthorized = true } = options;
  const router = useRouter();
  const supabase = createClient();

  const [state, setState] = useState<AdminAuthState>({
    user: null,
    role: null,
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Получаем текущего пользователя
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setState({
            user: null,
            role: null,
            isAdmin: false,
            loading: false,
          });

          if (redirectOnUnauthorized) {
            router.push('/');
          }
          return;
        }

        // Получаем роль пользователя
        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('role, is_deleted')
          .eq('id', user.id)
          .single();

        if (roleError || !userData || userData.is_deleted) {
          setState({
            user: null,
            role: null,
            isAdmin: false,
            loading: false,
          });

          if (redirectOnUnauthorized) {
            router.push('/');
          }
          return;
        }

        const role = userData.role as UserRole;
        const allowedRoles: UserRole[] = ['superadmin', 'admin', 'moderator'];
        const isAdmin = allowedRoles.includes(role);

        setState({
          user,
          role,
          isAdmin,
          loading: false,
        });

        if (!isAdmin && redirectOnUnauthorized) {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
        setState({
          user: null,
          role: null,
          isAdmin: false,
          loading: false,
        });

        if (redirectOnUnauthorized) {
          router.push('/');
        }
      }
    };

    checkAuth();

    // Подписываемся на изменения авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, redirectOnUnauthorized]);

  return state;
}

/**
 * Хук для проверки конкретных ролей
 */
export function useHasRole(allowedRoles: UserRole[]) {
  const { role, loading } = useAdminAuth({ redirectOnUnauthorized: false });

  return {
    hasRole: role ? allowedRoles.includes(role) : false,
    role,
    loading,
  };
}
