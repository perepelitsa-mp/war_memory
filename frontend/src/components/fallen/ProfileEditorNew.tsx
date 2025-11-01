'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useConfirmDialog } from '@/components/ui/alert-dialog-custom'
import { Pencil, Save, X, User, Calendar, Shield, MapPin, Award, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SettlementCombobox } from '@/components/ui/settlement-combobox'
import { VusSelector } from './VusSelector'
import { BurialLocationEditor } from './BurialLocationEditor'
import { BurialMapPreview } from './BurialMapPreview'
import { cn } from '@/lib/utils'

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
  vus_id: string | null
  hometown: string | null
  burial_location: string | null
}

interface ProfileEditorProps {
  fallenId: string
  initialData: ProfileData
  canEdit: boolean
  burialCoordinates?: { lat: number; lng: number }
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
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// Компонент для отображения ВУС в режиме просмотра
function VusDisplay({ vusId }: { vusId: string | null }) {
  const [vus, setVus] = useState<{ code: string; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!vusId) {
      setIsLoading(false)
      return
    }

    fetch('/api/vus')
      .then((res) => res.json())
      .then((data) => {
        const foundVus = data.vus?.find((v: any) => v.id === vusId)
        setVus(foundVus || null)
      })
      .catch((err) => console.error('Error loading VUS:', err))
      .finally(() => setIsLoading(false))
  }, [vusId])

  if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка...</p>
  if (!vus) return <p className="text-sm text-muted-foreground">Не указано</p>

  return (
    <p className="text-sm font-medium text-foreground">
      {vus.code} — {vus.name}
    </p>
  )
}

// Компонент для отдельного поля
function ProfileField({
  label,
  icon: Icon,
  value,
  isEditing,
  editComponent,
}: {
  label: string
  icon: any
  value: string | null
  isEditing: boolean
  editComponent?: React.ReactNode
}) {
  return (
    <div className="group space-y-2">
      <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Label>
      {isEditing ? (
        editComponent
      ) : (
        <p className={cn(
          "min-h-[2.5rem] rounded-lg border border-transparent bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors",
          "group-hover:border-border/50 group-hover:bg-background/80"
        )}>
          {value || <span className="text-muted-foreground">Не указано</span>}
        </p>
      )}
    </div>
  )
}

