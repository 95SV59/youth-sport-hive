export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      coaches: {
        Row: {
          certifications: string[] | null
          created_at: string
          experience_years: number | null
          hourly_rate: number | null
          id: string
          is_verified: boolean | null
          profile_id: string
          rating: number | null
          specializations: Database["public"]["Enums"]["sport_category"][]
          total_events_hosted: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          verification_documents: string[] | null
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          profile_id: string
          rating?: number | null
          specializations?: Database["public"]["Enums"]["sport_category"][]
          total_events_hosted?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          verification_documents?: string[] | null
        }
        Update: {
          certifications?: string[] | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          profile_id?: string
          rating?: number | null
          specializations?: Database["public"]["Enums"]["sport_category"][]
          total_events_hosted?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          verification_documents?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "coaches_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attended: boolean | null
          event_id: string
          id: string
          notes: string | null
          payment_status: string | null
          profile_id: string
          registered_at: string
          status: Database["public"]["Enums"]["registration_status"] | null
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          event_id: string
          id?: string
          notes?: string | null
          payment_status?: string | null
          profile_id: string
          registered_at?: string
          status?: Database["public"]["Enums"]["registration_status"] | null
          user_id: string
        }
        Update: {
          attended?: boolean | null
          event_id?: string
          id?: string
          notes?: string | null
          payment_status?: string | null
          profile_id?: string
          registered_at?: string
          status?: Database["public"]["Enums"]["registration_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          age_max: number | null
          age_min: number | null
          cancellation_policy: string | null
          coach_id: string
          cost: number
          created_at: string
          current_participants: number | null
          description: string
          difficulty_level: Database["public"]["Enums"]["difficulty_level"]
          end_time: string
          equipment_provided: string[] | null
          equipment_required: string[] | null
          id: string
          image_url: string | null
          latitude: number | null
          location: string
          longitude: number | null
          max_participants: number
          sport_category: Database["public"]["Enums"]["sport_category"]
          start_time: string
          status: Database["public"]["Enums"]["event_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          cancellation_policy?: string | null
          coach_id: string
          cost?: number
          created_at?: string
          current_participants?: number | null
          description: string
          difficulty_level?: Database["public"]["Enums"]["difficulty_level"]
          end_time: string
          equipment_provided?: string[] | null
          equipment_required?: string[] | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          max_participants?: number
          sport_category: Database["public"]["Enums"]["sport_category"]
          start_time: string
          status?: Database["public"]["Enums"]["event_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          cancellation_policy?: string | null
          coach_id?: string
          cost?: number
          created_at?: string
          current_participants?: number | null
          description?: string
          difficulty_level?: Database["public"]["Enums"]["difficulty_level"]
          end_time?: string
          equipment_provided?: string[] | null
          equipment_required?: string[] | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          max_participants?: number
          sport_category?: Database["public"]["Enums"]["sport_category"]
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      gamification_stats: {
        Row: {
          created_at: string
          current_level: number | null
          current_streak: number | null
          events_attended: number | null
          favorite_sport: Database["public"]["Enums"]["sport_category"] | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          profile_id: string
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          events_attended?: number | null
          favorite_sport?: Database["public"]["Enums"]["sport_category"] | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          profile_id: string
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          events_attended?: number | null
          favorite_sport?: Database["public"]["Enums"]["sport_category"] | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          profile_id?: string
          total_points?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamification_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          id: string
          last_name: string
          location: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          id?: string
          last_name: string
          location?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          id?: string
          last_name?: string
          location?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ratings_reviews: {
        Row: {
          coach_id: string
          created_at: string
          event_id: string
          id: string
          is_verified: boolean | null
          rating: number
          review_text: string | null
          reviewer_id: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          event_id: string
          id?: string
          is_verified?: boolean | null
          rating: number
          review_text?: string | null
          reviewer_id: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          event_id?: string
          id?: string
          is_verified?: boolean | null
          rating?: number
          review_text?: string | null
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_reviews_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          profile_id: string
          reasoning: string | null
          recommended_sport: Database["public"]["Enums"]["sport_category"]
          user_feedback: string | null
          user_id: string
          was_accepted: boolean | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          profile_id: string
          reasoning?: string | null
          recommended_sport: Database["public"]["Enums"]["sport_category"]
          user_feedback?: string | null
          user_id: string
          was_accepted?: boolean | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          profile_id?: string
          reasoning?: string | null
          recommended_sport?: Database["public"]["Enums"]["sport_category"]
          user_feedback?: string | null
          user_id?: string
          was_accepted?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_categories: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          icon_name: string | null
          id: string
          name: Database["public"]["Enums"]["sport_category"]
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          icon_name?: string | null
          id?: string
          name: Database["public"]["Enums"]["sport_category"]
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          icon_name?: string | null
          id?: string
          name?: Database["public"]["Enums"]["sport_category"]
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          description: string | null
          earned_at: string
          event_id: string | null
          icon_name: string | null
          id: string
          points_awarded: number | null
          profile_id: string
          title: string
          user_id: string
        }
        Insert: {
          badge_type: Database["public"]["Enums"]["badge_type"]
          description?: string | null
          earned_at?: string
          event_id?: string | null
          icon_name?: string | null
          id?: string
          points_awarded?: number | null
          profile_id: string
          title: string
          user_id: string
        }
        Update: {
          badge_type?: Database["public"]["Enums"]["badge_type"]
          description?: string | null
          earned_at?: string
          event_id?: string | null
          icon_name?: string | null
          id?: string
          points_awarded?: number | null
          profile_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_coach: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      badge_type:
        | "participation"
        | "achievement"
        | "streak"
        | "milestone"
        | "special"
      difficulty_level: "beginner" | "intermediate" | "advanced" | "all_levels"
      event_status:
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | "completed"
      registration_status: "pending" | "confirmed" | "cancelled" | "completed"
      sport_category:
        | "basketball"
        | "soccer"
        | "tennis"
        | "swimming"
        | "baseball"
        | "volleyball"
        | "track_field"
        | "martial_arts"
        | "gymnastics"
        | "other"
      user_role: "student" | "parent" | "coach" | "admin"
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
  public: {
    Enums: {
      badge_type: [
        "participation",
        "achievement",
        "streak",
        "milestone",
        "special",
      ],
      difficulty_level: ["beginner", "intermediate", "advanced", "all_levels"],
      event_status: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "completed",
      ],
      registration_status: ["pending", "confirmed", "cancelled", "completed"],
      sport_category: [
        "basketball",
        "soccer",
        "tennis",
        "swimming",
        "baseball",
        "volleyball",
        "track_field",
        "martial_arts",
        "gymnastics",
        "other",
      ],
      user_role: ["student", "parent", "coach", "admin"],
    },
  },
} as const
