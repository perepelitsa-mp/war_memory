import { createClient } from '@/lib/supabase/server';
import { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Проверка прав администратора на сервере
 * Используется в API routes
 */
export async function checkAdminAccess(): Promise<{
  authorized: boolean;
  user: SupabaseUser | null;
  role?: 'superadmin' | 'admin' | 'moderator' | 'owner' | 'editor' | 'user' | 'guest';
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Получаем текущего пользователя
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        authorized: false,
        user: null,
        error: 'Unauthorized',
      };
    }

    // Получаем роль пользователя из таблицы users
    const { data: userData, error: roleError } = await supabase
      .from('users')
      .select('role, is_deleted')
      .eq('id', user.id)
      .single();

    if (roleError || !userData) {
      return {
        authorized: false,
        user: null,
        error: 'User not found',
      };
    }

    // Проверяем, что пользователь не удален
    if (userData.is_deleted) {
      return {
        authorized: false,
        user: null,
        error: 'User is deleted',
      };
    }

    // Проверяем роль
    const allowedRoles: Array<'superadmin' | 'admin' | 'moderator'> = [
      'superadmin',
      'admin',
      'moderator',
    ];

    if (!allowedRoles.includes(userData.role as any)) {
      return {
        authorized: false,
        user,
        role: userData.role,
        error: 'Insufficient permissions',
      };
    }

    return {
      authorized: true,
      user,
      role: userData.role,
    };
  } catch (error) {
    console.error('Error checking admin access:', error);
    return {
      authorized: false,
      user: null,
      error: 'Internal error',
    };
  }
}

/**
 * Проверка конкретной роли
 */
export async function hasRole(
  allowedRoles: Array<'superadmin' | 'admin' | 'moderator' | 'owner' | 'editor' | 'user' | 'guest'>
): Promise<boolean> {
  const { authorized, role } = await checkAdminAccess();
  return authorized && role ? allowedRoles.includes(role) : false;
}
