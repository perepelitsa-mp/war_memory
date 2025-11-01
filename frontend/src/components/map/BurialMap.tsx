'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Loader2 } from 'lucide-react'
import MapView from './MapView'

interface BurialMarker {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  burialLocation: string
  hometown?: string
  rank?: string
  militaryUnit?: string
  birthDate?: string
  deathDate?: string
  photoUrl?: string
}

interface BurialMapStats {
  total: number
  byRegion: Record<string, number>
  byCity: Record<string, number>
}

export function BurialMap() {
  const [markers, setMarkers] = useState<BurialMarker[]>([])
  const [stats, setStats] = useState<BurialMapStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMarker, setSelectedMarker] = useState<BurialMarker | null>(null)

  useEffect(() => {
    loadBurialLocations()
  }, [])

  const loadBurialLocations = async () => {
    setLoading(true)
    try {
      console.log('BurialMap: Fetching data from API...')
      const response = await fetch('/api/burial-map')
      if (!response.ok) throw new Error('Failed to load burial locations')

      const data = await response.json()
      console.log('BurialMap: Received data:', data)
      console.log('BurialMap: Markers count:', data.markers?.length)
      setMarkers(data.markers || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error loading burial locations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Заголовок и статистика */}
      <Card className="border-amber-200/50 bg-background/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <MapPin className="h-6 w-6 text-amber-500" />
            Карта захоронений
          </CardTitle>

          {/* Статистика */}
          {stats && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                Всего: {stats.total}
              </Badge>
              <Badge variant="outline">
                Регионов: {Object.keys(stats.byRegion).length}
              </Badge>
              <Badge variant="outline">
                Городов: {Object.keys(stats.byCity).length}
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Карта */}
      <Card className="overflow-hidden border-amber-200/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-[400px] items-center justify-center sm:h-[600px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <MapView
              markers={markers}
              selectedMarker={selectedMarker}
              onMarkerClick={setSelectedMarker}
            />
          )}
        </CardContent>
      </Card>

      {/* Информация о выбранном маркере */}
      {selectedMarker && (
        <Card className="border-amber-200/50 bg-background/60">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">{selectedMarker.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedMarker.rank && (
              <p className="text-sm text-muted-foreground">{selectedMarker.rank}</p>
            )}
            {selectedMarker.burialLocation && (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <p className="text-sm">{selectedMarker.burialLocation}</p>
              </div>
            )}
            {selectedMarker.hometown && (
              <p className="text-sm text-muted-foreground">
                Родной город: {selectedMarker.hometown}
              </p>
            )}
            <div className="pt-2">
              <Button asChild size="sm" className="w-full bg-amber-600 hover:bg-amber-700 sm:w-auto">
                <a href={`/fallen/${selectedMarker.id}`}>Открыть карточку</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
