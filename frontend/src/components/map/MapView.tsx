'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

interface Marker {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  burialLocation: string
  hometown?: string
  rank?: string
  photoUrl?: string
}

interface MapViewProps {
  markers: Marker[]
  selectedMarker: Marker | null
  onMarkerClick: (marker: Marker) => void
}

declare global {
  interface Window {
    ymaps: any
  }
}

export default function MapView({ markers, selectedMarker, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const placemarkRefs = useRef<any[]>([])
  const isInitializedRef = useRef(false)

  console.log('MapView: Rendering with', markers.length, 'markers')

  // Инициализация карты
  const initMap = () => {
    if (!mapRef.current || !window.ymaps || isInitializedRef.current) return

    console.log('MapView: Initializing map...')

    window.ymaps.ready(() => {
      if (isInitializedRef.current) return
      isInitializedRef.current = true

      console.log('MapView: ymaps ready, creating map')

      // Создаем карту с дефолтным центром (обновится когда маркеры загрузятся)
      const map = new window.ymaps.Map(mapRef.current, {
        center: [55.7558, 37.6173], // Центр России
        zoom: 4,
        controls: ['zoomControl', 'geolocationControl', 'routeButtonControl'],
      })

      mapInstanceRef.current = map

      console.log('MapView: Map initialization complete!')

      // Если маркеры уже загружены, добавляем их сразу
      if (markers.length > 0) {
        console.log('MapView: Markers already loaded, adding them now')
        addMarkersToMap()
      }
    })
  }

  // Функция для добавления маркеров на карту
  const addMarkersToMap = () => {
    if (!mapInstanceRef.current || !window.ymaps || markers.length === 0) {
      console.log('MapView: Cannot add markers - map:', !!mapInstanceRef.current, 'ymaps:', !!window.ymaps, 'markers:', markers.length)
      return
    }

    console.log('MapView: Adding markers to map, count:', markers.length)

    // Очищаем старые маркеры
    placemarkRefs.current.forEach((placemark) => {
      mapInstanceRef.current.geoObjects.remove(placemark)
    })
    placemarkRefs.current = []

    // Создаем новые маркеры
    markers.forEach((marker, index) => {
      console.log(`Adding placemark ${index}:`, marker.name)

      const placemark = new window.ymaps.Placemark(
        [marker.coordinates.lat, marker.coordinates.lng],
        {
          balloonContentHeader: `<strong>${marker.name}</strong>`,
          balloonContentBody: `
            ${marker.rank ? `<p style="margin: 4px 0; color: #666;">${marker.rank}</p>` : ''}
            <p style="margin: 4px 0;">${marker.burialLocation}</p>
            ${marker.hometown ? `<p style="margin: 4px 0; font-size: 12px; color: #666;">Родной город: ${marker.hometown}</p>` : ''}
          `,
          balloonContentFooter: `
            <div style="margin-top: 8px;">
              <a
                href="/fallen/${marker.id}"
                style="
                  display: inline-block;
                  padding: 6px 12px;
                  background: #f59e0b;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
                  font-size: 12px;
                  font-weight: 500;
                "
              >
                Открыть карточку
              </a>
            </div>
          `,
          hintContent: marker.name,
        },
        {
          preset: 'islands#orangeIcon',
        }
      )

      placemark.events.add('click', () => {
        console.log('Marker clicked:', marker.name)
        onMarkerClick(marker)
      })

      mapInstanceRef.current.geoObjects.add(placemark)
      placemarkRefs.current.push(placemark)
    })

    // Устанавливаем bounds
    if (markers.length > 1) {
      const lats = markers.map((m) => m.coordinates.lat)
      const lngs = markers.map((m) => m.coordinates.lng)
      const bounds = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ]
      console.log('MapView: Setting bounds for', markers.length, 'markers:', bounds)
      mapInstanceRef.current.setBounds(bounds, {
        checkZoomRange: true,
        duration: 300,
      })
    } else if (markers.length === 1) {
      mapInstanceRef.current.setCenter(
        [markers[0].coordinates.lat, markers[0].coordinates.lng],
        10
      )
    }

    console.log('MapView: Markers added successfully!')
  }

  // Инициализация карты когда скрипт загружен
  useEffect(() => {
    if (window.ymaps && !mapInstanceRef.current) {
      console.log('MapView: Script ready, initializing map')
      initMap()
    }
  }, [])

  // Триггер для проверки загрузки скрипта при появлении маркеров
  useEffect(() => {
    if (markers.length > 0 && window.ymaps && !mapInstanceRef.current) {
      console.log('MapView: Markers arrived, initializing map')
      initMap()
    }
  }, [markers.length])

  // Обновление маркеров при изменении данных
  useEffect(() => {
    console.log('MapView: useEffect triggered for markers')
    console.log('MapView: mapInstanceRef.current:', !!mapInstanceRef.current)
    console.log('MapView: window.ymaps:', !!window.ymaps)
    console.log('MapView: markers.length:', markers.length)

    if (!mapInstanceRef.current) {
      console.log('MapView: Map not initialized yet, skipping marker update')
      return
    }

    addMarkersToMap()
  }, [markers])

  // Центрирование на выбранном маркере
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedMarker) return

    const { lat, lng } = selectedMarker.coordinates
    console.log('MapView: Centering on selected marker:', selectedMarker.name)
    mapInstanceRef.current.setCenter([lat, lng], 12, {
      duration: 500,
    })
  }, [selectedMarker])

  return (
    <>
      <Script
        src="https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('MapView: Yandex Maps script loaded')
          initMap()
        }}
      />
      <div
        ref={mapRef}
        style={{ width: '100%', height: '600px' }}
      />
    </>
  )
}
