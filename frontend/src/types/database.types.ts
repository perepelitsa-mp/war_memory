/**
 * Database Types
 *
 * Эти типы соответствуют схеме PostgreSQL.
 * В будущем можно генерировать через: supabase gen types typescript
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          full_name: string
          phone: string | null
          avatar_url: string | null
          vk_id: number | null
          vk_access_token: string | null
          vk_profile_url: string | null
          role: 'superadmin' | 'admin' | 'moderator' | 'owner' | 'editor' | 'user' | 'guest'
          telegram_chat_id: number | null
          telegram_username: string | null
          email_verified: boolean
          notification_preferences: Json
          is_deleted: boolean
          deleted_at: string | null
          deleted_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      fallen: {
        Row: {
          id: string
          last_name: string
          first_name: string
          middle_name: string | null
          birth_date: string | null
          death_date: string | null
          military_unit: string | null
          rank: string | null
          hometown: string | null
          burial_location: string | null
          hero_photo_url: string | null
          memorial_text: string | null
          biography_md: string | null
          owner_id: string
          status: 'pending' | 'approved' | 'rejected' | 'archived' | 'blocked'
          is_demo: boolean
          moderated_by: string | null
          moderated_at: string | null
          moderation_note: string | null
          proof_document_url: string | null
          relationship: string | null
          is_deleted: boolean
          deleted_at: string | null
          deleted_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['fallen']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['fallen']['Insert']>
      }
      timeline_items: {
        Row: {
          id: string
          fallen_id: string
          date_exact: string | null
          year: number | null
          title: string
          description_md: string | null
          media_id: string | null
          status: 'pending' | 'approved' | 'rejected' | 'archived'
          moderated_by: string | null
          moderated_at: string | null
          moderation_note: string | null
          created_by: string
          audit_diff: Json | null
          is_deleted: boolean
          deleted_at: string | null
          deleted_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['timeline_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['timeline_items']['Insert']>
      }
      memory_items: {
        Row: {
          id: string
          fallen_id: string
          title: string
          content_md: string | null
          media_ids: string[] | null
          status: 'pending' | 'approved' | 'rejected' | 'archived'
          moderated_by: string | null
          moderated_at: string | null
          moderation_note: string | null
          created_by: string
          is_deleted: boolean
          deleted_at: string | null
          deleted_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['memory_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['memory_items']['Insert']>
      }
      fallen_media: {
        Row: {
          id: string
          fallen_id: string
          media_type: 'photo' | 'video'
          file_url: string
          thumbnail_url: string | null
          caption: string | null
          alt_text: string | null
          file_size: number | null
          mime_type: string | null
          width: number | null
          height: number | null
          status: 'pending' | 'approved' | 'rejected'
          uploaded_by: string
          is_deleted: boolean
          deleted_at: string | null
          deleted_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['fallen_media']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['fallen_media']['Insert']>
      }
      comments: {
        Row: {
          id: string
          fallen_id: string
          parent_id: string | null
          content: string
          author_id: string
          is_hidden: boolean
          hidden_by: string | null
          hidden_at: string | null
          hidden_reason: string | null
          is_deleted: boolean
          deleted_at: string | null
          deleted_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['comments']['Insert']>
      }
      locations: {
        Row: {
          id: string
          fallen_id: string | null
          location_type: 'burial' | 'monument' | 'memorial_plaque' | 'memorial_complex'
          title: string
          description: string | null
          latitude: number
          longitude: number
          address: string | null
          photo_url: string | null
          is_deleted: boolean
          deleted_at: string | null
          deleted_by: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['locations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['locations']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
