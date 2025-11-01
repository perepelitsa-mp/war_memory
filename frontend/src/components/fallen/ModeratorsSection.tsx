'use client'

import { useState } from 'react'
import { User, Plus, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AddModeratorDialog } from './AddModeratorDialog'
import { useRouter } from 'next/navigation'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'

interface UserInfo {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  avatar_url: string | null
}

interface ModeratorsSectionProps {
  fallenId: string
  owner: UserInfo
  editors: UserInfo[]
  currentUserId: string | null
  currentUserRole: string
}

export function ModeratorsSection({
  fallenId,
  owner,
  editors,
  currentUserId,
  currentUserRole,
}: ModeratorsSectionProps) {
  const router = useRouter()
  const { confirm, alert } = useConfirmDialog()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const isOwner = currentUserId === owner.id
  const isAdmin = ['superadmin', 'admin', 'moderator'].includes(currentUserRole)
  const isEditor = editors.some((e) => e.id === currentUserId)
  const canAddModerators = isOwner || isAdmin || isEditor
  const canRemoveModerators = isOwner || isAdmin

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const handleRemoveModerator = async (editorId: string) => {
    const confirmed = await confirm({
      title: 'Удалить модератора',
      description: 'Вы уверены, что хотите удалить модератора? Это действие нельзя отменить.',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      variant: 'destructive',
    })

    if (!confirmed) {
      return
    }

    setRemovingId(editorId)
    try {
      const response = await fetch('/api/fallen/moderators', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fallen_id: fallenId,
          editor_id: editorId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Ошибка при удалении модератора')
      }

      router.refresh()
    } catch (error) {
      await alert({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка',
        confirmText: 'Закрыть',
        variant: 'error',
      })
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <TooltipProvider>
      <Card className="border border-border/50 bg-background/70 shadow-soft">
        <CardContent className="px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap sm:gap-3">
              {/* Владелец карточки */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[0.65rem] text-muted-foreground sm:text-xs">Создатель:</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 cursor-pointer sm:gap-2">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                        <AvatarImage src={owner.avatar_url || undefined} alt={owner.full_name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[0.6rem] sm:text-xs">
                          {getInitials(owner.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium sm:text-sm">{owner.full_name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">{owner.full_name}</p>
                      {owner.email && (
                        <p className="text-xs text-muted-foreground">Email: {owner.email}</p>
                      )}
                      {owner.phone && (
                        <p className="text-xs text-muted-foreground">Телефон: {owner.phone}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Модераторы */}
              {editors.length > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-[0.65rem] text-muted-foreground sm:text-xs">Модераторы:</span>
                  {editors.map((editor) => (
                    <Tooltip key={editor.id}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-pointer group relative sm:gap-2">
                          <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                            <AvatarImage
                              src={editor.avatar_url || undefined}
                              alt={editor.full_name}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-[0.6rem] sm:text-xs">
                              {getInitials(editor.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium sm:text-sm">{editor.full_name}</span>
                          {canRemoveModerators && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveModerator(editor.id)
                              }}
                              disabled={removingId === editor.id}
                              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive/90 disabled:opacity-50 sm:h-5 sm:w-5"
                            >
                              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </button>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-semibold">{editor.full_name}</p>
                          {editor.email && (
                            <p className="text-xs text-muted-foreground">Email: {editor.email}</p>
                          )}
                          {editor.phone && (
                            <p className="text-xs text-muted-foreground">
                              Телефон: {editor.phone}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </>
              )}
            </div>

            {canAddModerators && (
              <Button
                onClick={() => setShowAddDialog(true)}
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 shrink-0 sm:h-9 sm:gap-2"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Добавить модератора</span>
                <span className="text-xs sm:hidden">Добавить</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AddModeratorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        fallenId={fallenId}
        currentEditorIds={[owner.id, ...editors.map((e) => e.id)]}
      />
    </TooltipProvider>
  )
}
