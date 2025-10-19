import { Database } from './database.types'

// Типы таблиц
export type User = Database['public']['Tables']['users']['Row']
export type Fallen = Database['public']['Tables']['fallen']['Row']
export type TimelineItem = Database['public']['Tables']['timeline_items']['Row']
export type MemoryItem = Database['public']['Tables']['memory_items']['Row']
export type FallenMedia = Database['public']['Tables']['fallen_media']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Location = Database['public']['Tables']['locations']['Row']

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
