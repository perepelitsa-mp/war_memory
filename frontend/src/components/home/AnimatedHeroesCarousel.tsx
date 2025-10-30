'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FallenCard } from '@/components/fallen/FallenCard'
import { Fallen } from '@/types'

interface AnimatedHeroesCarouselProps {
  heroes: Fallen[]
  maxVisible?: number
  rotationInterval?: number
}

export function AnimatedHeroesCarousel({
  heroes,
  maxVisible = 4,
  rotationInterval = 3000, // 3 seconds - continuous rotation
}: AnimatedHeroesCarouselProps) {
  const [visibleIndices, setVisibleIndices] = useState<number[]>([])
  const [isMobile, setIsMobile] = useState(false)

  // Current position to replace (rotates 0 → 1 → 2 → 3 → 0...)
  const currentPositionRef = useRef(0)

  // Адаптивное количество карточек
  const adaptiveMaxVisible = isMobile ? 2 : maxVisible

  // Определение мобильного устройства
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Generate initial random indices
  const getRandomIndices = useCallback(() => {
    if (heroes.length === 0) return []

    const count = Math.min(adaptiveMaxVisible, heroes.length)
    const indices = new Set<number>()

    while (indices.size < count) {
      indices.add(Math.floor(Math.random() * heroes.length))
    }

    return Array.from(indices)
  }, [heroes.length, adaptiveMaxVisible])

  // Initialize component
  useEffect(() => {
    const initialIndices = getRandomIndices()
    setVisibleIndices(initialIndices)
    currentPositionRef.current = 0
  }, [getRandomIndices])

  // Rotate cards sequentially: position 0 → 1 → 2 → 3 → 0...
  useEffect(() => {
    if (heroes.length <= adaptiveMaxVisible) return

    const interval = setInterval(() => {
      // Get and update position OUTSIDE of setState to avoid Strict Mode issues
      const replaceIndex = currentPositionRef.current
      currentPositionRef.current = (currentPositionRef.current + 1) % adaptiveMaxVisible

      setVisibleIndices((current) => {
        // Replace card at this position
        const newIndices = [...current]

        // Find a new hero index that's not currently visible
        let newCardIndex: number
        let attempts = 0
        do {
          newCardIndex = Math.floor(Math.random() * heroes.length)
          attempts++
        } while (newIndices.includes(newCardIndex) && attempts < 50)

        newIndices[replaceIndex] = newCardIndex
        return newIndices
      })
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [heroes.length, adaptiveMaxVisible, rotationInterval])

  if (heroes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-lg text-muted-foreground">
          Здесь пока нет опубликованных историй.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Поделитесь историей своей семьи, и она станет частью живого мемориала.
        </p>
      </div>
    )
  }

  const visibleHeroes = visibleIndices.map((index) => ({
    hero: heroes[index],
    key: `${heroes[index].id}-${index}`,
  }))

  return (
    <div className="relative">
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {visibleHeroes.map(({ hero, key }) => (
            <motion.div
              key={key}
              layout
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: -20 }}
              transition={{
                duration: isMobile ? 1.8 : 2.5,
                ease: [0.25, 0.1, 0.25, 1.0], // Smooth ease-in-out
              }}
            >
              <FallenCard fallen={hero} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Subtle indicator that cards are rotating */}
      <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:mt-6 sm:flex-row sm:gap-2">
        <div className="flex gap-2">
          {Array.from({ length: Math.min(adaptiveMaxVisible, heroes.length) }).map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-primary/40 transition-all sm:h-1.5 sm:w-1.5"
              style={{
                animation: `pulse 2s ease-in-out infinite ${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground sm:ml-2">
          Показано {visibleIndices.length} из {heroes.length} {heroes.length === 1 ? 'героя' : heroes.length < 5 ? 'героев' : 'героев'}
        </p>
      </div>
    </div>
  )
}
