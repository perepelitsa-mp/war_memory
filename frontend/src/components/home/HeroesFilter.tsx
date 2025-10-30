'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SettlementCombobox } from '@/components/ui/settlement-combobox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface HeroesFilterProps {
  initialSearch?: string
  initialCity?: string
  initialUnit?: string
  availableUnits: string[]
}

export function HeroesFilter({
  initialSearch = '',
  initialCity = '',
  initialUnit = '',
  availableUnits,
}: HeroesFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch)
  const [city, setCity] = useState<string | null>(initialCity || null)
  const [unit, setUnit] = useState(initialUnit)
  const [isExpanded, setIsExpanded] = useState(false)

  // Update URL with filters
  useEffect(() => {
    const params = new URLSearchParams()

    if (search) params.set('search', search)
    if (city) params.set('city', city)
    if (unit) params.set('unit', unit)

    const queryString = params.toString()
    const newUrl = queryString ? `/?${queryString}` : '/'

    router.push(newUrl, { scroll: false })
  }, [search, city, unit, router])

  const hasActiveFilters = search || city || unit

  const clearFilters = () => {
    setSearch('')
    setCity(null)
    setUnit('')
    setIsExpanded(false)
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4 shadow-sm backdrop-blur-sm sm:p-6">
      <div className="flex flex-col gap-4">
        {/* Header with search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Поиск по ФИО героя..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="default"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full gap-2 sm:w-auto"
          >
            <Filter className="h-4 w-4" />
            Фильтры
            {hasActiveFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {[search, city, unit].filter(Boolean).length}
              </span>
            )}
          </Button>
        </div>

        {/* Expanded filters */}
        {isExpanded && (
          <div className="grid gap-4 border-t border-border/30 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Населенный пункт
              </label>
              <SettlementCombobox
                value={city}
                onChange={setCity}
                placeholder="Выберите город..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Воинская часть
              </label>
              {availableUnits.length > 0 ? (
                <div className="relative">
                  <Select value={unit || undefined} onValueChange={(value) => setUnit(value || '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите часть..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.map((unitName) => (
                        <SelectItem key={unitName} value={unitName}>
                          {unitName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {unit && (
                    <button
                      onClick={() => setUnit('')}
                      className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <Input
                  type="text"
                  placeholder="Введите часть..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              )}
            </div>

            {hasActiveFilters && (
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <Button
                  variant="ghost"
                  size="default"
                  onClick={clearFilters}
                  className="w-full gap-2"
                >
                  <X className="h-4 w-4" />
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
