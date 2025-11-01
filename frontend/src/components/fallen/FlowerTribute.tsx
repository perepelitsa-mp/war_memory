'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { Flower2, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthModal } from '@/contexts/AuthModalContext'

interface FlowerTributeProps {
  fallenId: string
  totalFlowers: number
  compact?: boolean
}

const FLOWER_TYPES = [
  { value: 'roses', label: 'Розы', emoji: '🌹', color: 'text-rose-600' },
  { value: 'carnations', label: 'Гвоздики', emoji: '💐', color: 'text-red-600' },
  { value: 'lilies', label: 'Лилии', emoji: '🌸', color: 'text-pink-400' },
  { value: 'chrysanthemums', label: 'Хризантемы', emoji: '🌼', color: 'text-amber-400' },
  { value: 'tulips', label: 'Тюльпаны', emoji: '🌷', color: 'text-pink-500' },
  { value: 'mixed', label: 'Смешанный букет', emoji: '💐', color: 'text-purple-500' },
]

const FLOWER_COLORS = [
  { value: 'red', label: 'Красные', bg: 'bg-red-500' },
  { value: 'white', label: 'Белые', bg: 'bg-gray-100 border border-gray-300' },
  { value: 'pink', label: 'Розовые', bg: 'bg-pink-400' },
  { value: 'yellow', label: 'Жёлтые', bg: 'bg-yellow-400' },
  { value: 'purple', label: 'Фиолетовые', bg: 'bg-purple-500' },
  { value: 'mixed', label: 'Разноцветные', bg: 'bg-gradient-to-r from-red-500 via-pink-500 to-purple-500' },
]

const FLOWER_COUNTS = [2, 4, 6, 8, 10, 12, 14, 20, 26]

export function FlowerTribute({ fallenId, totalFlowers, compact = false }: FlowerTributeProps) {
  const router = useRouter()
  const { openAuthModal } = useAuthModal()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)

  const [flowerType, setFlowerType] = useState('roses')
  const [flowerColor, setFlowerColor] = useState('red')
  const [flowerCount, setFlowerCount] = useState(1)
  const [message, setMessage] = useState('')

  const handleLayFlowers = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/fallen/${fallenId}/flowers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flower_type: flowerType,
          flower_color: flowerColor,
          flower_count: flowerCount,
          message,
        }),
      })

      if (response.status === 401) {
        openAuthModal()
        return
      }

      if (response.status === 409) {
        const data = await response.json()
        alert(data.error || 'Вы уже возлагали цветы этому герою')
        setLoading(false)
        setIsOpen(false)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to lay flowers')
      }

      // Показываем анимацию
      setShowAnimation(true)
      setTimeout(() => {
        setShowAnimation(false)
        setIsOpen(false)
        setMessage('')
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error('Error laying flowers:', error)
      alert('Не удалось возложить цветы')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setIsOpen(false)
    }
  }

  const selectedFlower = FLOWER_TYPES.find((f) => f.value === flowerType)

  return (
    <>
      {/* Кнопка возложения цветов */}
      <Button
        variant="outline"
        size={compact ? 'sm' : 'default'}
        onClick={() => setIsOpen(true)}
        className="w-full gap-2 border-amber-500/20 bg-background/60 hover:bg-amber-500/10"
      >
        <Flower2 className="h-4 w-4 text-amber-500" />
        {!compact && <span className="text-sm font-medium">Возложить цветы</span>}
        {totalFlowers > 0 && (
          <span className={`rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-500 ${compact ? '' : 'ml-1'}`}>
            {totalFlowers}
          </span>
        )}
      </Button>

      {/* Диалог выбора цветов */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flower2 className="h-5 w-5 text-amber-500" />
              Возложить цветы памяти
            </DialogTitle>
            <DialogDescription>
              Выразите память и скорбь, возложив виртуальные цветы
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Тип цветов */}
            <div className="space-y-2">
              <Label>Тип цветов</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FLOWER_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFlowerType(type.value)}
                    className={`flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all ${
                      flowerType === type.value
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-border hover:border-amber-500/50'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{type.emoji}</span>
                    <span className="text-[10px] font-medium sm:text-xs">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Цвет */}
            <div className="space-y-2">
              <Label>Цвет букета</Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {FLOWER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setFlowerColor(color.value)}
                    className={`flex items-center gap-1.5 rounded-lg border-2 px-2 py-1 text-sm transition-all sm:gap-2 sm:px-3 sm:py-1.5 ${
                      flowerColor === color.value
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-border hover:border-amber-500/50'
                    }`}
                  >
                    <div className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${color.bg}`} />
                    <span className="text-[10px] sm:text-xs">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Количество */}
            <div className="space-y-2">
              <Label>Количество цветов</Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {FLOWER_COUNTS.map((count) => (
                  <button
                    key={count}
                    onClick={() => setFlowerCount(count)}
                    className={`rounded-lg border-2 px-2.5 py-1 text-xs font-medium transition-all sm:px-3 sm:py-1.5 sm:text-sm ${
                      flowerCount === count
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                        : 'border-border hover:border-amber-500/50'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Сообщение */}
            <div className="space-y-2">
              <Label htmlFor="message">Сообщение (опционально)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Напишите несколько слов памяти..."
                rows={3}
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">{message.length}/500</p>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Отмена
            </Button>
            <Button
              onClick={handleLayFlowers}
              disabled={loading}
              className="w-full gap-2 bg-amber-600 hover:bg-amber-700 sm:w-auto"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Возложить {flowerCount} {selectedFlower?.emoji}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Анимация возложения */}
      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -50 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="text-6xl">{selectedFlower?.emoji}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
