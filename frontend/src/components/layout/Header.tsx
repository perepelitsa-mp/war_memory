'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Flame, Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/theme-toggle';

const navItems = [
  { href: '/', label: 'Главная' },
  { href: '/about', label: 'О мемориале' },
  { href: '/map', label: 'Карта памяти' },
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

  return (
    <motion.header
      className="sticky top-0 z-50 w-full backdrop-blur-xl"
      style={{
        boxShadow: useTransform(shadowOpacity, (value) => `0 16px 40px rgba(10, 12, 15, ${value})`),
      }}
    >
      <div className="relative border-b border-border/60 bg-background/70">
        <div className="container flex h-20 items-center justify-between gap-6">
          <Link href="/" className="relative flex items-center gap-3">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ribbon-orange via-primary/90 to-ribbon-black shadow-soft">
              <Flame className="h-6 w-6 text-white drop-shadow-md" />
              <span className="absolute -inset-[2px] rounded-[14px] border border-white/10" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm uppercase tracking-[0.4em] text-primary/90">
                Цифровой мемориал
              </span>
              <span className="font-serif text-xl font-semibold leading-tight text-foreground">
                Память героев
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
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
                    'relative text-sm font-medium transition-colors duration-300 hover:text-foreground',
                    isActive ? 'text-foreground' : 'text-foreground/60',
                  )}
                >
                  <span className="relative inline-flex items-center">
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute -bottom-2 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary via-accent to-glow shadow-glow"
                        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                      />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden md:flex" />
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="hidden md:flex" asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button
              size="sm"
              className="hidden shadow-glow transition hover:-translate-y-0.5 md:inline-flex"
              asChild
            >
              <Link href="/fallen/new">Добавить историю</Link>
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
          open: { height: 'auto', opacity: 1 },
          closed: { height: 0, opacity: 0 },
        }}
        transition={{ duration: 0.32, ease: [0.45, 0, 0.55, 1] }}
        className="md:hidden"
      >
        <div className="space-y-4 border-b border-border/50 bg-background/90 px-6 py-5 backdrop-blur">
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
                  'flex items-center justify-between rounded-xl border border-border/40 px-4 py-3 text-base font-medium transition duration-300',
                  isActive
                    ? 'bg-surface/60 text-foreground shadow-soft'
                    : 'bg-background/60 text-foreground/70 hover:bg-surface/40 hover:text-foreground',
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{item.label}</span>
                <motion.span
                  className="h-2 w-2 rounded-full bg-primary"
                  initial={false}
                  animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Link>
            );
          })}
          <div className="flex items-center justify-between gap-3">
            <ThemeToggle layout="label" className="flex-1" />
            <Button variant="ghost" size="sm" className="flex-1" asChild>
              <Link href="/login">Войти</Link>
            </Button>
          </div>
          <Button
            size="lg"
            className="w-full justify-between gap-2 bg-gradient-to-br from-ribbon-orange via-primary to-ribbon-black text-base font-semibold tracking-wide shadow-glow transition"
            asChild
          >
            <Link href="/fallen/new">
              <span>Зажечь свечу памяти</span>
              <Flame className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </motion.header>
  );
}
