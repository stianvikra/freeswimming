export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      course_progress: {
        Row: {
          done: boolean;
          lesson_id: string;
          updated_at: string;
          user_id: string;
          video_seconds: number;
        };
        Insert: {
          done?: boolean;
          lesson_id: string;
          updated_at?: string;
          user_id: string;
          video_seconds?: number;
        };
        Update: {
          done?: boolean;
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
