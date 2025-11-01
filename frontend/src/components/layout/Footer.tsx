'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, MapPin, HeartHandshake, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

const navigation = {
  memorial: [
    { href: '/', label: 'Главная' },
    { href: '/fallen', label: 'Память героев' },
    { href: '/stats', label: 'Статистика' },
    { href: '/education', label: 'Образование' },
  ],
  info: [
    { href: '/about', label: 'О проекте' },
    { href: '/curators', label: 'Администрация' },
  ],
  legal: [
    { href: '/privacy', label: 'Конфиденциальность' },
    { href: '/consent', label: 'Согласие на обработку ПД' },
    { href: '/terms', label: 'Соглашение' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [heroesCount, setHeroesCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch heroes count from API
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setHeroesCount(data.heroesCount))
      .catch((error) => console.error('Failed to fetch stats:', error));
  }, []);

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-background to-background-soft/50">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,127,0,0.05),transparent_50%)]" />
      </div>

      <div className="container relative py-8 sm:py-10 md:py-12">
        {/* Main content */}
        <div className="grid gap-8 sm:gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:gap-12">
          {/* Left section - Brand */}
          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs uppercase tracking-wider text-primary">
                <Heart className="h-3 w-3 fill-current" />
                Книга Памяти
              </div>
              <h3 className="max-w-md text-lg font-semibold text-foreground sm:text-xl md:text-2xl">
                Сохраняем память о героях для будущих поколений
              </h3>
            </div>

            {/* Theme toggle - mobile */}
            <div className="md:hidden">
              <ThemeToggle layout="icon" />
            </div>

            {/* Stats badge */}
            <div className="inline-flex items-center gap-2 rounded-lg border border-border/40 bg-surface/40 px-3 py-2 text-xs text-muted-foreground sm:text-sm">
              <MapPin className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
              {heroesCount !== null ? (
                <>
                  <span className="hidden sm:inline">{heroesCount} {heroesCount === 1 ? 'герой' : heroesCount < 5 ? 'героя' : 'героев'} в базе памяти</span>
                  <span className="sm:hidden">{heroesCount} {heroesCount === 1 ? 'герой' : heroesCount < 5 ? 'героя' : 'героев'}</span>
                </>
              ) : (
                <span className="h-4 w-32 animate-pulse rounded bg-muted" />
              )}</div>
          </div>

          {/* Middle section - Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Навигация
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[...navigation.memorial, ...navigation.info].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-foreground/70 transition-colors hover:text-primary"
                  >
                    <span className="h-px w-4 bg-primary/40 transition-all group-hover:w-6" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right section - Legal & Theme */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Информация
            </h4>
            <ul className="space-y-2.5 text-sm">
              {navigation.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-foreground/70 transition-colors hover:text-primary"
                  >
                    <span className="h-px w-4 bg-primary/40 transition-all group-hover:w-6" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Theme toggle - desktop */}
            <div className="hidden pt-2 md:block">
              <ThemeToggle layout="icon" />
            </div>
          </div>
        </div>

        {/* Support CTA */}
        <div className="mt-8 sm:mt-10">
          <div className="rounded-xl border border-border/40 bg-background-soft/50 p-5 sm:p-6">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              {/* Text content */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-foreground/60" />
                  <h3 className="text-sm font-medium text-foreground/80 sm:text-base">
                    Поддержите автора
                  </h3>
                </div>
                <p className="max-w-2xl text-xs leading-relaxed text-foreground/60 sm:text-sm">
                  Проект создан одним человеком и развивается в свободное время. Ваша поддержка помогает автору продолжать работу над базой памяти.
                </p>
              </div>

              {/* CTA Button */}
              <div className="w-full sm:w-auto">
                <a
                  href="https://www.tinkoff.ru/rm/your-donation-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-primary/15 sm:w-auto sm:text-sm"
                >
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Поддержать
                  <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-0">
          <p>© {currentYear} Книга Памяти Кавалерово</p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <span className="hidden sm:inline">Помним каждого. Передаем дальше.</span>
            <span className="sm:hidden">Помним. Передаем дальше.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
