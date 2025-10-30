'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoonStar, SunMedium } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './theme-provider';

type ThemeToggleProps = {
  className?: string;
  layout?: 'icon' | 'label';
};

export function ThemeToggle({ className, layout = 'icon' }: ThemeToggleProps) {
  const { mode, toggle } = useTheme();
  const isDay = mode === 'day';
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by not rendering icon until mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      aria-label={isDay ? 'Включить ночную тему' : 'Включить дневную тему'}
      className={cn(
        'group relative flex items-center gap-3 overflow-hidden rounded-full border border-border/60 bg-surface/80 px-4 py-2 text-sm font-medium text-foreground/90 shadow-soft backdrop-blur transition-all duration-300 hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        layout === 'icon' && 'h-11 w-11 justify-center rounded-full px-0 py-0',
        className,
      )}
      onClick={toggle}
    >
      <span className="absolute inset-0 -z-[1] bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {mounted ? (
        <AnimatePresence initial={false} mode="wait">
          {isDay ? (
            <motion.span
              key="sun"
              className="relative flex items-center gap-2"
              initial={{ opacity: 0, y: 8, rotate: -8 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -8, rotate: 8 }}
              transition={{ duration: 0.34, ease: [0.33, 1, 0.68, 1] }}
            >
              <SunMedium className="h-5 w-5 text-primary drop-shadow" />
              {layout === 'label' && <span>Дневной режим</span>}
            </motion.span>
          ) : (
            <motion.span
              key="moon"
              className="relative flex items-center gap-2"
              initial={{ opacity: 0, y: 8, rotate: 8 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -8, rotate: -8 }}
              transition={{ duration: 0.34, ease: [0.33, 1, 0.68, 1] }}
            >
              <MoonStar className="h-5 w-5 text-accent drop-shadow" />
              {layout === 'label' && <span>Ночной режим</span>}
            </motion.span>
          )}
        </AnimatePresence>
      ) : (
        // Placeholder during SSR to prevent hydration mismatch
        <span className="h-5 w-5" />
      )}

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(255,127,0,0.25), transparent 25%), radial-gradient(circle at 80% 30%, rgba(244,185,90,0.18), transparent 35%)',
        }}
      />
    </button>
  );
}
