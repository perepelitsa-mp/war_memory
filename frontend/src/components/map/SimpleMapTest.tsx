'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    ymaps: any
  }
}

export default function SimpleMapTest() {
  const mapRef = useRef<HTMLDivElement>(null)
  const isInitializedRef = useRef(false)
  const testCoords: [number, number] = [47.097, 37.543] // Мариуполь

  console.log('SimpleMapTest: Rendering with coords:', testCoords)

  const initMap = () => {
    if (!mapRef.current || !window.ymaps || isInitializedRef.current) return

    console.log('SimpleMapTest: Initializing map...')

    window.ymaps.ready(() => {
      if (isInitializedRef.current) return
      isInitializedRef.current = true

      console.log('SimpleMapTest: ymaps ready, creating map')

      // Создаем карту
      const map = new window.ymaps.Map(mapRef.current, {
        center: testCoords,
        zoom: 10,
        controls: ['zoomControl'],
      })

      console.log('SimpleMapTest: Map created, adding placemark')

      // Создаем маркер
      const placemark = new window.ymaps.Placemark(
        testCoords,
        {
          balloonContent: '<strong>Тестовый маркер в Мариуполе</strong>',
          hintContent: 'Тестовый маркер Мариуполь',
        },
        {
          preset: 'islands#orangeIcon',
        }
      )

      map.geoObjects.add(placemark)
      console.log('SimpleMapTest: Placemark added!')

      // Открываем balloon через секунду
      setTimeout(() => {
        placemark.balloon.open()
      }, 1000)
    })
  }

  return (
    <div className="space-y-4">
      <Script
        src="https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('SimpleMapTest: Yandex Maps script loaded')
          initMap()
        }}
      />

      <div className="rounded-lg border border-amber-200/50 bg-background/60 p-4">
        <h2 className="text-lg font-semibold">Простой тест Яндекс.Карт</h2>
        <p className="text-sm text-muted-foreground">
          Должен показать один оранжевый маркер в Мариуполе
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Координаты: {testCoords[0]}, {testCoords[1]}
        </p>
      </div>

      <div
        className="rounded-lg border border-amber-200/50 overflow-hidden"
        style={{ height: '500px' }}
      >
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="rounded-lg border border-amber-200/50 bg-background/60 p-4">
        <h3 className="font-semibold">Что должно быть видно:</h3>
        <ul className="mt-2 space-y-1 text-xs">
          <li>✓ Карта центрирована на Мариуполе (zoom 10)</li>
          <li>✓ Один оранжевый маркер в центре карты</li>
          <li>✓ При наведении показывается подсказка "Тестовый маркер Мариуполь"</li>
          <li>✓ При клике открывается balloon с текстом</li>
        </ul>
        <div className="mt-3 rounded bg-muted/50 p-2 text-xs">
          <strong>Консоль:</strong>
          <ul className="mt-1 space-y-0.5">
            <li>→ "SimpleMapTest: Yandex Maps script loaded"</li>
            <li>→ "SimpleMapTest: ymaps ready, creating map"</li>
            <li>→ "SimpleMapTest: Placemark added!"</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
