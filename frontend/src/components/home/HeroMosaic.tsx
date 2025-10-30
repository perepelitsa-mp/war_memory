'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Flame } from 'lucide-react'

interface Hero {
  id: string
  first_name: string
  last_name: string
  middle_name: string | null
  hero_photo_url: string | null
  birth_date: string | null
  death_date: string | null
}

interface HeroMosaicProps {
  heroes: Hero[]
  gridSize?: number // Количество отображаемых фото
  rotationInterval?: number // Интервал смены (мс)
}

export function HeroMosaic({
  heroes,
  gridSize = 24,
  rotationInterval = 3000
}: HeroMosaicProps) {
  const [visibleHeroes, setVisibleHeroes] = useState<Hero[]>([])
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const rotationIndexRef = useRef(0)

  // Фильтруем героев с фото
  const heroesWithPhotos = heroes.filter(h => h.hero_photo_url)

  // Адаптивный размер сетки
  const adaptiveGridSize = isMobile ? 12 : gridSize

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Инициализация на клиенте (только один раз)
  useEffect(() => {
    setIsClient(true)
    if (heroesWithPhotos.length > 0) {
      // Перемешиваем массив и берём первые gridSize
      const shuffled = [...heroesWithPhotos].sort(() => Math.random() - 0.5)
      setVisibleHeroes(shuffled.slice(0, Math.min(adaptiveGridSize, shuffled.length)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Обновление количества карточек при изменении размера экрана
  useEffect(() => {
    if (!isClient || visibleHeroes.length === 0) return

    const currentLength = visibleHeroes.length
    const targetLength = Math.min(adaptiveGridSize, heroesWithPhotos.length)

    if (currentLength < targetLength) {
      // Добавляем больше карточек
      const shuffled = [...heroesWithPhotos].sort(() => Math.random() - 0.5)
      const additionalNeeded = targetLength - currentLength
      const currentIds = new Set(visibleHeroes.map(h => h.id))
      const newHeroes = shuffled
        .filter(h => !currentIds.has(h.id))
        .slice(0, additionalNeeded)
      setVisibleHeroes(prev => [...prev, ...newHeroes])
    } else if (currentLength > targetLength) {
      // Уменьшаем количество карточек
      setVisibleHeroes(prev => prev.slice(0, targetLength))
    }
  }, [adaptiveGridSize, isClient])

  // Ротация фотографий
  useEffect(() => {
    if (!isClient || heroesWithPhotos.length <= adaptiveGridSize) return

    const interval = setInterval(() => {
      setVisibleHeroes(current => {
        // Выбираем случайную позицию для замены
        const positionToReplace = Math.floor(Math.random() * current.length)

        // Выбираем нового героя, которого ещё нет на экране
        let newHero: Hero | undefined
        let attempts = 0
        do {
          const randomIndex = Math.floor(Math.random() * heroesWithPhotos.length)
          newHero = heroesWithPhotos[randomIndex]
          attempts++
        } while (
          current.some(h => h.id === newHero?.id) &&
          attempts < 50
        )

        if (!newHero) return current

        // Заменяем
        const updated = [...current]
        updated[positionToReplace] = newHero
        return updated
      })
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [isClient, heroesWithPhotos.length, gridSize, rotationInterval])

  if (!isClient || heroesWithPhotos.length === 0) {
    return (
      <div className="rounded-3xl border border-border/40 bg-gradient-to-br from-background via-background-soft/50 to-background p-8 text-center">
        <Flame className="mx-auto h-12 w-12 text-primary/40" />
        <p className="mt-4 text-sm text-foreground/60">
          Фотографии героев появятся здесь
        </p>
      </div>
    )
  }

  const fullName = (hero: Hero) => {
    const parts = [hero.last_name, hero.first_name, hero.middle_name]
    return parts.filter(Boolean).join(' ')
  }

  const yearRange = (hero: Hero) => {
    const birth = hero.birth_date ? new Date(hero.birth_date).getFullYear() : '?'
    const death = hero.death_date ? new Date(hero.death_date).getFullYear() : '?'
    return `${birth} — ${death}`
  }

  return (
    <div className="grid gap-2 sm:gap-3 md:gap-4"
         style={{
           gridTemplateColumns: isMobile
             ? 'repeat(auto-fill, minmax(100px, 1fr))'
             : 'repeat(auto-fill, minmax(120px, 1fr))',
         }}>
      {visibleHeroes.map((hero, index) => (
        <motion.div
          key={`${hero.id}-${index}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.6 }}
          className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-background-soft shadow-md"
        >
          <Link href={`/fallen/${hero.id}`} className="block h-full w-full">
            {hero.hero_photo_url ? (
              <img
                src={hero.hero_photo_url}
                alt={fullName(hero)}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-2xl font-bold text-foreground/20">
                  {hero.first_name?.[0]}{hero.last_name?.[0]}
                </span>
              </div>
            )}

            {/* Overlay с информацией при hover/touch */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:p-3">
              <p className="text-[10px] font-semibold leading-tight text-white sm:text-xs">
                {fullName(hero)}
              </p>
              <p className="text-[8px] text-white/70 sm:text-[10px]">
                {yearRange(hero)}
              </p>
            </div>

            {/* Тонкая рамка при hover */}
            <div className="absolute inset-0 rounded-xl border-2 border-primary/0 transition-colors duration-300 group-hover:border-primary/60" />
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
