export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      awards: {
        Row: {
          award_type: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          name: string
          short_name: string | null
          sort_order: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          award_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          name: string
          short_name?: string | null
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          award_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          name?: string
          short_name?: string | null
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      candle_lights: {
        Row: {
          created_at: string | null
          fallen_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fallen_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          fallen_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candle_lights_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candle_lights_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "fallen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candle_lights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "candle_lights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          fallen_id: string | null
          hidden_at: string | null
          hidden_by: string | null
          hidden_reason: string | null
          id: string
          is_deleted: boolean | null
          is_hidden: boolean | null
          memory_addition_id: string | null
          memory_item_id: string | null
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          fallen_id?: string | null
          hidden_at?: string | null
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          is_deleted?: boolean | null
          is_hidden?: boolean | null
          memory_addition_id?: string | null
          memory_item_id?: string | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          fallen_id?: string | null
          hidden_at?: string | null
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          is_deleted?: boolean | null
          is_hidden?: boolean | null
          memory_addition_id?: string | null
          memory_item_id?: string | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "comments_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "fallen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_hidden_by_fkey"
            columns: ["hidden_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "comments_hidden_by_fkey"
            columns: ["hidden_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_memory_addition_id_fkey"
            columns: ["memory_addition_id"]
            isOneToOne: false
            referencedRelation: "memory_additions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_memory_item_id_fkey"
            columns: ["memory_item_id"]
            isOneToOne: false
            referencedRelation: "memory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      editors: {
        Row: {
          deleted_at: string | null
          deleted_by: string | null
          fallen_id: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_deleted: boolean | null
          user_id: string
        }
        Insert: {
          deleted_at?: string | null
          deleted_by?: string | null
          fallen_id: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_deleted?: boolean | null
          user_id: string
        }
        Update: {
          deleted_at?: string | null
          deleted_by?: string | null
          fallen_id?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_deleted?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "editors_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "editors_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editors_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editors_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "fallen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editors_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "editors_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "editors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fallen: {
        Row: {
          biography_md: string | null
          birth_date: string | null
          burial_location: string | null
          created_at: string | null
          death_date: string | null
          deleted_at: string | null
          deleted_by: string | null
          editors: string[] | null
          first_name: string
          hero_photo_url: string | null
          hometown: string | null
          id: string
          is_deleted: boolean | null
          is_demo: boolean | null
          last_name: string
          memorial_text: string | null
          middle_name: string | null
          military_unit: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          owner_id: string
          proof_document_url: string | null
          rank: string | null
          relationship: string | null
          service_end_date: string | null
          service_start_date: string | null
          service_type: Database["public"]["Enums"]["service_type_enum"] | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          biography_md?: string | null
          birth_date?: string | null
          burial_location?: string | null
          created_at?: string | null
          death_date?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          editors?: string[] | null
          first_name: string
          hero_photo_url?: string | null
          hometown?: string | null
          id?: string
          is_deleted?: boolean | null
          is_demo?: boolean | null
          last_name: string
          memorial_text?: string | null
          middle_name?: string | null
          military_unit?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          owner_id: string
          proof_document_url?: string | null
          rank?: string | null
          relationship?: string | null
          service_end_date?: string | null
          service_start_date?: string | null
          service_type?: Database["public"]["Enums"]["service_type_enum"] | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          biography_md?: string | null
          birth_date?: string | null
          burial_location?: string | null
          created_at?: string | null
          death_date?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          editors?: string[] | null
          first_name?: string
          hero_photo_url?: string | null
          hometown?: string | null
          id?: string
          is_deleted?: boolean | null
          is_demo?: boolean | null
          last_name?: string
          memorial_text?: string | null
          middle_name?: string | null
          military_unit?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          owner_id?: string
          proof_document_url?: string | null
          rank?: string | null
          relationship?: string | null
          service_end_date?: string | null
          service_start_date?: string | null
          service_type?: Database["public"]["Enums"]["service_type_enum"] | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fallen_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "fallen_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallen_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "fallen_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallen_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "fallen_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fallen_awards: {
        Row: {
          award_id: string
          awarded_date: string | null
          citation: string | null
          created_at: string | null
          created_by: string
          decree_number: string | null
          deleted_at: string | null
          deleted_by: string | null
          fallen_id: string
          id: string
          is_deleted: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          award_id: string
          awarded_date?: string | null
          citation?: string | null
          created_at?: string | null
          created_by: string
          decree_number?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          fallen_id: string
          id?: string
          is_deleted?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          award_id?: string
          awarded_date?: string | null
          citation?: string | null
          created_at?: string | null
          created_by?: string
          decree_number?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          fallen_id?: string
          id?: string
          is_deleted?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fallen_awards_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallen_awards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "fallen_awards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallen_awards_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "fallen_awards_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallen_awards_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallen_awards_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "fallen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallen_awards_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "fallen_awards_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fallen_media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          fallen_id: string
          file_size: number | null
          file_url: string
          height: number | null
          id: string
          is_deleted: boolean | null
          media_type: string
          mime_type: string | null
          status: string | null
          thumbnail_url: string | null
          uploaded_by: string
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          fallen_id: string
          file_size?: number | null
          file_url: string
          height?: number | null
          id?: string
          is_deleted?: boolean | null
          media_type: string
          mime_type?: string | null
          status?: string | null
          thumbnail_url?: string | null
          uploaded_by: string
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          fallen_id?: string
          file_size?: number | null
          file_url?: string
          height?: number | null
          id?: string
          is_deleted?: boolean | null
          media_type?: string
          mime_type?: string | null
          status?: string | null
          thumbnail_url?: string | null
          uploaded_by?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fallen_media_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "fallen_media_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallen_media_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallen_media_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "fallen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallen_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "fallen_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_connections: {
        Row: {
          connection_type: string
          created_at: string | null
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          fallen_id: string
          id: string
          is_deleted: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          relationship: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connection_type: string
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          fallen_id: string
          id?: string
          is_deleted?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          relationship?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connection_type?: string
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          fallen_id?: string
          id?: string
          is_deleted?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          relationship?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_connections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "hero_connections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_connections_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "hero_connections_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_connections_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_connections_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "fallen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_connections_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "hero_connections_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "hero_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          fallen_id: string | null
          id: string
          is_deleted: boolean | null
          latitude: number
          location_type: string
          longitude: number
          photo_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          fallen_id?: string | null
          id?: string
          is_deleted?: boolean | null
          latitude: number
          location_type: string
          longitude: number
          photo_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          fallen_id?: string | null
          id?: string
          is_deleted?: boolean | null
          latitude?: number
          location_type?: string
          longitude?: number
          photo_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "locations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "locations_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "fallen"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_additions: {
        Row: {
          content_md: string
          created_at: string | null
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_deleted: boolean | null
          media_ids: string[] | null
          memory_item_id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          content_md: string
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean | null
          media_ids?: string[] | null
          memory_item_id: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          content_md?: string
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_deleted?: boolean | null
          media_ids?: string[] | null
          memory_item_id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_additions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "memory_additions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_additions_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "memory_additions_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_additions_memory_item_id_fkey"
            columns: ["memory_item_id"]
            isOneToOne: false
            referencedRelation: "memory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_additions_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "memory_additions_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_items: {
        Row: {
          content_md: string | null
          created_at: string | null
          created_by: string
          deleted_at: string | null
          deleted_by: string | null
          fallen_id: string
          id: string
          is_deleted: boolean | null
          media_ids: string[] | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content_md?: string | null
          created_at?: string | null
          created_by: string
          deleted_at?: string | null
          deleted_by?: string | null
          fallen_id: string
          id?: string
          is_deleted?: boolean | null
          media_ids?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content_md?: string | null
          created_at?: string | null
          created_by?: string
          deleted_at?: string | null
          deleted_by?: string | null
          fallen_id?: string
          id?: string
          is_deleted?: boolean | null
          media_ids?: string[] | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "memory_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_items_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "memory_items_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_items_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_items_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "fallen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_items_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "memory_items_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_queue: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "moderation_queue_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_queue_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "moderation_queue_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          message: string
          metadata: Json | null
          sent_at: string | null
          status: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          message: string
          metadata?: Json | null
          sent_at?: string | null
          status?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          sent_at?: string | null
          status?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          country_code: string
          created_at: string | null
          district: string | null
          feature_class: string | null
          feature_code: string | null
          geonameid: number | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          name_alt: string[] | null
          name_ru: string | null
          population: number | null
          region: string | null
          updated_at: string | null
        }
        Insert: {
          country_code: string
          created_at?: string | null
          district?: string | null
          feature_class?: string | null
          feature_code?: string | null
          geonameid?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          name_alt?: string[] | null
          name_ru?: string | null
          population?: number | null
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          district?: string | null
          feature_class?: string | null
          feature_code?: string | null
          geonameid?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_alt?: string[] | null
          name_ru?: string | null
          population?: number | null
          region?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      timeline_items: {
        Row: {
          audit_diff: Json | null
          created_at: string | null
          created_by: string
          date_exact: string | null
          deleted_at: string | null
          deleted_by: string | null
          description_md: string | null
          fallen_id: string
          id: string
          is_deleted: boolean | null
          media_id: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          status: string | null
          title: string
          updated_at: string | null
          year: number | null
        }
        Insert: {
          audit_diff?: Json | null
          created_at?: string | null
          created_by: string
          date_exact?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description_md?: string | null
          fallen_id: string
          id?: string
          is_deleted?: boolean | null
          media_id?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          audit_diff?: Json | null
          created_at?: string | null
          created_by?: string
          date_exact?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description_md?: string | null
          fallen_id?: string
          id?: string
          is_deleted?: boolean | null
          media_id?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "timeline_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "timeline_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_items_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "timeline_items_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_items_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_items_fallen_id_fkey"
            columns: ["fallen_id"]
            isOneToOne: false
            referencedRelation: "fallen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_items_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "fallen_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_items_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "timeline_items_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string | null
          email_verified: boolean | null
          full_name: string
          id: string
          is_deleted: boolean | null
          notification_email: boolean | null
          notification_preferences: Json | null
          notification_telegram: boolean | null
          phone: string | null
          role: string | null
          show_phone: boolean | null
          show_telegram: boolean | null
          show_vk: boolean | null
          show_whatsapp: boolean | null
          telegram_chat_id: number | null
          telegram_link: string | null
          telegram_username: string | null
          updated_at: string | null
          vk_access_token: string | null
          vk_id: number | null
          vk_link: string | null
          vk_profile_url: string | null
          whatsapp_link: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name: string
          id?: string
          is_deleted?: boolean | null
          notification_email?: boolean | null
          notification_preferences?: Json | null
          notification_telegram?: boolean | null
          phone?: string | null
          role?: string | null
          show_phone?: boolean | null
          show_telegram?: boolean | null
          show_vk?: boolean | null
          show_whatsapp?: boolean | null
          telegram_chat_id?: number | null
          telegram_link?: string | null
          telegram_username?: string | null
          updated_at?: string | null
          vk_access_token?: string | null
          vk_id?: number | null
          vk_link?: string | null
          vk_profile_url?: string | null
          whatsapp_link?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string | null
          email_verified?: boolean | null
          full_name?: string
          id?: string
          is_deleted?: boolean | null
          notification_email?: boolean | null
          notification_preferences?: Json | null
          notification_telegram?: boolean | null
          phone?: string | null
          role?: string | null
          show_phone?: boolean | null
          show_telegram?: boolean | null
          show_vk?: boolean | null
          show_whatsapp?: boolean | null
          telegram_chat_id?: number | null
          telegram_link?: string | null
          telegram_username?: string | null
          updated_at?: string | null
          vk_access_token?: string | null
          vk_id?: number | null
          vk_link?: string | null
          vk_profile_url?: string | null
          whatsapp_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "admin_moderation_cards"
            referencedColumns: ["owner_id"]
          },
          {
            foreignKeyName: "users_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_moderation_cards: {
        Row: {
          biography_md: string | null
          birth_date: string | null
          burial_location: string | null
          created_at: string | null
          days_in_queue: number | null
          death_date: string | null
          first_name: string | null
          hero_photo_url: string | null
          hometown: string | null
          id: string | null
          last_name: string | null
          memorial_text: string | null
          middle_name: string | null
          military_unit: string | null
          owner_avatar_url: string | null
          owner_email: string | null
          owner_id: string | null
          owner_name: string | null
          owner_phone: string | null
          priority: string | null
          proof_document_url: string | null
          rank: string | null
          relationship: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_moderation_stats: {
        Args: never
        Returns: {
          approved_this_week: number
          approved_today: number
          avg_moderation_time_hours: number
          rejected_this_week: number
          total_pending: number
          urgent_pending: number
        }[]
      }
      has_admin_role: { Args: { _user_id: string }; Returns: boolean }
      is_fallen_editor: {
        Args: { _fallen_id: string; _user_id: string }
        Returns: boolean
      }
      is_fallen_owner: {
        Args: { _fallen_id: string; _user_id: string }
        Returns: boolean
      }
      moderate_fallen_card: {
        Args: {
          p_action: string
          p_card_id: string
          p_moderation_note?: string
          p_moderator_id?: string
        }
        Returns: {
          card_id: string
          message: string
          new_status: string
          success: boolean
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      soft_delete_comment: {
        Args: { p_comment_id: string; p_user_id: string }
        Returns: boolean
      }
      soft_delete_memory_addition: {
        Args: { p_addition_id: string; p_user_id: string }
        Returns: boolean
      }
      soft_delete_memory_item: {
        Args: { p_memory_id: string; p_user_id: string }
        Returns: boolean
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      service_type_enum: "mobilized" | "volunteer" | "pmc" | "professional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      service_type_enum: ["mobilized", "volunteer", "pmc", "professional"],
    },
  },
} as const

