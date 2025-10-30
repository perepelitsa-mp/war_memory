'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

interface UserSearchResult {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  avatar_url: string | null
}

interface AddModeratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fallenId: string
  currentEditorIds: string[]
}

export function AddModeratorDialog({
  open,
  onOpenChange,
  fallenId,
  currentEditorIds,
}: AddModeratorDialogProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setError('Введите минимум 2 символа для поиска')
      return
    }

    setError(null)
    setIsSearching(true)

    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка при поиске')
      }

      const data = await response.json()
      // Фильтруем уже добавленных модераторов
      const filtered = data.users.filter(
        (user: UserSearchResult) => !currentEditorIds.includes(user.id)
      )
      setSearchResults(filtered)

      if (filtered.length === 0) {
        setError('Пользователи не найдены или уже добавлены в модераторы')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddModerator = async (userId: string) => {
    setError(null)
    setIsAdding(true)

    try {
      const response = await fetch('/api/fallen/moderators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fallen_id: fallenId,
          editor_id: userId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка при добавлении модератора')
      }

      // Успешно добавлен
      onOpenChange(false)
      setSearchQuery('')
      setSearchResults([])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Добавить модератора</DialogTitle>
          <DialogDescription>
            Найдите пользователя по ФИО, email или номеру телефона
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Введите ФИО, email или телефон..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSearching}
            />
            <Button onClick={handleSearch} disabled={isSearching} className="gap-2">
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Поиск...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Найти
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {searchResults.length > 0 && (
            <ScrollArea className="h-[400px] rounded-lg border">
              <div className="p-2 space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.full_name}</p>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {user.email && <p className="truncate">{user.email}</p>}
                          {user.phone && <p>{user.phone}</p>}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddModerator(user.id)}
                      disabled={isAdding}
                      size="sm"
                      className="shrink-0"
                    >
                      {isAdding ? 'Добавление...' : 'Добавить'}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
