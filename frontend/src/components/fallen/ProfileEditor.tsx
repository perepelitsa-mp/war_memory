'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'
import { Pencil, Save, X, User, Calendar } from 'lucide-react'
import { RankIcon, UnitIcon, ServiceIcon, HometownIcon, BurialIcon } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { SettlementCombobox } from '@/components/ui/settlement-combobox'

interface ProfileData {
  first_name: string | null
  last_name: string | null
  middle_name: string | null
  birth_date: string | null
  death_date: string | null
  service_type: 'mobilized' | 'volunteer' | 'pmc' | 'professional' | null
  service_start_date: string | null
  service_end_date: string | null
  rank: string | null
  military_unit: string | null
  hometown: string | null
  burial_location: string | null
}

interface ProfileEditorProps {
  fallenId: string
  initialData: ProfileData
  canEdit: boolean
}

const getServiceTypeLabel = (serviceType: string | null) => {
  if (!serviceType) return null
  const labels: Record<string, string> = {
    mobilized: 'Мобилизован',
    volunteer: 'Доброволец',
    pmc: 'ЧВК',
    professional: 'Кадровый военнослужащий',
  }
  return labels[serviceType] || serviceType
}

// Форматирует дату из YYYY-MM-DD в DD.MM.YYYY
const formatDateToDisplay = (dateStr: string | null) => {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-')
  return `${day}.${month}.${year}`
}

// Форматирует диапазон дат
const formatDateRange = (startDate: string | null, endDate: string | null) => {
  const start = formatDateToDisplay(startDate)
  const end = formatDateToDisplay(endDate)
  if (start && end) return `${start} – ${end}`
  if (start) return `с ${start}`
  if (end) return `по ${end}`
  return null
}

