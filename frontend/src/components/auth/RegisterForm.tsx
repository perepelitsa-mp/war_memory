'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Phone, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Введите ФИО (минимум 2 символа)')
      .regex(/^[А-Яа-яЁёA-Za-z\s\-]+$/, 'ФИО может содержать только буквы, пробелы и дефисы'),
    email: z.string().min(1, 'Введите email').email('Неверный формат email'),
    phone: z
      .string()
      .min(1, 'Введите номер телефона')
      .regex(/^\+?[0-9\s\-()]+$/, 'Неверный формат номера телефона'),
    password: z
      .string()
      .min(6, 'Пароль должен содержать минимум 6 символов')
      .regex(/[A-Za-z]/, 'Пароль должен содержать хотя бы одну букву')
      .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
    consent: z.boolean().refine((value) => value === true, {
      message: 'Необходимо дать согласие на обработку персональных данных',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      consent: false,
    },
  });

  const consentValue = watch('consent');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Регистрируем пользователя через Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Обновляем телефон в auth.users (встроенная таблица Supabase)
        // Database триггер автоматически создаст запись в public.users
        const { error: updateAuthError } = await supabase.auth.updateUser({
          phone: data.phone,
          data: {
            full_name: data.fullName,
            phone: data.phone,
          },
        });

        if (updateAuthError) {
          console.warn('Не удалось обновить телефон в auth.users:', updateAuthError);
          // Не бросаем ошибку, продолжаем регистрацию
        }

        // Ждем, пока триггер создаст запись в public.users (небольшая задержка)
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            ФИО <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="fullName"
              type="text"
              placeholder="Иванов Иван Иванович"
              className="pl-10"
              {...register('fullName')}
              disabled={isLoading}
            />
          </div>
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="example@mail.ru"
              className="pl-10"
              {...register('email')}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Номер телефона <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+7 (900) 123-45-67"
              className="pl-10"
              {...register('phone')}
              disabled={isLoading}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Пароль <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Минимум 6 символов"
              className="pl-10 pr-10"
              {...register('password')}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Подтверждение пароля <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Повторите пароль"
              className="pl-10 pr-10"
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Чекбокс согласия на обработку персональных данных */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={consentValue}
              onCheckedChange={(checked) => setValue('consent', checked === true)}
              disabled={isLoading}
              className="mt-0.5"
            />
            <label
              htmlFor="consent"
              className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
            >
              Я подтверждаю ознакомление и даю{' '}
              <Link
                href="/consent"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Согласие
              </Link>{' '}
              на обработку моих персональных данных в порядке и на условиях, указанных в{' '}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Политике конфиденциальности
              </Link>
              *
            </label>
          </div>
          {errors.consent && (
            <p className="text-sm text-destructive">{errors.consent.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-ribbon-orange to-primary shadow-glow hover:shadow-glow/80"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Регистрация...
            </>
          ) : (
            'Зарегистрироваться'
          )}
        </Button>
      </form>
    </div>
  );
}
