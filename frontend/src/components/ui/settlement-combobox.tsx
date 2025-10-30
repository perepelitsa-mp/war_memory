'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Loader2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Settlement {
  id: string
  value: string
  label: string
  description?: string
  country: string
}

interface SettlementComboboxProps {
  value: string | null
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SettlementCombobox({
  value,
  onChange,
  placeholder = 'Выберите населенный пункт...',
  disabled = false,
  className,
}: SettlementComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [settlements, setSettlements] = React.useState<Settlement[]>([])
  const [loading, setLoading] = React.useState(false)
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>()

  // Поиск населенных пунктов
  const searchSettlements = React.useCallback(async (query: string) => {
    if (query.length < 2) {
      setSettlements([])
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `/api/settlements/search?q=${encodeURIComponent(query)}&limit=20`
      )

      if (!response.ok) {
        throw new Error('Ошибка поиска')
      }

      const data = await response.json()
      setSettlements(data.results || [])
    } catch (error) {
      console.error('Ошибка поиска населенных пунктов:', error)
      setSettlements([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Дебаунс поиска
  React.useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchSettlements(search)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [search, searchSettlements])

  // Очистка при закрытии
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSearch('')
      setSettlements([])
    }
  }

  const selectedSettlement = settlements.find((s) => s.value === value)

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
        >
          <span className="flex items-center gap-2 truncate">
            {value ? (
              <>
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Начните вводить название..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Поиск...
              </div>
            ) : search.length < 2 ? (
              <CommandEmpty>Введите минимум 2 символа для поиска</CommandEmpty>
            ) : settlements.length === 0 ? (
              <CommandEmpty>Ничего не найдено</CommandEmpty>
            ) : (
              <CommandGroup>
                {settlements.map((settlement) => (
                  <button
                    key={settlement.id}
                    type="button"
                    className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-left outline-none hover:bg-accent hover:text-accent-foreground transition-colors focus:bg-accent focus:text-accent-foreground"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onChange(settlement.value)
                      setOpen(false)
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value === settlement.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-medium text-foreground">{settlement.label}</span>
                      {settlement.description && (
                        <span className="text-xs text-muted-foreground">
                          {settlement.description}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