export function ProfileEditor({ fallenId, initialData, canEdit }: ProfileEditorProps) {
  const router = useRouter()
  const { alert, confirm } = useConfirmDialog()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileData>(initialData)

  const handleEdit = () => {
    setIsEditing(true)
    setFormData(initialData)
  }

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: 'Отменить изменения?',
      description: 'Все несохранённые изменения будут потеряны.',
      confirmText: 'Отменить',
      cancelText: 'Продолжить редактирование',
    })

    if (confirmed) {
      setFormData(initialData)
      setIsEditing(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Собираем только изменённые поля
      const changedFields: Partial<ProfileData> = {}
      let hasChanges = false

      Object.keys(formData).forEach((key) => {
        const fieldKey = key as keyof ProfileData
        if (formData[fieldKey] !== initialData[fieldKey]) {
          changedFields[fieldKey] = formData[fieldKey]
          hasChanges = true
        }
      })

      if (!hasChanges) {
        await alert({
          title: 'Нет изменений',
          description: 'Вы не внесли никаких изменений в профиль.',
        })
        setIsEditing(false)
        setIsLoading(false)
        return
      }

      // Сохраняем каждое изменённое поле
      const updatePromises = Object.entries(changedFields).map(([fieldName, value]) =>
        fetch(`/api/fallen/${fallenId}/update-field`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: fieldName, value }),
        }).then(async (res) => {
          if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || `Ошибка обновления поля ${fieldName}`)
          }
          return res.json()
        })
      )

      await Promise.all(updatePromises)

      await alert({
        title: 'Профиль обновлён',
        description: 'Все изменения успешно сохранены.',
      })

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      await alert({
        title: 'Ошибка сохранения',
        description: error instanceof Error ? error.message : 'Не удалось сохранить изменения.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border border-border/50 bg-background/70 shadow-soft">
      <CardHeader className="px-3 pb-3 sm:px-6 sm:pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl">Профиль героя</CardTitle>
          {canEdit && !isEditing && (
            <Button onClick={handleEdit} variant="outline" size="sm" className="h-8 gap-1.5 sm:h-9 sm:gap-2">
              <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Редактировать</span>
              <span className="text-xs sm:hidden">Изменить</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-3 sm:space-y-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          {/* Имя */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="first_name" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
              Имя
            </Label>
            {isEditing ? (
              <Input
                id="first_name"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={isLoading}
              />
            ) : (
              <p className="text-sm text-foreground sm:text-base">{formData.first_name || '—'}</p>
            )}
          </div>

          {/* Фамилия */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="last_name" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
              Фамилия
            </Label>
            {isEditing ? (
              <Input
                id="last_name"
                value={formData.last_name || ''}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={isLoading}
              />
            ) : (
              <p className="text-sm text-foreground sm:text-base">{formData.last_name || '—'}</p>
            )}
          </div>

          {/* Отчество */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="middle_name" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
              Отчество
            </Label>
            {isEditing ? (
              <Input
                id="middle_name"
                value={formData.middle_name || ''}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                disabled={isLoading}
              />
            ) : (
              <p className="text-sm text-foreground sm:text-base">{formData.middle_name || '—'}</p>
            )}
          </div>

          {/* Вид службы */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="service_type" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <ServiceIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Вид службы
            </Label>
            {isEditing ? (
              <Select
                value={formData.service_type || ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, service_type: value as ProfileData['service_type'] })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="service_type">
                  <SelectValue placeholder="Выберите вид службы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobilized">Мобилизован</SelectItem>
                  <SelectItem value="volunteer">Доброволец</SelectItem>
                  <SelectItem value="pmc">ЧВК</SelectItem>
                  <SelectItem value="professional">Кадровый военнослужащий</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-foreground sm:text-base">
                {getServiceTypeLabel(formData.service_type) || '—'}
              </p>
            )}
          </div>

          {/* Звание */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="rank" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <RankIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Звание
            </Label>
            {isEditing ? (
              <Input
                id="rank"
                value={formData.rank || ''}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                disabled={isLoading}
              />
            ) : (
              <p className="text-sm text-foreground sm:text-base">{formData.rank || '—'}</p>
            )}
          </div>

          {/* Подразделение */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="military_unit" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <UnitIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Подразделение
            </Label>
            {isEditing ? (
              <Input
                id="military_unit"
                value={formData.military_unit || ''}
                onChange={(e) => setFormData({ ...formData, military_unit: e.target.value })}
                disabled={isLoading}
              />
            ) : (
              <p className="text-sm text-foreground sm:text-base">{formData.military_unit || '—'}</p>
            )}
          </div>

          {/* Дата рождения */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="birth_date" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
              Дата рождения
            </Label>
            {isEditing ? (
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                disabled={isLoading}
              />
            ) : (
              <p className="text-sm text-foreground sm:text-base">{formData.birth_date || '—'}</p>
            )}
          </div>

          {/* Дата гибели */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="death_date" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
              Дата гибели
            </Label>
            {isEditing ? (
              <Input
                id="death_date"
                type="date"
                value={formData.death_date || ''}
                onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
                disabled={isLoading}
              />
            ) : (
              <p className="text-sm text-foreground sm:text-base">{formData.death_date || '—'}</p>
            )}
          </div>



          {/* Родной город */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="hometown" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <HometownIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Родной город
            </Label>
            {isEditing ? (
              <SettlementCombobox
                value={formData.hometown}
                onChange={(value) => setFormData({ ...formData, hometown: value })}
                placeholder="Выберите населенный пункт..."
                disabled={isLoading}
              />
            ) : (
              <p className="text-sm text-foreground sm:text-base">{formData.hometown || '—'}</p>
            )}
          </div>

          {/* Место захоронения */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="burial_location" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <BurialIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Место захоронения
            </Label>
            {isEditing ? (
              <SettlementCombobox
                value={formData.burial_location}
                onChange={(value) => setFormData({ ...formData, burial_location: value })}
                placeholder="Выберите населенный пункт..."
                disabled={isLoading}
              />
            ) : (
              <p className="text-sm text-foreground sm:text-base">{formData.burial_location || '—'}</p>
            )}
          </div>
          {/* Даты службы */}
          {isEditing ? (
            <>
              {/* Дата начала службы */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="service_start_date" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                  Начало службы
                </Label>
                <Input
                  id="service_start_date"
                  type="date"
                  value={formData.service_start_date || ''}
                  onChange={(e) => setFormData({ ...formData, service_start_date: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              {/* Дата окончания службы */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="service_end_date" className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                  Окончание службы
                </Label>
                <Input
                  id="service_end_date"
                  type="date"
                  value={formData.service_end_date || ''}
                  onChange={(e) => setFormData({ ...formData, service_end_date: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </>
          ) : (
            formData.service_start_date && (
              <div className="space-y-1.5 sm:col-span-2 sm:space-y-2">
                <Label className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
                  Начало службы
                </Label>
                <p className="text-sm text-foreground sm:text-base">
                  {formData.service_start_date || '—'}
                </p>
              </div>
            )
          )}
        </div>

        {/* Кнопки сохранения/отмены */}
        {isEditing && (
          <div className="flex flex-col gap-2 border-t border-border/50 pt-3 sm:flex-row sm:gap-3 sm:pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="h-9 gap-1.5 sm:h-10 sm:gap-2">
              <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Сохранить изменения</span>
              <span className="text-sm sm:hidden">Сохранить</span>
            </Button>
            <Button onClick={handleCancel} variant="outline" disabled={isLoading} className="h-9 gap-1.5 sm:h-10 sm:gap-2">
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Отменить
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
