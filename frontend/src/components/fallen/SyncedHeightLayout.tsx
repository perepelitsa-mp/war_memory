'use client'

import { useLayoutEffect, useRef, useState } from 'react'

interface SyncedHeightLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
}

export function SyncedHeightLayout({ left, right }: SyncedHeightLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const [measurements, setMeasurements] = useState<{
    leftHeight: number
    rightHeight: number
  } | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      if (!leftRef.current || !rightRef.current) return

      // Сбрасываем все стили для измерения натуральной высоты
      leftRef.current.style.maxHeight = ''
      rightRef.current.style.maxHeight = ''
      leftRef.current.style.overflow = ''
      rightRef.current.style.overflow = ''

      // Получаем натуральные высоты контента
      const leftHeight = leftRef.current.scrollHeight
      const rightHeight = rightRef.current.scrollHeight

      setMeasurements({ leftHeight, rightHeight })
    }

    // Измеряем сразу
    measure()

    // И при изменении размера окна
    window.addEventListener('resize', measure)

    // ResizeObserver для отслеживания изменений контента
    const observer = new ResizeObserver(measure)
    if (leftRef.current) observer.observe(leftRef.current)
    if (rightRef.current) observer.observe(rightRef.current)

    return () => {
      window.removeEventListener('resize', measure)
      observer.disconnect()
    }
  }, [left, right])

  const minHeight = measurements
    ? Math.min(measurements.leftHeight, measurements.rightHeight)
    : undefined

  const leftIsTaller = measurements && measurements.leftHeight > measurements.rightHeight
  const rightIsTaller = measurements && measurements.rightHeight > measurements.leftHeight

  return (
    <div ref={containerRef} className="grid gap-6 items-start lg:grid-cols-2">
      <div
        ref={leftRef}
        style={{
          maxHeight: leftIsTaller && minHeight ? `${minHeight}px` : undefined,
          overflow: leftIsTaller ? 'auto' : undefined,
        }}
        className={leftIsTaller ? 'scrollbar-hide' : ''}
      >
        {left}
      </div>
      <div
        ref={rightRef}
        style={{
          maxHeight: rightIsTaller && minHeight ? `${minHeight}px` : undefined,
          overflow: rightIsTaller ? 'auto' : undefined,
        }}
        className={rightIsTaller ? 'scrollbar-hide' : ''}
      >
        {right}
      </div>
    </div>
  )
}