export function ProfileEditorNew({ fallenId, initialData, canEdit, burialCoordinates }: ProfileEditorProps) {
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
          variant: 'info',
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
        variant: 'success',
      })

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      await alert({
        title: 'Ошибка сохранения',
        description: error instanceof Error ? error.message : 'Не удалось сохранить изменения.',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-background/95 via-surface/90 to-background/95 shadow-xl backdrop-blur-sm">
      {/* Декоративный фон */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 20%, hsla(var(--primary), 0.08), transparent 50%)',
        }}
      />

      {/* Header */}
      <div className="relative border-b border-border/50 bg-background/50 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Детальная информация</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Полные данные о герое и его службе
            </p>
          </div>
          {canEdit && !isEditing && (
            <Button onClick={handleEdit} size="default" className="gap-2">
              <Pencil className="h-4 w-4" />
              Редактировать
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative space-y-6 p-6 md:p-8">
        {/* Личные данные */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Личные данные</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <ProfileField
              label="Фамилия"
              icon={User}
              value={formData.last_name}
              isEditing={isEditing}
              editComponent={
                <Input
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  disabled={isLoading}
                  placeholder="Иванов"
                />
              }
            />

            <ProfileField
              label="Имя"
              icon={User}
              value={formData.first_name}
              isEditing={isEditing}
              editComponent={
                <Input
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  disabled={isLoading}
                  placeholder="Иван"
                />
              }
            />

            <ProfileField
              label="Отчество"
              icon={User}
              value={formData.middle_name}
              isEditing={isEditing}
              editComponent={
                <Input
                  value={formData.middle_name || ''}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                  disabled={isLoading}
                  placeholder="Иванович"
                />
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField
              label="Дата рождения"
              icon={Calendar}
              value={formatDateToDisplay(formData.birth_date)}
              isEditing={isEditing}
              editComponent={
                <Input
                  type="date"
                  value={formData.birth_date || ''}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  disabled={isLoading}
                />
              }
            />

            <ProfileField
              label="Дата гибели"
              icon={Calendar}
              value={formatDateToDisplay(formData.death_date)}
              isEditing={isEditing}
              editComponent={
                <Input
                  type="date"
                  value={formData.death_date || ''}
                  onChange={(e) => setFormData({ ...formData, death_date: e.target.value })}
                  disabled={isLoading}
                />
              }
            />
          </div>
        </div>

        {/* Разделитель */}
        <div className="border-t border-border/50" />

        {/* Военная служба */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Военная служба</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
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
                  <SelectTrigger>
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
                <p className="min-h-[2.5rem] rounded-lg border border-transparent bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-border/50 hover:bg-background/80">
                  {getServiceTypeLabel(formData.service_type) || <span className="text-muted-foreground">Не указано</span>}
                </p>
              )}
            </div>

            <ProfileField
              label="Звание"
              icon={Award}
              value={formData.rank}
              isEditing={isEditing}
              editComponent={
                <Input
                  value={formData.rank || ''}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  disabled={isLoading}
                  placeholder="Рядовой"
                />
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField
              label="Подразделение"
              icon={Users}
              value={formData.military_unit}
              isEditing={isEditing}
              editComponent={
                <Input
                  value={formData.military_unit || ''}
                  onChange={(e) => setFormData({ ...formData, military_unit: e.target.value })}
                  disabled={isLoading}
                  placeholder="Название подразделения"
                />
              }
            />

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                ВУС
              </Label>
              {isEditing ? (
                <VusSelector
                  value={formData.vus_id}
                  onChange={(value) => setFormData({ ...formData, vus_id: value })}
                  disabled={isLoading}
                />
              ) : (
                <div className="min-h-[2.5rem] rounded-lg border border-transparent bg-background/50 px-3 py-2 transition-colors hover:border-border/50 hover:bg-background/80">
                  <VusDisplay vusId={formData.vus_id} />
                </div>
              )}
            </div>
          </div>

          {(isEditing || formData.service_start_date) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField
                label="Начало службы"
                icon={Calendar}
                value={formatDateToDisplay(formData.service_start_date)}
                isEditing={isEditing}
                editComponent={
                  <Input
                    type="date"
                    value={formData.service_start_date || ''}
                    onChange={(e) => setFormData({ ...formData, service_start_date: e.target.value })}
                    disabled={isLoading}
                  />
                }
              />

              <ProfileField
                label="Окончание службы"
                icon={Calendar}
                value={formatDateToDisplay(formData.service_end_date)}
                isEditing={isEditing}
                editComponent={
                  <Input
                    type="date"
                    value={formData.service_end_date || ''}
                    onChange={(e) => setFormData({ ...formData, service_end_date: e.target.value })}
                    disabled={isLoading}
                  />
                }
              />
            </div>
          )}
        </div>

        {/* Разделитель */}
        <div className="border-t border-border/50" />

        {/* Местоположение */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Местоположение</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
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
                <p className="min-h-[2.5rem] rounded-lg border border-transparent bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-border/50 hover:bg-background/80">
                  {formData.hometown || <span className="text-muted-foreground">Не указано</span>}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
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
                <p className="min-h-[2.5rem] rounded-lg border border-transparent bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-border/50 hover:bg-background/80">
                  {formData.burial_location || <span className="text-muted-foreground">Не указано</span>}
                </p>
              )}
            </div>
          </div>

          {/* Редактор места захоронения с картой */}
          {canEdit && (
            <div className="space-y-3">
              <BurialLocationEditor
                fallenId={fallenId}
                currentLocation={formData.burial_location || ''}
                currentCoordinates={burialCoordinates}
              />
            </div>
          )}

          {/* Превью карты с местом захоронения */}
          {burialCoordinates && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Место захоронения на карте
              </Label>
              <BurialMapPreview
                coordinates={burialCoordinates}
                location={formData.burial_location || 'Место захоронения'}
              />
            </div>
          )}
        </div>

        {/* Кнопки сохранения/отмены */}
        {isEditing && (
          <div className="flex gap-3 border-t border-border/50 pt-6">
            <Button onClick={handleSave} disabled={isLoading} size="lg" className="flex-1 gap-2">
              <Save className="h-4 w-4" />
              Сохранить изменения
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isLoading}
              size="lg"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Отменить
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
