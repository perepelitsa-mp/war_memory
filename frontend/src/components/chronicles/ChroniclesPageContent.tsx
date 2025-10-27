'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Globe2,
  Landmark,
  LineChart,
  Shield,
  type LucideIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, cn } from '@/lib/utils';
import type {
  ChronicleCategory,
  ChronicleEvent,
} from './types';

type CategoryFilter = ChronicleCategory | 'all';

const categoryConfig: Record<
  ChronicleCategory,
  {
    label: string;
    icon: LucideIcon;
    accent: string;
    dot: string;
  }
> = {
  frontline: {
    label: 'Боевые действия',
    icon: Shield,
    accent: 'text-primary',
    dot: 'bg-primary shadow-glow',
  },
  politics: {
    label: 'Политика и власть',
    icon: Landmark,
    accent: 'text-secondary',
    dot: 'bg-secondary text-secondary-foreground shadow-soft',
  },
  diplomacy: {
    label: 'Дипломатия',
    icon: Globe2,
    accent: 'text-accent',
    dot: 'bg-accent text-accent-foreground shadow-soft',
  },
  economy: {
    label: 'Экономика и санкции',
    icon: LineChart,
    accent: 'text-foreground',
    dot: 'bg-foreground text-background shadow-soft',
  },
  humanitarian: {
    label: 'Гуманитарная повестка',
    icon: Activity,
    accent: 'text-rose-400 dark:text-rose-300',
    dot: 'bg-rose-400 shadow-soft',
  },
};

const categoryFilters: {
  value: CategoryFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Все события' },
  { value: 'frontline', label: categoryConfig.frontline.label },
  { value: 'politics', label: categoryConfig.politics.label },
  { value: 'diplomacy', label: categoryConfig.diplomacy.label },
  { value: 'economy', label: categoryConfig.economy.label },
  { value: 'humanitarian', label: categoryConfig.humanitarian.label },
];

const cardTransition = {
  duration: 0.6,
  ease: [0.25, 0.1, 0.25, 1],
};

type ChroniclesPageContentProps = {
  events: ChronicleEvent[];
};

export function ChroniclesPageContent({ events }: ChroniclesPageContentProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (filter === 'all') {
      return sortedEvents;
    }
    return sortedEvents.filter((event) => event.category === filter);
  }, [sortedEvents, filter]);

  const groups = useMemo(() => {
    return filteredEvents.reduce<Record<string, ChronicleEvent[]>>((acc, event) => {
      const year = new Date(event.date).getFullYear().toString();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);

  const groupedEvents = useMemo(() => {
    return Object.entries(groups)
      .map(([year, items]) => ({
        year,
        items,
      }))
      .sort((a, b) => Number(a.year) - Number(b.year));
  }, [groups]);

  const confirmedEvents = useMemo(
    () => sortedEvents.filter((event) => event.status !== 'future'),
    [sortedEvents],
  );

  const timelineStart = confirmedEvents[0]?.date ?? events[0]?.date;
  const timelineEnd =
    confirmedEvents[confirmedEvents.length - 1]?.date ?? events[events.length - 1]?.date;

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(events.map((event) => event.category))).length;
  }, [events]);

  return (
    <div className="relative overflow-hidden pb-24">
      <BackgroundOrbits />

      <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-20 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={cardTransition}
          className="mx-auto max-w-3xl space-y-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground shadow-soft backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary shadow-glow" />
            Хроника СВО с 2022 года
          </span>
          <h1 className="font-serif text-4xl leading-tight text-foreground sm:text-5xl">
            Лента ключевых событий войны и мировой реакции
          </h1>
          <p className="text-balance text-base leading-relaxed text-foreground/80 sm:text-lg">
            От первых часов вторжения до дипломатических переговоров и санкций — собранная линия
            времени помогает увидеть, как менялась война, международная политика и гуманитарная
            ситуация. Мы фиксируем подтверждённые факты и обновляем данные по мере появления
            проверенной информации.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            label="Период наблюдения"
            value={
              timelineStart && timelineEnd
                ? `${formatDate(timelineStart, 'LLLL yyyy')} — ${formatDate(timelineEnd, 'LLLL yyyy')}`
                : '2022 — наст. время'
            }
          />
          <StatCard
            label="Зафиксированных событий"
            value={confirmedEvents.length.toString()}
            description={filter === 'all' ? undefined : 'после применения фильтра'}
          />
          <StatCard
            label="Направления анализа"
            value={`${uniqueCategories} направления`}
          />
          <StatCard
            label="Обновление"
            value={
              confirmedEvents.length
                ? formatDate(confirmedEvents[confirmedEvents.length - 1].date, 'MMMM yyyy')
                : 'В процессе'
            }
          />
        </motion.div>
      </section>

      <section className="relative mx-auto mt-16 flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col items-start gap-3 rounded-3xl border border-border/60 bg-card/70 p-6 shadow-soft backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="space-y-2">
            <h2 className="font-serif text-2xl">Фильтр направлений</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Отобразите только интересующие блоки: боевые действия, политические решения,
              дипломатические инициативы, санкционные пакеты или гуманитарные кризисы.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'default' : 'outline'}
                className={cn(
                  'rounded-full border border-border/60 px-4 py-2 text-xs uppercase tracking-wide transition hover:-translate-y-0.5 hover:shadow-glow',
                  filter === option.value && 'shadow-glow',
                )}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[calc(1rem+1px)] top-0 bottom-0 w-[2px] rounded-full bg-gradient-to-b from-primary/50 via-primary/30 to-transparent sm:left-[calc(1.25rem+1px)]" />

          <div className="flex flex-col gap-16">
            {groupedEvents.map(({ year, items }) => (
              <YearGroup key={year} year={year} events={items} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  description?: string;
};

function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 text-left shadow-soft backdrop-blur">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex flex-col gap-2">
        <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</span>
        <span className="font-serif text-2xl text-foreground">{value}</span>
        {description ? <span className="text-xs text-muted-foreground">{description}</span> : null}
      </div>
    </div>
  );
}

