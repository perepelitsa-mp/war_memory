'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: AuthMode;
}

export function AuthModal({ open, onOpenChange, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);

  const handleSuccess = () => {
    onOpenChange(false);
    // TODO: Обработка успешной авторизации (редирект, обновление состояния и т.д.)
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {mode === 'login' ? 'Вход в систему' : 'Регистрация'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Войдите в свою учетную запись для доступа к функциям мемориала'
              : 'Создайте учетную запись для сохранения памяти'}
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4">
          {/* Переключатель режимов */}
          <div className="mb-6 flex rounded-xl border border-border/60 bg-surface/40 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={cn(
                'relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300',
                mode === 'login'
                  ? 'text-foreground'
                  : 'text-foreground/60 hover:text-foreground/80',
              )}
            >
              {mode === 'login' && (
                <motion.span
                  layoutId="auth-mode-bg"
                  className="absolute inset-0 rounded-lg bg-background shadow-soft"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" />
                Вход
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode('register')}
              className={cn(
                'relative flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300',
                mode === 'register'
                  ? 'text-foreground'
                  : 'text-foreground/60 hover:text-foreground/80',
              )}
            >
              {mode === 'register' && (
                <motion.span
                  layoutId="auth-mode-bg"
                  className="absolute inset-0 rounded-lg bg-background shadow-soft"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                Регистрация
              </span>
            </button>
          </div>

          {/* Формы */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {mode === 'login' ? (
                <LoginForm onSuccess={handleSuccess} />
              ) : (
                <RegisterForm onSuccess={handleSuccess} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
