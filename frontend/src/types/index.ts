import { Database } from './database.types'

// Типы таблиц
export type User = Database['public']['Tables']['users']['Row']
export type Fallen = Database['public']['Tables']['fallen']['Row']
export type TimelineItem = Database['public']['Tables']['timeline_items']['Row']
export type MemoryItem = Database['public']['Tables']['memory_items']['Row']
export type MemoryAddition = Database['public']['Tables']['memory_additions']['Row']
export type FallenMedia = Database['public']['Tables']['fallen_media']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Award = Database['public']['Tables']['awards']['Row']
export type FallenAward = Database['public']['Tables']['fallen_awards']['Row']

// Расширенные типы с связями
export type FallenWithOwner = Fallen & {
  owner: Pick<User, 'id' | 'full_name' | 'avatar_url'>
}

export type FallenWithDetails = Fallen & {
  owner: Pick<User, 'id' | 'full_name' | 'avatar_url'>
  media: FallenMedia[]
  timeline_items: TimelineItem[]
  memory_items: MemoryItem[]
  _count?: {
    comments: number
  }
}

export type CommentWithAuthor = Comment & {
  author: Pick<User, 'id' | 'full_name' | 'avatar_url'>
  replies?: CommentWithAuthor[]
}

export type MemoryItemWithDetails = MemoryItem & {
  author: Pick<User, 'id' | 'full_name' | 'avatar_url'>
  additions: MemoryAdditionWithDetails[]
  comments: CommentWithAuthor[]
  media: FallenMedia[]
}

export type MemoryAdditionWithDetails = MemoryAddition & {
  author: Pick<User, 'id' | 'full_name' | 'avatar_url'>
  comments: CommentWithAuthor[]
  media: FallenMedia[]
}

export type FallenAwardWithDetails = FallenAward & {
  award: Award
}

// Filter types для поиска
export type FallenFilters = {
  search?: string
  hometown?: string
  year?: number
  status?: Fallen['status']
}

// Pagination
export type PaginatedResponse<T> = {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// Admin Moderation Types
export type FallenForModeration = Fallen & {
  owner: {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    avatar_url: string | null
  }
  days_in_queue: number
  priority: 'normal' | 'high' | 'urgent'
}

export type ModerationAction = {
  cardId: string
  action: 'approve' | 'reject'
  moderationNote?: string
}

export type ModerationStats = {
  total_pending: number
  urgent_pending: number
  approved_today: number
  approved_this_week: number
  rejected_this_week: number
  avg_moderation_time_hours: number | null
}

export type ModerationResponse = {
  success: boolean
  message: string
  card_id: string
  new_status: string | null
}
