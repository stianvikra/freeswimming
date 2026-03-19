export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
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
        Relationships: [];
      };
      goals: {
        Row: {
          achieved_at: string | null;
          celebrated_at: string | null;
          created_at: string;
          goal_type:
            | "distance_time"
            | "distance_continuous"
            | "drill_complete"
            | "module_complete"
            | "custom";
          id: string;
          progress_value: number;
          source: "template" | "custom";
          status: "active" | "on_track" | "at_risk" | "achieved" | "archived";
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
          goal_type?:
            | "distance_time"
            | "distance_continuous"
            | "drill_complete"
            | "module_complete"
            | "custom";
          id?: string;
          progress_value?: number;
          source?: "template" | "custom";
          status?: "active" | "on_track" | "at_risk" | "achieved" | "archived";
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
          goal_type?:
            | "distance_time"
            | "distance_continuous"
            | "drill_complete"
            | "module_complete"
            | "custom";
          id?: string;
          progress_value?: number;
          source?: "template" | "custom";
          status?: "active" | "on_track" | "at_risk" | "achieved" | "archived";
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
      training_focuses: {
        Row: {
          archived_at: string | null;
          completed_at: string | null;
          context_ref: string | null;
          context_type:
            | "course_lesson"
            | "course_module"
            | "guide_drill"
            | "guide_session"
            | "workout_session"
            | "program"
            | null;
          created_at: string;
          details: string | null;
          goal_id: string | null;
          id: string;
          status: "active" | "completed" | "archived";
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          archived_at?: string | null;
          completed_at?: string | null;
          context_ref?: string | null;
          context_type?:
            | "course_lesson"
            | "course_module"
            | "guide_drill"
            | "guide_session"
            | "workout_session"
            | "program"
            | null;
          created_at?: string;
          details?: string | null;
          goal_id?: string | null;
          id?: string;
          status?: "active" | "completed" | "archived";
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          archived_at?: string | null;
          completed_at?: string | null;
          context_ref?: string | null;
          context_type?:
            | "course_lesson"
            | "course_module"
            | "guide_drill"
            | "guide_session"
            | "workout_session"
            | "program"
            | null;
          created_at?: string;
          details?: string | null;
          goal_id?: string | null;
          id?: string;
          status?: "active" | "completed" | "archived";
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      training_notes: {
        Row: {
          answer: string | null;
          body: string;
          context_ref: string | null;
          context_type:
            | "course_lesson"
            | "course_module"
            | "guide_drill"
            | "guide_session"
            | "workout_session"
            | "program"
            | null;
          created_at: string;
          focus_id: string | null;
          goal_id: string | null;
          id: string;
          note_type: "observation" | "question";
          resolved_at: string | null;
          status:
            | "open"
            | "actioned"
            | "no_action_needed"
            | "unanswered"
            | "answered"
            | "no_answer_needed";
          updated_at: string;
          user_id: string;
        };
        Insert: {
          answer?: string | null;
          body: string;
          context_ref?: string | null;
          context_type?:
            | "course_lesson"
            | "course_module"
            | "guide_drill"
            | "guide_session"
            | "workout_session"
            | "program"
            | null;
          created_at?: string;
          focus_id?: string | null;
          goal_id?: string | null;
          id?: string;
          note_type: "observation" | "question";
          resolved_at?: string | null;
          status:
            | "open"
            | "actioned"
            | "no_action_needed"
            | "unanswered"
            | "answered"
            | "no_answer_needed";
          updated_at?: string;
          user_id: string;
        };
        Update: {
          answer?: string | null;
          body?: string;
          context_ref?: string | null;
          context_type?:
            | "course_lesson"
            | "course_module"
            | "guide_drill"
            | "guide_session"
            | "workout_session"
            | "program"
            | null;
          created_at?: string;
          focus_id?: string | null;
          goal_id?: string | null;
          id?: string;
          note_type?: "observation" | "question";
          resolved_at?: string | null;
          status?:
            | "open"
            | "actioned"
            | "no_action_needed"
            | "unanswered"
            | "answered"
            | "no_answer_needed";
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "admin_email_template_revisions_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "admin_email_templates";
            referencedColumns: ["id"];
          },
        ];
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      set_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      admin_role: "admin" | "editor" | "viewer";
      admin_email_template_status: "draft" | "review" | "published" | "archived";
      admin_content_status: "draft" | "review" | "published" | "archived";
      admin_content_type:
        | "course_module"
        | "course_lesson"
        | "guide_session"
        | "guide_drill"
        | "page"
        | "product";
      qr_link_status: "draft" | "active" | "disabled" | "archived";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
