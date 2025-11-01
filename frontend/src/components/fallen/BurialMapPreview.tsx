'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { Loader2 } from 'lucide-react'

interface BurialMapPreviewProps {
  coordinates: { lat: number; lng: number }
  location: string
}

declare global {
  interface Window {
    ymaps: any
  }
}

export function BurialMapPreview({ coordinates, location }: BurialMapPreviewProps) {
  const [mapElement, setMapElement] = useState<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  // Инициализация карты
  useEffect(() => {
    if (!mapElement || !window.ymaps || !scriptLoaded || mapInstanceRef.current) {
      return
    }

    const initMap = () => {
      try {
        const map = new window.ymaps.Map(mapElement, {
          center: [coordinates.lat, coordinates.lng],
          zoom: 12,
          controls: ['zoomControl'],
        })

        // Добавляем маркер
        const placemark = new window.ymaps.Placemark(
          [coordinates.lat, coordinates.lng],
          {
            balloonContent: `<strong>${location}</strong>`,
            hintContent: location,
          },
          {
            preset: 'islands#redIcon',
          }
        )

        map.geoObjects.add(placemark)
        mapInstanceRef.current = map
        setMapReady(true)
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    window.ymaps.ready(initMap)

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy()
        } catch (error) {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null
      }
    }
  }, [mapElement, scriptLoaded, coordinates, location])

  return (
    <>
      <Script
        src="https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="relative h-[280px] w-full overflow-hidden rounded-lg border border-border bg-muted/30">
        {!mapReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/30">
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">Загрузка карты...</p>
            </div>
          </div>
        )}
        <div
          ref={setMapElement}
          className="h-full w-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Координаты под картой */}
      <div className="rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        Координаты: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
      </div>
    </>
  )
}