type YearGroupProps = {
  year: string;
  events: ChronicleEvent[];
};

function YearGroup({ year, events }: YearGroupProps) {
  return (
    <section className="relative pl-10 sm:pl-14">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={cardTransition}
        className="absolute -left-2 top-0 flex h-12 w-12 items-center justify-center rounded-full border border-border/50 bg-background/90 font-serif text-lg shadow-soft backdrop-blur"
      >
        {year}
      </motion.div>

      <div className="flex flex-col gap-8">
        {events.map((event, index) => (
          <TimelineCard key={event.id} event={event} index={index} />
        ))}
      </div>
    </section>
  );
}

type TimelineCardProps = {
  event: ChronicleEvent;
  index: number;
};

function TimelineCard({ event, index }: TimelineCardProps) {
  const config = categoryConfig[event.category];
  const CategoryIcon = config.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ ...cardTransition, delay: index * 0.05 }}
      className="relative ml-4 flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/90 p-6 shadow-soft backdrop-blur"
    >
      <span
        className={cn(
          'absolute -left-[1.55rem] top-8 flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-xs text-background',
          config.dot,
        )}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={cn(
                'flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] uppercase tracking-widest shadow-soft',
              )}
              variant="outline"
            >
              <CategoryIcon className={cn('h-3.5 w-3.5', config.accent)} />
              {config.label}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">
              {formatDate(event.date, 'd MMMM yyyy')}
            </span>
            {event.location ? (
              <span className="inline-flex items-center rounded-full bg-muted/20 px-3 py-1 text-xs text-muted-foreground">
                {event.location}
              </span>
            ) : null}
            {event.status === 'ongoing' && (
              <span className="inline-flex animate-pulse items-center rounded-full bg-warning/20 px-3 py-1 text-xs uppercase tracking-wide text-warning">
                продолжается
              </span>
            )}
            {event.status === 'future' && (
              <span className="inline-flex items-center rounded-full border border-dashed border-muted px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                подготовка
              </span>
            )}
          </div>
          <h3 className="font-serif text-2xl leading-tight text-foreground">{event.title}</h3>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-foreground/85 sm:text-base">{event.summary}</p>

      {event.impact ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground/85 shadow-soft">
          <p className="font-medium uppercase tracking-[0.2em] text-primary/80">Почему важно</p>
          <p className="mt-2 leading-relaxed text-foreground/85">{event.impact}</p>
        </div>
      ) : null}

      {event.tags && event.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {event.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted/20 px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {event.sources && event.sources.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="uppercase tracking-[0.3em] text-muted-foreground/80">Источники</span>
          {event.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-1 rounded-full border border-transparent bg-foreground/5 px-3 py-1 transition hover:border-foreground/20 hover:bg-foreground/10"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
              {source.label}
            </a>
          ))}
        </div>
      ) : null}
    </motion.article>
  );
}

function BackgroundOrbits() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex max-w-5xl justify-center opacity-80">
      <motion.div
        className="relative mt-[-160px] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent blur-[120px]"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 48, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-gradient-to-br from-secondary/20 via-transparent to-transparent blur-3xl"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 64, ease: 'linear' }}
      />
    </div>
  );
}
