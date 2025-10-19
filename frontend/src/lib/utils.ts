import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

/**
 * Утилита для объединения CSS классов (для shadcn/ui)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Форматирование даты
 */
export function formatDate(date: string | Date | null, formatStr: string = 'dd MMMM yyyy'): string {
  if (!date) return '—'

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: ru })
  } catch (error) {
    return '—'
  }
}

/**
 * Форматирование периода жизни (годы)
 */
export function formatLifespan(birthDate: string | null, deathDate: string | null): string {
  const birth = birthDate ? new Date(birthDate).getFullYear() : null
  const death = deathDate ? new Date(deathDate).getFullYear() : null

  if (birth && death) {
    return `${birth} — ${death}`
  } else if (birth) {
    return `${birth} —`
  } else if (death) {
    return `— ${death}`
  }

  return '—'
}

/**
 * Получить полное ФИО
 */
export function getFullName(
  lastName: string,
  firstName: string,
  middleName?: string | null
): string {
  return [lastName, firstName, middleName].filter(Boolean).join(' ')
}

/**
 * Обрезать текст с многоточием
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Плюрализация (для "1 комментарий", "2 комментария", "5 комментариев")
 */
export function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return one
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return few
  } else {
    return many
  }
}

/**
 * Форматирование размера файла
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Б'

  const k = 1024
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Задержка (для debounce)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Проверка валидности URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Получить initials из ФИО
 */
export function getInitials(fullName: string): string {
  const words = fullName.split(' ')
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return fullName.slice(0, 2).toUpperCase()
}
