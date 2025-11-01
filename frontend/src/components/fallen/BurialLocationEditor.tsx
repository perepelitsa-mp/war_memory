'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Loader2 } from 'lucide-react'

interface BurialLocationEditorProps {
  fallenId: string
  currentLocation?: string
  currentCoordinates?: { lat: number; lng: number }
}

declare global {
  interface Window {
    ymaps: any
  }
}

export function BurialLocationEditor({
  fallenId,
  currentLocation = '',
  currentCoordinates,
}: BurialLocationEditorProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(currentLocation)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    currentCoordinates || null
  )

  const [mapElement, setMapElement] = useState<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)
  const placemarkRef = useRef<any>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [mapKey, setMapKey] = useState(0) // Счетчик для принудительного пересоздания карты

  // Инициализация карты
  const initMap = (element: HTMLDivElement) => {
    if (!element || !window.ymaps) {
      return
    }

    if (mapInstanceRef.current) {
      return
    }

    // Функция создания карты
    const createMap = () => {
      if (mapInstanceRef.current) {
        return
      }

      try {
        // Начальная точка - текущие координаты или центр России
        const center: [number, number] = coordinates
          ? [coordinates.lat, coordinates.lng]
          : [55.7558, 37.6173]

        // Создаем карту
        const map = new window.ymaps.Map(element, {
          center,
          zoom: coordinates ? 10 : 4,
          controls: ['zoomControl', 'searchControl', 'geolocationControl'],
        })

        mapInstanceRef.current = map

        // Если есть текущие координаты, добавляем маркер
        if (coordinates) {
          addPlacemark(coordinates.lat, coordinates.lng)
        }

        // Обработчик клика по карте
        map.events.add('click', (e: any) => {
          const coords = e.get('coords')
          setCoordinates({ lat: coords[0], lng: coords[1] })
          addPlacemark(coords[0], coords[1])

          // Получаем адрес по координатам
          window.ymaps.geocode(coords).then((res: any) => {
            const firstGeoObject = res.geoObjects.get(0)
            const address = firstGeoObject.getAddressLine()
            setLocation(address)
          })
        })

        setMapReady(true)
      } catch (error) {
        setMapReady(false)
      }
    }

    // Используем ymaps.ready() для корректной инициализации
    window.ymaps.ready(createMap)
  }

  // Добавление маркера на карту
  const addPlacemark = (lat: number, lng: number) => {
    if (!mapInstanceRef.current || !window.ymaps) return

    // Удаляем старый маркер
    if (placemarkRef.current) {
      mapInstanceRef.current.geoObjects.remove(placemarkRef.current)
    }

    // Создаем новый маркер
    const placemark = new window.ymaps.Placemark(
      [lat, lng],
      {
        balloonContent: '<strong>Место захоронения</strong>',
        hintContent: 'Выбранная точка',
      },
      {
        preset: 'islands#redIcon',
        draggable: true,
      }
    )

    // Обработчик перетаскивания маркера
    placemark.events.add('dragend', (e: any) => {
      const coords = e.get('target').geometry.getCoordinates()
      setCoordinates({ lat: coords[0], lng: coords[1] })

      // Получаем адрес
      window.ymaps.geocode(coords).then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0)
        const address = firstGeoObject.getAddressLine()
        setLocation(address)
      })
    })

    mapInstanceRef.current.geoObjects.add(placemark)
    placemarkRef.current = placemark

    // Центрируем карту на маркере
    mapInstanceRef.current.setCenter([lat, lng], 10, { duration: 300 })
  }

  // Инициализация при открытии диалога и загрузке скрипта
  useEffect(() => {
    if (isOpen && scriptLoaded && window.ymaps && mapElement && !mapInstanceRef.current) {
      // Даем время DialogContent полностью отрендериться
      const timer = setTimeout(() => {
        initMap(mapElement)
      }, 200)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isOpen, scriptLoaded, mapElement, mapKey])

  // Сохранение координат
  const handleSave = async () => {
    if (!coordinates) {
      alert('Выберите точку на карте')
      return
    }

    if (!location.trim()) {
      alert('Укажите описание места захоронения')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/fallen/${fallenId}/burial-location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates,
          location: location.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при сохранении')
      }

      alert('Место захоронения успешно обновлено')
      handleOpenChange(false)
      router.refresh() // Обновляем данные на странице
    } catch (error: any) {
      alert(error.message || 'Ошибка при сохранении координат')
    } finally {
      setLoading(false)
    }
  }

  // Сброс при закрытии
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)

    if (open) {
      // При открытии увеличиваем счетчик для пересоздания DOM-элемента карты
      setMapKey((prev) => prev + 1)
    } else {
      // Сбрасываем к исходным значениям
      setLocation(currentLocation)
      setCoordinates(currentCoordinates || null)
      setMapReady(false)

      // Очищаем карту
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy()
        } catch (error) {
          // Игнорируем ошибки при уничтожении карты
        }
      }

      // Сбрасываем все ссылки
      mapInstanceRef.current = null
      placemarkRef.current = null
      setMapElement(null)
    }
  }

  return (
    <>
      <Script
        src="https://api-maps.yandex.ru/2.1/?apikey=&lang=ru_RU"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true)
        }}
      />

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2" size="sm">
            <MapPin className="h-4 w-4" />
            {currentCoordinates ? 'Изменить место захоронения' : 'Добавить место захоронения'}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать место захоронения</DialogTitle>
            <DialogDescription>
              Кликните на карту или перетащите маркер, чтобы указать точное место захоронения
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Поле адреса */}
            <div className="space-y-2">
              <Label htmlFor="location">Место захоронения</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Например: ДНР, г. Мариуполь, кладбище..."
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Адрес заполнится автоматически при выборе точки на карте, но вы можете изменить его
              </p>
            </div>

            {/* Координаты */}
            {coordinates && (
              <div className="rounded-md bg-muted/50 p-3 text-sm">
                <p className="font-medium">Координаты:</p>
                <p className="text-muted-foreground">
                  Широта: {coordinates.lat.toFixed(6)}, Долгота: {coordinates.lng.toFixed(6)}
                </p>
              </div>
            )}

            {/* Карта */}
            <div className="space-y-2">
              <Label>Выберите точку на карте</Label>
              <div
                key={mapKey}
                className="relative h-[400px] w-full rounded-lg border border-border overflow-hidden"
              >
                {!mapReady && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/30">
                    <div className="text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Загрузка карты...</p>
                    </div>
                  </div>
                )}
                <div
                  ref={setMapElement}
                  className="h-full w-full"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Кликните на карту для выбора точки, или перетащите маркер в нужное место
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || !coordinates}
              className="w-full bg-amber-600 hover:bg-amber-700 sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
