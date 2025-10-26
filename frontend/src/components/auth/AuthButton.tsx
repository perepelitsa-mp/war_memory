'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { LogIn, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface AuthButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

export function AuthButton({
  variant = 'ghost',
  size = 'sm',
  className,
  children,
}: AuthButtonProps) {
  const { isAuthenticated, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });

  const handleClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    setIsOpen(true);
  };

  // Если идет загрузка, показываем пустую кнопку
  if (loading) {
    return (
      <Button variant={variant} size={size} className={cn('relative overflow-hidden', className)} disabled>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-pulse rounded-full bg-current opacity-50" />
        </span>
      </Button>
    );
  }

  // Если пользователь авторизован, показываем "Личный кабинет" и "Выйти"
  if (isAuthenticated) {
    return (
      <>
        <Button variant={variant} size={size} className={cn('relative overflow-hidden', className)} asChild>
          <Link href="/profile">
            <motion.span
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="h-4 w-4" />
              Личный кабинет
            </motion.span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size={size}
          className="relative overflow-hidden"
          onClick={signOut}
        >
          <motion.span
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </motion.span>
        </Button>
      </>
    );
  }

  // Если не авторизован, показываем "Войти" с модальным окном
  return (
    <>
      <Button
        ref={buttonRef}
        variant={variant}
        size={size}
        className={cn('relative overflow-hidden', className)}
        onClick={handleClick}
      >
        <motion.span
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {children || (
            <>
              <LogIn className="h-4 w-4" />
              Войти
            </>
          )}
        </motion.span>
      </Button>

      {/* Анимация "ripple" от кнопки */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              position: 'fixed',
              left: buttonPosition.x,
              top: buttonPosition.y,
              width: 0,
              height: 0,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 111, 0, 0.2)',
              zIndex: 40,
              pointerEvents: 'none',
            }}
            animate={{
              width: 2000,
              height: 2000,
              left: buttonPosition.x - 1000,
              top: buttonPosition.y - 1000,
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        )}
      </AnimatePresence>

      <AuthModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
