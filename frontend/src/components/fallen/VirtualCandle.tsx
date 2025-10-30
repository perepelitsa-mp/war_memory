'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface VirtualCandleProps {
  fallenId: string
  initialCount?: number
  initialLit?: boolean
  compact?: boolean
}

export function VirtualCandle({
  fallenId,
  initialCount = 0,
  initialLit = false,
  compact = false,
}: VirtualCandleProps) {
  const router = useRouter()
  const [count, setCount] = useState(initialCount)
  const [isLit, setIsLit] = useState(initialLit)
  const [isLoading, setIsLoading] = useState(false)
  const [showEffect, setShowEffect] = useState(false)

  useEffect(() => {
    // Загружаем актуальные данные при монтировании
    fetchCandleData()
  }, [fallenId])

  const fetchCandleData = async () => {
    try {
      const response = await fetch(`/api/fallen/${fallenId}/candles`)
      if (response.ok) {
        const data = await response.json()
        setCount(data.count)
        setIsLit(data.currentUserLit)
      }
    } catch (error) {
      console.error('Error fetching candle data:', error)
    }
  }

  const handleToggleCandle = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/fallen/${fallenId}/candles`, {
        method: 'POST',
      })

      if (response.status === 401) {
        // Пользователь не авторизован - редирект на авторизацию
        router.push('/auth/signin')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to toggle candle')
      }

      const data = await response.json()

      if (data.action === 'lit') {
        setIsLit(true)
        setCount((prev) => prev + 1)
        setShowEffect(true)
        setTimeout(() => setShowEffect(false), 1000)
      } else {
        setIsLit(false)
        setCount((prev) => Math.max(0, prev - 1))
      }

      // Обновляем страницу для синхронизации списка внизу
      router.refresh()
    } catch (error) {
      console.error('Error toggling candle:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (compact) {
    return (
      <motion.button
        onClick={handleToggleCandle}
        disabled={isLoading}
        className={cn(
          'group relative flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium shadow-lg transition-all',
          isLit
            ? 'bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white hover:from-amber-600 hover:to-orange-600'
            : 'bg-background/80 text-foreground/70 backdrop-blur-sm hover:bg-background hover:text-foreground'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Flame
          className={cn(
            'h-4 w-4 transition-all',
            isLit ? 'animate-pulse text-yellow-200' : 'text-foreground/50'
          )}
        />
        <span>{count}</span>
      </motion.button>
    )
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleToggleCandle}
        disabled={isLoading}
        className={cn(
          'group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 shadow-xl backdrop-blur-md transition-all',
          isLit
            ? 'border-amber-500/50 bg-gradient-to-b from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30'
            : 'border-border/40 bg-background/80 hover:border-border/60 hover:bg-background/90'
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Анимированное пламя */}
        <div className="relative">
          <AnimatePresence>
            {isLit ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="relative"
              >
                {/* Свечение */}
                <motion.div
                  className="absolute inset-0 -m-4 rounded-full bg-amber-400/20 blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                {/* Пламя */}
                <motion.div
                  animate={{
                    y: [-2, -4, -2],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Flame className="h-8 w-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Flame className="h-8 w-8 text-foreground/30" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Счётчик */}
        <div className="flex flex-col items-center">
          <motion.span
            key={count}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
              'text-2xl font-bold tabular-nums',
              isLit ? 'text-amber-500' : 'text-foreground'
            )}
          >
            {count}
          </motion.span>
          <span className="text-xs text-foreground/60">
            {count === 1 ? 'свеча' : count < 5 ? 'свечи' : 'свечей'}
          </span>
        </div>

        {/* Подсказка */}
        <span className="text-xs font-medium text-foreground/70">
          {isLit ? 'Погасить' : 'Зажечь свечу'}
        </span>
      </motion.button>

      {/* Эффект при зажигании */}
      <AnimatePresence>
        {showEffect && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: 0,
                  scale: 1.5,
                  x: Math.cos((i * Math.PI * 2) / 6) * 40,
                  y: Math.sin((i * Math.PI * 2) / 6) * 40,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <Heart className="h-4 w-4 fill-amber-400 text-amber-400" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
