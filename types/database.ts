export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      analytics_events: {
        Row: {
          channel: string;
          created_at: string;
          event_name: string;
          id: string;
          occurred_at: string;
          payload: Json;
          product_id: string | null;
          product_type: string | null;
          public_aggregate: boolean;
          route_category: string | null;
          route_template: string | null;
          source: string | null;
          user_id: string | null;
        };
        Insert: {
          channel: string;
          created_at?: string;
          event_name: string;
          id?: string;
          occurred_at?: string;
          payload?: Json;
          product_id?: string | null;
          product_type?: string | null;
          public_aggregate?: boolean;
          route_category?: string | null;
          route_template?: string | null;
          source?: string | null;
          user_id?: string | null;
        };
        Update: {
          channel?: string;
          created_at?: string;
          event_name?: string;
          id?: string;
          occurred_at?: string;
          payload?: Json;
          product_id?: string | null;
          product_type?: string | null;
          public_aggregate?: boolean;
          route_category?: string | null;
          route_template?: string | null;
          source?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_audit_logs: {
        Row: {
          action: string;
          actor_email: string | null;
          actor_user_id: string | null;
          after: Json | null;
          before: Json | null;
          created_at: string;
          entity_id: string | null;
          entity_table: string;
          id: string;
        };
        Insert: {
          action: string;
          actor_email?: string | null;
          actor_user_id?: string | null;
          after?: Json | null;
          before?: Json | null;
          created_at?: string;
          entity_id?: string | null;
          entity_table: string;
          id?: string;
        };
        Update: {
          action?: string;
          actor_email?: string | null;
          actor_user_id?: string | null;
          after?: Json | null;
          before?: Json | null;
          created_at?: string;
          entity_id?: string | null;
          entity_table?: string;
          id?: string;
        };
        Relationships: [];
      };
      admin_categories: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          is_active: boolean;
          scope: string;
          slug: string;
          sort_order: number;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_active?: boolean;
          scope: string;
          slug: string;
          sort_order?: number;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_active?: boolean;
          scope?: string;
          slug?: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      admin_content_items: {
        Row: {
          body: Json;
          category: string;
          content_type: Database["public"]["Enums"]["admin_content_type"];
          created_at: string;
          created_by: string | null;
          id: string;
          parent_id: string | null;
          published_at: string | null;
          slug: string;
          sort_order: number;
          status: Database["public"]["Enums"]["admin_content_status"];
          summary: string;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          body?: Json;
          category?: string;
          content_type: Database["public"]["Enums"]["admin_content_type"];
          created_at?: string;
          created_by?: string | null;
          id?: string;
          parent_id?: string | null;
          published_at?: string | null;
          slug: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["admin_content_status"];
          summary?: string;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          body?: Json;
          category?: string;
          content_type?: Database["public"]["Enums"]["admin_content_type"];
          created_at?: string;
          created_by?: string | null;
          id?: string;
          parent_id?: string | null;
          published_at?: string | null;
          slug?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["admin_content_status"];
          summary?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "admin_content_items_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "admin_content_items";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_content_revisions: {
        Row: {
          action: string;
          changed_by: string | null;
          changed_by_email: string | null;
          content_item_id: string;
          content_slug: string;
          created_at: string;
          id: string;
          revision_number: number;
          snapshot: Json;
        };
        Insert: {
          action: string;
          changed_by?: string | null;
          changed_by_email?: string | null;
          content_item_id: string;
          content_slug: string;
          created_at?: string;
          id?: string;
          revision_number: number;
          snapshot: Json;
        };
        Update: {
          action?: string;
          changed_by?: string | null;
          changed_by_email?: string | null;
          content_item_id?: string;
          content_slug?: string;
          created_at?: string;
          id?: string;
          revision_number?: number;
          snapshot?: Json;
        };
        Relationships: [];
      };
      admin_email_template_revisions: {
        Row: {
          action: string;
          changed_by: string | null;
          changed_by_email: string | null;
          created_at: string;
          id: string;
          locale: string;
          revision_number: number;
          snapshot: Json;
          template_id: string;
          template_key: string;
        };
        Insert: {
          action: string;
          changed_by?: string | null;
          changed_by_email?: string | null;
          created_at?: string;
          id?: string;
          locale: string;
          revision_number: number;
          snapshot: Json;
          template_id: string;
          template_key: string;
        };
        Update: {
          action?: string;
          changed_by?: string | null;
          changed_by_email?: string | null;
          created_at?: string;
          id?: string;
          locale?: string;
          revision_number?: number;
          snapshot?: Json;
          template_id?: string;
          template_key?: string;
        };
        Relationships: [];
      };
      admin_email_templates: {
        Row: {
          body: string;
          created_at: string;
          created_by: string | null;
          id: string;
          last_published_at: string | null;
          last_published_by: string | null;
          locale: string;
          optional_placeholders: string[];
          required_placeholders: string[];
          status: Database["public"]["Enums"]["admin_email_template_status"];
          subject: string;
          template_key: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          body?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          last_published_at?: string | null;
          last_published_by?: string | null;
          locale?: string;
          optional_placeholders?: string[];
          required_placeholders?: string[];
          status?: Database["public"]["Enums"]["admin_email_template_status"];
          subject?: string;
          template_key: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          body?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          last_published_at?: string | null;
          last_published_by?: string | null;
          locale?: string;
          optional_placeholders?: string[];
          required_placeholders?: string[];
          status?: Database["public"]["Enums"]["admin_email_template_status"];
          subject?: string;
          template_key?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [];
      };
      admin_message_delivery_attempts: {
        Row: {
          attempt_metadata: Json;
          created_at: string;
          error_code: Database["public"]["Enums"]["admin_message_delivery_error_code"] | null;
          id: string;
          message_id: string;
          provider_key: Database["public"]["Enums"]["admin_message_delivery_provider"];
          provider_message_id: string | null;
          redacted_error_message: string | null;
          reply_id: string | null;
          retry_after_seconds: number | null;
          status: Database["public"]["Enums"]["admin_message_delivery_status"];
          target: Database["public"]["Enums"]["admin_message_delivery_target"];
          updated_at: string;
        };
        Insert: {
          attempt_metadata?: Json;
          created_at?: string;
          error_code?: Database["public"]["Enums"]["admin_message_delivery_error_code"] | null;
          id?: string;
          message_id: string;
          provider_key?: Database["public"]["Enums"]["admin_message_delivery_provider"];
          provider_message_id?: string | null;
          redacted_error_message?: string | null;
          reply_id?: string | null;
          retry_after_seconds?: number | null;
          status?: Database["public"]["Enums"]["admin_message_delivery_status"];
          target: Database["public"]["Enums"]["admin_message_delivery_target"];
          updated_at?: string;
        };
        Update: {
          attempt_metadata?: Json;
          created_at?: string;
          error_code?: Database["public"]["Enums"]["admin_message_delivery_error_code"] | null;
          id?: string;
          message_id?: string;
          provider_key?: Database["public"]["Enums"]["admin_message_delivery_provider"];
          provider_message_id?: string | null;
          redacted_error_message?: string | null;
          reply_id?: string | null;
          retry_after_seconds?: number | null;
          status?: Database["public"]["Enums"]["admin_message_delivery_status"];
          target?: Database["public"]["Enums"]["admin_message_delivery_target"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_message_delivery_attempts_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "admin_messages";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_messages: {
        Row: {
          created_at: string;
          id: string;
          message_body: string;
          notification_error_code:
            | Database["public"]["Enums"]["admin_message_delivery_error_code"]
            | null;
          notification_status: Database["public"]["Enums"]["admin_message_delivery_status"];
          request_metadata: Json;
          source_variant: Database["public"]["Enums"]["admin_message_source"];
          status: Database["public"]["Enums"]["admin_message_status"];
          structured_intake: Json;
          submitter_email: string;
          submitter_name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message_body?: string;
          notification_error_code?:
            | Database["public"]["Enums"]["admin_message_delivery_error_code"]
            | null;
          notification_status?: Database["public"]["Enums"]["admin_message_delivery_status"];
          request_metadata?: Json;
          source_variant: Database["public"]["Enums"]["admin_message_source"];
          status?: Database["public"]["Enums"]["admin_message_status"];
          structured_intake?: Json;
          submitter_email: string;
          submitter_name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message_body?: string;
          notification_error_code?:
            | Database["public"]["Enums"]["admin_message_delivery_error_code"]
            | null;
          notification_status?: Database["public"]["Enums"]["admin_message_delivery_status"];
          request_metadata?: Json;
          source_variant?: Database["public"]["Enums"]["admin_message_source"];
          status?: Database["public"]["Enums"]["admin_message_status"];
          structured_intake?: Json;
          submitter_email?: string;
          submitter_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_note_attachments: {
        Row: {
          created_at: string;
          created_by: string | null;
          file_name: string;
          id: string;
          mime_type: string;
          note_id: string;
          size_bytes: number;
          storage_path: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          file_name: string;
          id?: string;
          mime_type: string;
          note_id: string;
          size_bytes: number;
          storage_path: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          file_name?: string;
          id?: string;
          mime_type?: string;
          note_id?: string;
          size_bytes?: number;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_note_attachments_note_id_fkey";
            columns: ["note_id"];
            isOneToOne: false;
            referencedRelation: "admin_notes";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_note_links: {
        Row: {
          created_at: string;
          created_by: string | null;
          note_id: string;
          related_note_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          note_id: string;
          related_note_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          note_id?: string;
          related_note_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_note_links_note_id_fkey";
            columns: ["note_id"];
            isOneToOne: false;
            referencedRelation: "admin_notes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_note_links_related_note_id_fkey";
            columns: ["related_note_id"];
            isOneToOne: false;
            referencedRelation: "admin_notes";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_notes: {
        Row: {
          body: string;
          category: string;
          context_ref: string | null;
          context_type: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          is_done: boolean;
          note_date: string;
          priority: string;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          body?: string;
          category?: string;
          context_ref?: string | null;
          context_type?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_done?: boolean;
          note_date?: string;
          priority?: string;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          body?: string;
          category?: string;
          context_ref?: string | null;
          context_type?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_done?: boolean;
          note_date?: string;
          priority?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      admin_runtime_flags: {
        Row: {
          description: string;
          enabled: boolean;
          is_public: boolean;
          key: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          description?: string;
          enabled?: boolean;
          is_public?: boolean;
          key: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          description?: string;
          enabled?: boolean;
          is_public?: boolean;
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      athlete_profiles: {
        Row: {
          age_band: string | null;
          created_at: string;
          display_name: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          age_band?: string | null;
          created_at?: string;
          display_name?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          age_band?: string | null;
          created_at?: string;
          display_name?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      course_progress: {
        Row: {
          done: boolean;
          done_confirmed_at: string | null;
          lesson_id: string;
          updated_at: string;
          user_id: string;
          video_seconds: number;
        };
        Insert: {
          done?: boolean;
          done_confirmed_at?: string | null;
          lesson_id: string;
          updated_at?: string;
          user_id: string;
          video_seconds?: number;
        };
        Update: {
          done?: boolean;
          done_confirmed_at?: string | null;
          lesson_id?: string;
          updated_at?: string;
          user_id?: string;
          video_seconds?: number;
        };
        Relationships: [];
      };
      download_links: {
        Row: {
          created_at: string;
          entitlement_id: string;
          expires_at: string;
          id: string;
          token_hash: string;
          used_at: string | null;
        };
        Insert: {
          created_at?: string;
          entitlement_id: string;
          expires_at: string;
          id?: string;
          token_hash: string;
          used_at?: string | null;
        };
        Update: {
          created_at?: string;
          entitlement_id?: string;
          expires_at?: string;
          id?: string;
          token_hash?: string;
          used_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "download_links_entitlement_id_fkey";
            columns: ["entitlement_id"];
            isOneToOne: false;
            referencedRelation: "entitlements";
            referencedColumns: ["id"];
          },
        ];
      };
      dryland_micro_plans: {
        Row: {
          blocks: Json;
          created_at: string;
          id: string;
          session_kind: string;
          source_dryland_session_id: string | null;
          source_session_title: string;
          status: string;
          timezone: string;
          title: string;
          updated_at: string;
          user_id: string;
          week_ends_at: string;
          week_starts_at: string;
        };
        Insert: {
          blocks?: Json;
          created_at?: string;
          id?: string;
          session_kind: string;
          source_dryland_session_id?: string | null;
          source_session_title: string;
          status: string;
          timezone?: string;
          title: string;
          updated_at?: string;
          user_id: string;
          week_ends_at: string;
          week_starts_at: string;
        };
        Update: {
          blocks?: Json;
          created_at?: string;
          id?: string;
          session_kind?: string;
          source_dryland_session_id?: string | null;
          source_session_title?: string;
          status?: string;
          timezone?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          week_ends_at?: string;
          week_starts_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dryland_micro_plans_source_dryland_session_id_fkey";
            columns: ["source_dryland_session_id"];
            isOneToOne: false;
            referencedRelation: "dryland_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      dryland_sessions: {
        Row: {
          actual_duration_seconds: number | null;
          completed_at: string | null;
          created_at: string;
          description: string;
          exercises: Json;
          focus_text: string | null;
          id: string;
          session_kind: string;
          source_kind: string;
          started_at: string | null;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          actual_duration_seconds?: number | null;
          completed_at?: string | null;
          created_at?: string;
          description?: string;
          exercises?: Json;
          focus_text?: string | null;
          id?: string;
          session_kind: string;
          source_kind: string;
          started_at?: string | null;
          status: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          actual_duration_seconds?: number | null;
          completed_at?: string | null;
          created_at?: string;
          description?: string;
          exercises?: Json;
          focus_text?: string | null;
          id?: string;
          session_kind?: string;
          source_kind?: string;
          started_at?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      entitlements: {
        Row: {
          created_at: string;
          granted_at: string;
          id: string;
          product_id: string;
          purchaser_email: string;
          source: string;
          stripe_checkout_session_id: string;
          stripe_customer_id: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          granted_at?: string;
          id?: string;
          product_id: string;
          purchaser_email: string;
          source?: string;
          stripe_checkout_session_id: string;
          stripe_customer_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          granted_at?: string;
          id?: string;
          product_id?: string;
          purchaser_email?: string;
          source?: string;
          stripe_checkout_session_id?: string;
          stripe_customer_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "entitlements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      goals: {
        Row: {
          achieved_at: string | null;
          celebrated_at: string | null;
          created_at: string;
          goal_type: string;
          id: string;
          progress_value: number;
          source: string;
          status: string;
          target_count: number | null;
          target_date: string | null;
          target_distance_m: number | null;
          target_ref: string | null;
          target_time_seconds: number | null;
          target_unit: string;
          target_value: number | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          achieved_at?: string | null;
          celebrated_at?: string | null;
          created_at?: string;
          goal_type?: string;
          id?: string;
          progress_value?: number;
          source?: string;
          status?: string;
          target_count?: number | null;
          target_date?: string | null;
          target_distance_m?: number | null;
          target_ref?: string | null;
          target_time_seconds?: number | null;
          target_unit: string;
          target_value?: number | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          achieved_at?: string | null;
          celebrated_at?: string | null;
          created_at?: string;
          goal_type?: string;
          id?: string;
          progress_value?: number;
          source?: string;
          status?: string;
          target_count?: number | null;
          target_date?: string | null;
          target_distance_m?: number | null;
          target_ref?: string | null;
          target_time_seconds?: number | null;
          target_unit?: string;
          target_value?: number | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      habit_check_ins: {
        Row: {
          check_in_date: string;
          completed_at: string | null;
          created_at: string;
          habit_id: string;
          id: string;
          manual_minutes: number;
          note: string | null;
          source_completed_at: string | null;
          source_dryland_micro_plan_id: string | null;
          source_kind: string;
          source_micro_block_id: string | null;
          status: string;
          timezone: string;
          timer_seconds: number;
          updated_at: string;
          user_id: string;
          value_boolean: boolean | null;
          value_numeric: number | null;
          value_time: string | null;
        };
        Insert: {
          check_in_date: string;
          completed_at?: string | null;
          created_at?: string;
          habit_id: string;
          id?: string;
          manual_minutes?: number;
          note?: string | null;
          source_completed_at?: string | null;
          source_dryland_micro_plan_id?: string | null;
          source_kind?: string;
          source_micro_block_id?: string | null;
          status?: string;
          timezone?: string;
          timer_seconds?: number;
          updated_at?: string;
          user_id: string;
          value_boolean?: boolean | null;
          value_numeric?: number | null;
          value_time?: string | null;
        };
        Update: {
          check_in_date?: string;
          completed_at?: string | null;
          created_at?: string;
          habit_id?: string;
          id?: string;
          manual_minutes?: number;
          note?: string | null;
          source_completed_at?: string | null;
          source_dryland_micro_plan_id?: string | null;
          source_kind?: string;
          source_micro_block_id?: string | null;
          status?: string;
          timezone?: string;
          timer_seconds?: number;
          updated_at?: string;
          user_id?: string;
          value_boolean?: boolean | null;
          value_numeric?: number | null;
          value_time?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "habit_check_ins_habit_owner_fkey";
            columns: ["habit_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "habit_definitions";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      habit_definitions: {
        Row: {
          cadence_day_policy: string;
          cadence_period: string;
          cadence_target_count: number;
          category: string;
          created_at: string;
          habit_mode: string;
          habit_type: string;
          id: string;
          is_perfect_day_item: boolean;
          last_lapse_date: string | null;
          notes: string | null;
          schedule_days: string[];
          sort_order: number;
          start_date: string;
          status: string;
          timer_enabled: boolean;
          timer_target_seconds: number | null;
          target_operator: string;
          target_time: string | null;
          target_unit: string | null;
          target_value_numeric: number | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cadence_day_policy?: string;
          cadence_period?: string;
          cadence_target_count?: number;
          category?: string;
          created_at?: string;
          habit_mode?: string;
          habit_type: string;
          id?: string;
          is_perfect_day_item?: boolean;
          last_lapse_date?: string | null;
          notes?: string | null;
          schedule_days?: string[];
          sort_order?: number;
          start_date?: string;
          status?: string;
          timer_enabled?: boolean;
          timer_target_seconds?: number | null;
          target_operator: string;
          target_time?: string | null;
          target_unit?: string | null;
          target_value_numeric?: number | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cadence_day_policy?: string;
          cadence_period?: string;
          cadence_target_count?: number;
          category?: string;
          created_at?: string;
          habit_mode?: string;
          habit_type?: string;
          id?: string;
          is_perfect_day_item?: boolean;
          last_lapse_date?: string | null;
          notes?: string | null;
          schedule_days?: string[];
          sort_order?: number;
          start_date?: string;
          status?: string;
          timer_enabled?: boolean;
          timer_target_seconds?: number | null;
          target_operator?: string;
          target_time?: string | null;
          target_unit?: string | null;
          target_value_numeric?: number | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      habit_motivation_resets: {
        Row: {
          created_at: string;
          created_by: string;
          effective_date: string;
          habit_id: string;
          id: string;
          reset_type: string;
          status: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          effective_date: string;
          habit_id: string;
          id?: string;
          reset_type?: string;
          status?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          effective_date?: string;
          habit_id?: string;
          id?: string;
          reset_type?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "habit_motivation_resets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "habit_motivation_resets_habit_owner_fkey";
            columns: ["habit_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "habit_definitions";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "habit_motivation_resets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      micro_session_habit_links: {
        Row: {
          created_at: string;
          dryland_micro_plan_id: string;
          ended_at: string | null;
          habit_id: string;
          id: string;
          paused_at: string | null;
          resumed_at: string | null;
          starts_on: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          dryland_micro_plan_id: string;
          ended_at?: string | null;
          habit_id: string;
          id?: string;
          paused_at?: string | null;
          resumed_at?: string | null;
          starts_on: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          dryland_micro_plan_id?: string;
          ended_at?: string | null;
          habit_id?: string;
          id?: string;
          paused_at?: string | null;
          resumed_at?: string | null;
          starts_on?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "micro_session_habit_links_habit_owner_fkey";
            columns: ["habit_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "habit_definitions";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "micro_session_habit_links_plan_owner_fkey";
            columns: ["dryland_micro_plan_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "dryland_micro_plans";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      guide_progress: {
        Row: {
          completed: boolean;
          guide_slug: string;
          notes: string;
          section_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed?: boolean;
          guide_slug: string;
          notes?: string;
          section_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed?: boolean;
          guide_slug?: string;
          notes?: string;
          section_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      guide_session_progress: {
        Row: {
          completed: boolean;
          completed_at: string | null;
          guide_slug: string;
          notes: string;
          session_number: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed?: boolean;
          completed_at?: string | null;
          guide_slug: string;
          notes?: string;
          session_number: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed?: boolean;
          completed_at?: string | null;
          guide_slug?: string;
          notes?: string;
          session_number?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guide_session_progress_guide_fk";
            columns: ["guide_slug", "session_number"];
            isOneToOne: false;
            referencedRelation: "guide_sessions";
            referencedColumns: ["guide_slug", "session_number"];
          },
        ];
      };
      guide_sessions: {
        Row: {
          created_at: string;
          description: string;
          guide_slug: string;
          session_number: number;
          title: string;
          updated_at: string;
          week_number: number;
        };
        Insert: {
          created_at?: string;
          description?: string;
          guide_slug: string;
          session_number: number;
          title: string;
          updated_at?: string;
          week_number: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          guide_slug?: string;
          session_number?: number;
          title?: string;
          updated_at?: string;
          week_number?: number;
        };
        Relationships: [];
      };
      personal_records: {
        Row: {
          course: string;
          created_at: string;
          distance_m: number;
          id: string;
          recorded_on: string | null;
          source_note: string | null;
          stroke: string;
          time_centiseconds: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          course: string;
          created_at?: string;
          distance_m: number;
          id?: string;
          recorded_on?: string | null;
          source_note?: string | null;
          stroke: string;
          time_centiseconds: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          course?: string;
          created_at?: string;
          distance_m?: number;
          id?: string;
          recorded_on?: string | null;
          source_note?: string | null;
          stroke?: string;
          time_centiseconds?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          kind: string;
          slug: string;
          stripe_price_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id: string;
          kind: string;
          slug: string;
          stripe_price_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          kind?: string;
          slug?: string;
          stripe_price_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          role: Database["public"]["Enums"]["admin_role"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id: string;
          role?: Database["public"]["Enums"]["admin_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          role?: Database["public"]["Enums"]["admin_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
      programs: {
        Row: {
          created_at: string;
          id: string;
          source_kind: string;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
          weeks: Json;
        };
        Insert: {
          created_at?: string;
          id?: string;
          source_kind: string;
          status: string;
          title: string;
          updated_at?: string;
          user_id: string;
          weeks: Json;
        };
        Update: {
          created_at?: string;
          id?: string;
          source_kind?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          weeks?: Json;
        };
        Relationships: [];
      };
      qr_redirect_links: {
        Row: {
          content_item_id: string | null;
          content_label: string;
          created_at: string;
          created_by: string | null;
          destination_url: string;
          id: string;
          last_resolved_at: string | null;
          owner_user_id: string | null;
          placement_key: string;
          slug: string;
          status: Database["public"]["Enums"]["qr_link_status"];
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          content_item_id?: string | null;
          content_label?: string;
          created_at?: string;
          created_by?: string | null;
          destination_url: string;
          id?: string;
          last_resolved_at?: string | null;
          owner_user_id?: string | null;
          placement_key?: string;
          slug: string;
          status?: Database["public"]["Enums"]["qr_link_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          content_item_id?: string | null;
          content_label?: string;
          created_at?: string;
          created_by?: string | null;
          destination_url?: string;
          id?: string;
          last_resolved_at?: string | null;
          owner_user_id?: string | null;
          placement_key?: string;
          slug?: string;
          status?: Database["public"]["Enums"]["qr_link_status"];
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "qr_redirect_links_content_item_id_fkey";
            columns: ["content_item_id"];
            isOneToOne: false;
            referencedRelation: "admin_content_items";
            referencedColumns: ["id"];
          },
        ];
      };
      swim_capability_limits: {
        Row: {
          created_at: string;
          id: string;
          limit_kind: string;
          max_repeat_distance_m: number | null;
          max_total_distance_m: number | null;
          stroke: string | null;
          target_total_distance_m: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          limit_kind: string;
          max_repeat_distance_m?: number | null;
          max_total_distance_m?: number | null;
          stroke?: string | null;
          target_total_distance_m?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          limit_kind?: string;
          max_repeat_distance_m?: number | null;
          max_total_distance_m?: number | null;
          stroke?: string | null;
          target_total_distance_m?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      training_focuses: {
        Row: {
          archived_at: string | null;
          completed_at: string | null;
          context_ref: string | null;
          context_type: string | null;
          created_at: string;
          details: string | null;
          goal_id: string | null;
          id: string;
          is_primary: boolean;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          archived_at?: string | null;
          completed_at?: string | null;
          context_ref?: string | null;
          context_type?: string | null;
          created_at?: string;
          details?: string | null;
          goal_id?: string | null;
          id?: string;
          is_primary?: boolean;
          status?: string;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          archived_at?: string | null;
          completed_at?: string | null;
          context_ref?: string | null;
          context_type?: string | null;
          created_at?: string;
          details?: string | null;
          goal_id?: string | null;
          id?: string;
          is_primary?: boolean;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "training_focuses_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
        ];
      };
      training_metrics: {
        Row: {
          created_at: string;
          id: string;
          metric_key: string;
          recorded_on: string | null;
          source_note: string | null;
          unit: string;
          updated_at: string;
          user_id: string;
          value_seconds: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metric_key: string;
          recorded_on?: string | null;
          source_note?: string | null;
          unit: string;
          updated_at?: string;
          user_id: string;
          value_seconds: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          metric_key?: string;
          recorded_on?: string | null;
          source_note?: string | null;
          unit?: string;
          updated_at?: string;
          user_id?: string;
          value_seconds?: number;
        };
        Relationships: [];
      };
      training_notes: {
        Row: {
          answer: string | null;
          body: string;
          context_ref: string | null;
          context_type: string | null;
          created_at: string;
          focus_id: string | null;
          goal_id: string | null;
          id: string;
          note_type: string;
          resolved_at: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          answer?: string | null;
          body: string;
          context_ref?: string | null;
          context_type?: string | null;
          created_at?: string;
          focus_id?: string | null;
          goal_id?: string | null;
          id?: string;
          note_type: string;
          resolved_at?: string | null;
          status: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          answer?: string | null;
          body?: string;
          context_ref?: string | null;
          context_type?: string | null;
          created_at?: string;
          focus_id?: string | null;
          goal_id?: string | null;
          id?: string;
          note_type?: string;
          resolved_at?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "training_notes_focus_id_fkey";
            columns: ["focus_id"];
            isOneToOne: false;
            referencedRelation: "training_focuses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "training_notes_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
        ];
      };
      training_preferences: {
        Row: {
          available_days: string[] | null;
          created_at: string;
          id: string;
          pool_length_m: number | null;
          preferred_session_minutes: number | null;
          preferred_weekly_session_count: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          available_days?: string[] | null;
          created_at?: string;
          id?: string;
          pool_length_m?: number | null;
          preferred_session_minutes?: number | null;
          preferred_weekly_session_count?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          available_days?: string[] | null;
          created_at?: string;
          id?: string;
          pool_length_m?: number | null;
          preferred_session_minutes?: number | null;
          preferred_weekly_session_count?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      workouts: {
        Row: {
          accepted_at: string;
          allowed_strokes: string[];
          base_pace_seconds_per_100: number;
          constraint_text: string | null;
          created_at: string;
          description: string;
          effort: string;
          environment: string;
          equipment_allowlist: string[];
          estimated_duration_min: number | null;
          focus_text: string | null;
          generated_at: string;
          generator_kind: string;
          goal_title: string | null;
          id: string;
          pool_length_m: number | null;
          pool_length_unit: string;
          session_type: string;
          size_mode: string;
          source_fingerprint: string;
          source_kind: string;
          status: string;
          steps: Json;
          target_distance_m: number | null;
          target_time_min: number | null;
          title: string;
          title_suggestions: string[];
          total_distance_m: number | null;
          updated_at: string;
          used_css_pace_label: string | null;
          user_id: string;
          warnings: string[];
        };
        Insert: {
          accepted_at?: string;
          allowed_strokes?: string[];
          base_pace_seconds_per_100: number;
          constraint_text?: string | null;
          created_at?: string;
          description?: string;
          effort: string;
          environment: string;
          equipment_allowlist?: string[];
          estimated_duration_min?: number | null;
          focus_text?: string | null;
          generated_at?: string;
          generator_kind: string;
          goal_title?: string | null;
          id?: string;
          pool_length_m?: number | null;
          pool_length_unit?: string;
          session_type: string;
          size_mode: string;
          source_fingerprint: string;
          source_kind: string;
          status: string;
          steps: Json;
          target_distance_m?: number | null;
          target_time_min?: number | null;
          title: string;
          title_suggestions?: string[];
          total_distance_m?: number | null;
          updated_at?: string;
          used_css_pace_label?: string | null;
          user_id: string;
          warnings?: string[];
        };
        Update: {
          accepted_at?: string;
          allowed_strokes?: string[];
          base_pace_seconds_per_100?: number;
          constraint_text?: string | null;
          created_at?: string;
          description?: string;
          effort?: string;
          environment?: string;
          equipment_allowlist?: string[];
          estimated_duration_min?: number | null;
          focus_text?: string | null;
          generated_at?: string;
          generator_kind?: string;
          goal_title?: string | null;
          id?: string;
          pool_length_m?: number | null;
          pool_length_unit?: string;
          session_type?: string;
          size_mode?: string;
          source_fingerprint?: string;
          source_kind?: string;
          status?: string;
          steps?: Json;
          target_distance_m?: number | null;
          target_time_min?: number | null;
          title?: string;
          title_suggestions?: string[];
          total_distance_m?: number | null;
          updated_at?: string;
          used_css_pace_label?: string | null;
          user_id?: string;
          warnings?: string[];
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      replace_swim_capability_limits: {
        Args: { p_limits: Json };
        Returns: undefined;
      };
      training_focus_set_primary: {
        Args: { p_focus_id: string };
        Returns: {
          archived_at: string | null;
          completed_at: string | null;
          context_ref: string | null;
          context_type: string | null;
          created_at: string;
          details: string | null;
          goal_id: string | null;
          id: string;
          is_primary: boolean;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "training_focuses";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      admin_content_status: "draft" | "published" | "review" | "archived";
      admin_content_type:
        | "course_module"
        | "course_lesson"
        | "guide_session"
        | "guide_drill"
        | "page"
        | "product";
      admin_email_template_status: "draft" | "review" | "published" | "archived";
      admin_message_delivery_error_code:
        | "provider_disabled"
        | "provider_invalid"
        | "provider_config_missing"
        | "payload_invalid"
        | "provider_timeout"
        | "provider_auth_failed"
        | "provider_rejected"
        | "provider_rate_limited"
        | "provider_request_failed"
        | "provider_response_invalid";
      admin_message_delivery_provider:
        | "smtp_one_com_compatible"
        | "resend_api"
        | "resend_smtp"
        | "disabled";
      admin_message_delivery_status:
        | "queued"
        | "accepted_by_provider"
        | "failed_retryable"
        | "failed_final"
        | "disabled";
      admin_message_delivery_target: "inbound_notification" | "admin_reply" | "system_notice";
      admin_message_source: "contact" | "preview_access_notify" | "analysis" | "goals_coaching";
      admin_message_status:
        | "new"
        | "triaged"
        | "archived"
        | "deleted"
        | "read"
        | "needs_reply"
        | "replied";
      admin_role: "admin" | "editor" | "viewer";
      qr_link_status: "draft" | "active" | "disabled" | "archived";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      admin_content_status: ["draft", "published", "review", "archived"],
      admin_content_type: [
        "course_module",
        "course_lesson",
        "guide_session",
        "guide_drill",
        "page",
        "product",
      ],
      admin_email_template_status: ["draft", "review", "published", "archived"],
      admin_message_delivery_error_code: [
        "provider_disabled",
        "provider_invalid",
        "provider_config_missing",
        "payload_invalid",
        "provider_timeout",
        "provider_auth_failed",
        "provider_rejected",
        "provider_rate_limited",
        "provider_request_failed",
        "provider_response_invalid",
      ],
      admin_message_delivery_provider: [
        "smtp_one_com_compatible",
        "resend_api",
        "resend_smtp",
        "disabled",
      ],
      admin_message_delivery_status: [
        "queued",
        "accepted_by_provider",
        "failed_retryable",
        "failed_final",
        "disabled",
      ],
      admin_message_delivery_target: ["inbound_notification", "admin_reply", "system_notice"],
      admin_message_source: ["contact", "preview_access_notify", "analysis", "goals_coaching"],
      admin_message_status: [
        "new",
        "triaged",
        "archived",
        "deleted",
        "read",
        "needs_reply",
        "replied",
      ],
      admin_role: ["admin", "editor", "viewer"],
      qr_link_status: ["draft", "active", "disabled", "archived"],
    },
  },
} as const;
