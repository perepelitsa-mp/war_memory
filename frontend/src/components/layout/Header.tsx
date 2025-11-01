'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Flame, Menu, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { AuthButton } from '@/components/auth/AuthButton';
import { useHasRole } from '@/hooks/useAdminAuth';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  href: string;
  label: string;
  hideOnDesktop?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Главная', hideOnDesktop: true }, // Логотип уже ведет на главную
  { href: '/about', label: 'О проекте' }, // Короче
  { href: '/stats', label: 'Статистика' },
  { href: '/education', label: 'Образование' },
  { href: '/burial-map', label: 'Карта' }, // Сокращено
  { href: '/chronicles', label: 'Хроника' },
];

export function Header() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
  });
  const progressScale = useTransform(progress, [0, 1], [0, 1]);
  const shadowOpacity = useTransform(progress, [0, 0.2], [0, 0.15]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { hasRole } = useHasRole(['superadmin', 'admin', 'moderator']);

  return (
    <motion.header
      className="sticky top-0 z-50 w-full backdrop-blur-xl"
      style={{
        boxShadow: useTransform(shadowOpacity, (value) => `0 16px 40px rgba(10, 12, 15, ${value})`),
      }}
    >
      <div className="relative border-b border-border/60 bg-background/70">
        <div className="container flex h-16 items-center justify-between gap-3 sm:gap-4">
          <Link href="/" className="relative flex items-center gap-2 sm:gap-2.5">
            <img
              src="/images/logotype.webp"
              alt="Логотип Память героев"
              className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
            />
            <div className="flex flex-col">
              <span className="hidden text-[10px] uppercase tracking-[0.3em] text-primary/90 xl:block">
                Цифровой мемориал
              </span>
              <span className="font-serif text-sm font-semibold leading-tight text-foreground sm:text-base lg:text-base xl:text-lg">
                Память героев
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-3 lg:flex xl:gap-4">
            {navItems
              .filter((item) => !item.hideOnDesktop)
              .map((item) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href) && item.href !== '/';

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'relative whitespace-nowrap text-xs font-medium transition-colors duration-300 hover:text-foreground lg:text-[13px] xl:text-sm',
                      isActive ? 'text-foreground' : 'text-foreground/60',
                    )}
                  >
                    <span className="relative inline-flex items-center">
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute -bottom-2 left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-primary via-accent to-glow shadow-glow"
                          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                        />
                      )}
                    </span>
                  </Link>
                );
              })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <ThemeToggle className="hidden lg:flex" />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 lg:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <AuthButton variant="ghost" size="sm" className="hidden lg:flex" />
            {hasRole && (
              <Button
                size="sm"
                variant="outline"
                className="hidden gap-1.5 border-primary/20 bg-primary/5 px-2 text-primary hover:bg-primary/10 lg:inline-flex xl:px-3"
                asChild
              >
                <Link href="/admin/moderation">
                  <Shield className="h-3.5 w-3.5" />
                  <span className="hidden 2xl:inline">Модерация</span>
                </Link>
              </Button>
            )}
            <Button
              size="sm"
              className="hidden gap-1.5 px-2 shadow-glow transition hover:-translate-y-0.5 lg:inline-flex xl:px-3"
              asChild
            >
              <Link href="/fallen/create">
                <Flame className="h-3.5 w-3.5" />
                <span className="hidden 2xl:inline">Добавить историю</span>
              </Link>
            </Button>
          </div>
        </div>

        <motion.span
          className="absolute inset-x-0 bottom-0 h-[1.5px] origin-left bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          style={{ scaleX: progressScale }}
        />
      </div>

      <motion.div
        id="mobile-menu"
        initial={false}
        animate={mobileMenuOpen ? 'open' : 'closed'}
        variants={{
          open: { height: 'auto', opacity: 1, overflow: 'visible', pointerEvents: 'auto' },
          closed: { height: 0, opacity: 0, overflow: 'hidden', pointerEvents: 'none' },
        }}
        transition={{ duration: 0.32, ease: [0.45, 0, 0.55, 1] }}
        className="lg:hidden"
      >
        <div className="space-y-3 border-b border-border/50 bg-background/90 px-4 py-4 backdrop-blur sm:px-6">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href) && item.href !== '/';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between rounded-lg border border-border/40 px-3.5 py-2.5 text-sm font-medium transition duration-300',
                  isActive
                    ? 'bg-surface/60 text-foreground shadow-soft'
                    : 'bg-background/60 text-foreground/70 hover:bg-surface/40 hover:text-foreground',
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{item.label}</span>
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  initial={false}
                  animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            );
          })}
          {hasRole && (
            <Link
              href="/admin/moderation"
              className={cn(
                'flex items-center justify-between rounded-lg border border-border/40 px-3.5 py-2.5 text-sm font-medium transition duration-300',
                pathname.startsWith('/admin/moderation')
                  ? 'bg-surface/60 text-foreground shadow-soft'
                  : 'bg-background/60 text-foreground/70 hover:bg-surface/40 hover:text-foreground',
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Модерация
              </span>
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-primary"
                initial={false}
                animate={{
                  scale: pathname.startsWith('/admin/moderation') ? 1 : 0,
                  opacity: pathname.startsWith('/admin/moderation') ? 1 : 0,
                }}
                transition={{ duration: 0.2 }}
              />
            </Link>
          )}
          <div className="flex items-center justify-between gap-2.5 pt-1">
            <ThemeToggle layout="label" className="flex-1" />
            <AuthButton variant="ghost" size="sm" className="flex-1" />
          </div>
          <Button
            className="w-full justify-between gap-2 bg-gradient-to-br from-ribbon-orange via-primary to-ribbon-black text-sm font-semibold shadow-glow transition"
            asChild
          >
            <Link href="/fallen/create" onClick={() => setMobileMenuOpen(false)}>
              <span>Зажечь свечу памяти</span>
              <Flame className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </motion.header>
  );
}
