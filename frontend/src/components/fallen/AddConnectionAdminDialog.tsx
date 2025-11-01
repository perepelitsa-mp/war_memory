'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthModal } from '@/contexts/AuthModalContext'

interface AddConnectionAdminDialogProps {
  fallenId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SearchUser {
  id: string
  full_name: string
  avatar_url: string | null
  phone: string
  bio: string | null
}

const relationshipOptions = [
  { value: 'spouse', label: 'Супруг(а)' },
  { value: 'parent', label: 'Родитель' },
  { value: 'child', label: 'Ребёнок' },
  { value: 'sibling', label: 'Брат/Сестра' },
  { value: 'grandparent', label: 'Дедушка/Бабушка' },
  { value: 'grandchild', label: 'Внук/Внучка' },
  { value: 'uncle_aunt', label: 'Дядя/Тётя' },
  { value: 'nephew_niece', label: 'Племянник/Племянница' },
  { value: 'cousin', label: 'Двоюродный брат/сестра' },
  { value: 'other', label: 'Другое родство' },
]

const getInitials = (name: string) => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function AddConnectionAdminDialog({
  fallenId,
  open,
  onOpenChange,
}: AddConnectionAdminDialogProps) {
  const router = useRouter()
  const { openAuthModal } = useAuthModal()
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null)
  const [connectionType, setConnectionType] = useState<string>('')
  const [relationship, setRelationship] = useState<string>('')
  const [description, setDescription] = useState('')

  // Поиск пользователей с дебаунсом
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.users || [])
        }
      } catch (error) {
        console.error('Error searching users:', error)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) {
      alert('Выберите пользователя')
      return
    }

    if (!connectionType) {
      alert('Выберите тип связи')
      return
    }

    if (connectionType === 'relative' && !relationship) {
      alert('Для родственников необходимо указать степень родства')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/fallen/${fallenId}/connections/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          connection_type: connectionType,
          relationship: connectionType === 'relative' ? relationship : null,
          description,
        }),
      })

      if (response.status === 401) {
        alert('Необходимо авторизоваться')
        openAuthModal()
        return
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка создания связи')
      }

      alert('Связь успешно добавлена')
      onOpenChange(false)
      setSelectedUser(null)
      setSearchQuery('')
      setConnectionType('')
      setRelationship('')
      setDescription('')
      router.refresh()
    } catch (error) {
      console.error('Error creating connection:', error)
      alert(error instanceof Error ? error.message : 'Не удалось создать связь')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить родственника (администратор)</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Поиск пользователя */}
          {!selectedUser && (
            <div className="space-y-2">
              <Label>Поиск пользователя</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введите имя пользователя..."
                  className="pl-9"
                />
              </div>

              {/* Результаты поиска */}
              {searchLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(user)
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      className="flex w-full items-center gap-3 rounded-lg border border-border/40 bg-background/50 p-3 transition-colors hover:bg-muted"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="text-xs font-semibold">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searchLoading && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Пользователи не найдены
                </p>
              )}
            </div>
          )}

          {/* Выбранный пользователь */}
          {selectedUser && (
            <div className="space-y-2">
              <Label>Выбранный пользователь</Label>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="text-xs font-semibold">
                    {getInitials(selectedUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{selectedUser.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedUser.phone}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  Изменить
                </Button>
              </div>
            </div>
          )}

          {/* Тип связи */}
          {selectedUser && (
            <>
              <div className="space-y-2">
                <Label>Тип связи</Label>
                <Select value={connectionType} onValueChange={setConnectionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип связи" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relative">Родственник</SelectItem>
                    <SelectItem value="friend">Друг</SelectItem>
                    <SelectItem value="fellow_soldier">Сослуживец</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Степень родства */}
              {connectionType === 'relative' && (
                <div className="space-y-2">
                  <Label>Степень родства</Label>
                  <Select value={relationship} onValueChange={setRelationship}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите степень родства" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Описание */}
              <div className="space-y-2">
                <Label>Описание (опционально)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Дополнительная информация о связи..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </>
          )}

          {/* Кнопки */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setSelectedUser(null)
                setSearchQuery('')
                setConnectionType('')
                setRelationship('')
                setDescription('')
              }}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading || !selectedUser}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Добавить связь
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
