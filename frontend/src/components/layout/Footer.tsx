'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame, Github, Instagram, MapPinned, Sparkles, Youtube } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

const navigation = {
  memorial: [
    { href: '/', label: 'Главная' },
    { href: '/fallen', label: 'Память героев' },
    { href: '/map', label: 'Карта памяти' },
    { href: '/chronicles', label: 'Хроника жизни' },
  ],
  info: [
    { href: '/about', label: 'О проекте' },
    { href: '/curators', label: 'Администрация' },
    // { href: '/press', label: 'Пресс-центр' },
    // { href: '/contact', label: 'Связаться с командой' },
  ],
  legal: [
    { href: '/privacy', label: 'Политика конфиденциальности' },
    { href: '/terms', label: 'Пользовательское соглашение' },
    { href: '/cookies', label: 'Файлы Cookies' },
  ],
};

const ticker = [
  { title: 'Экспедиция «Найти каждого»', location: 'Смоленская область', date: '14 мая' },
  { title: 'Цифровизация писем с фронта', location: 'Архив №274', date: '22 мая' },
  { title: 'Открытие мемориальной тропы', location: 'Брестская крепость', date: '1 июня' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden border-t border-border/50 bg-gradient-to-b from-background via-background-soft/80 to-background"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-60 mix-blend-soft-light">
          <div className="h-full w-full bg-[radial-gradient(circle_at_10%_10%,rgba(255,127,0,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(244,185,90,0.06),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(33,37,41,0.35),transparent_70%)]" />
        </div>
      </div>

      <div className="container relative z-10 py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr,1fr,1fr,1fr]">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-surface/60 px-4 py-2 text-xs uppercase tracking-[0.35em] text-foreground/70 shadow-soft backdrop-blur">
                <Sparkles className="h-4 w-4 text-primary" />
                Живой архив памяти
              </div>
              <h3 className="text-balance font-serif text-3xl font-semibold text-foreground md:text-4xl">
                Мы собираем и оживляем истории, чтобы имена героев звучали в каждом доме.
              </h3>
              {/* <p className="max-w-xl text-sm leading-relaxed text-foreground/70">
                Цифровой мемориал объединяет архивы, семейные хроники и интерактивную карту памяти. Вы можете
                зажечь свечу, поделиться историей семьи, услышать голоса фронтовиков или отправиться по маршруту их
                подвигов.
              </p> */}
            </motion.div>

            <motion.blockquote
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl border border-border/40 bg-surface/60 px-8 py-6 text-base text-foreground/80 shadow-soft"
            >
              <span className="absolute -top-16 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-primary/30 via-primary/5 to-transparent blur-3xl" />
              «У памяти нет паузы — она звучит, пока мы продолжаем рассказ».
            </motion.blockquote>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle layout="label" className="w-full max-w-xs" />
              <div className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-background/60 px-4 py-2 text-xs text-foreground/60">
                <MapPinned className="h-4 w-4 text-primary" />
                94 региона уже подключились к созданию цифровой карты памяти
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">Навигация</h4>
            <ul className="space-y-4 text-sm text-foreground/70">
              {navigation.memorial.map((item) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 transition-colors duration-300 hover:text-foreground"
                  >
                    <span className="h-[1.5px] w-6 origin-left scale-x-0 bg-primary/60 transition-transform duration-300 group-hover:scale-x-100" />
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">Проект</h4>
            <ul className="space-y-4 text-sm text-foreground/70">
              {navigation.info.map((item) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: 0.05, duration: 0.4, ease: 'easeOut' }}
                >
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 transition-colors duration-300 hover:text-foreground"
                  >
                    <span className="h-[1.5px] w-6 origin-left scale-x-0 bg-primary/60 transition-transform duration-300 group-hover:scale-x-100" />
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground/60">Право и данные</h4>
            <ul className="space-y-4 text-sm text-foreground/70">
              {navigation.legal.map((item) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
                >
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-2 transition-colors duration-300 hover:text-foreground"
                  >
                    <span className="h-[1.5px] w-6 origin-left scale-x-0 bg-primary/60 transition-transform duration-300 group-hover:scale-x-100" />
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>

            {/* <div className="space-y-3 pt-2">
              <span className="text-xs uppercase tracking-[0.3em] text-foreground/60">Мы рядом</span>
              <div className="flex flex-wrap gap-3 text-foreground/70">
                <a
                  href="https://github.com/yourusername/war_memory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-border/40 bg-background/60 transition duration-300 hover:border-primary/60 hover:text-foreground"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-border/40 bg-background/60 transition duration-300 hover:border-primary/60 hover:text-foreground"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-border/40 bg-background/60 transition duration-300 hover:border-primary/60 hover:text-foreground"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div> */}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 overflow-hidden rounded-3xl border border-border/40 bg-background/60 shadow-soft backdrop-blur"
        >
          <div className="flex flex-col gap-6 px-8 py-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <motion.span
                  animate={
                    prefersReducedMotion ? undefined : { scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }
                  }
                  transition={
                    prefersReducedMotion
                      ? undefined
                      : { duration: 3.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.2 }
                  }
                  className="absolute inset-0 rounded-full bg-glow/30 blur-2xl"
                />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/80 to-ribbon-black text-white shadow-glow">
                  <Flame className="h-5 w-5" />
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Лента памяти</p>
                <p className="text-xs text-foreground/60">
                  Присоединяйтесь к событиям мемориала и живым встречам очевидцев.
                </p>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-8 overflow-hidden">
              <motion.ul
                className="flex min-w-max items-center gap-8 text-sm text-foreground/70"
                animate={prefersReducedMotion ? undefined : { x: ['0%', '-50%'] }}
                transition={
                  prefersReducedMotion
                    ? undefined
                    : { repeat: Infinity, duration: 22, ease: 'linear', repeatDelay: 2 }
                }
              >
                {[...ticker, ...ticker].map((item, index) => (
                  <li key={`${item.title}-${index}`} className="flex items-center gap-3 whitespace-nowrap">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {item.date}
                    </span>
                    <span>{item.title}</span>
                    <span className="text-foreground/40">•</span>
                    <span className="text-xs text-foreground/50">{item.location}</span>
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>
        </motion.div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/40 pt-6 text-xs text-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} «Память героев». Все права защищены.</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Помним каждого. Передаем дальше.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
