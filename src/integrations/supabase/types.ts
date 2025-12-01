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
      admin_users: {
        Row: {
          created_at: string
          id: string
          permissions: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      coaches: {
        Row: {
          availability: Json | null
          certifications: string[] | null
          created_at: string
          experience_years: number
          hourly_rate: number | null
          id: string
          is_verified: boolean
          rating: number | null
          specializations: string[]
          total_events_hosted: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: Json | null
          certifications?: string[] | null
          created_at?: string
          experience_years?: number
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean
          rating?: number | null
          specializations?: string[]
          total_events_hosted?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: Json | null
          certifications?: string[] | null
          created_at?: string
          experience_years?: number
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean
          rating?: number | null
          specializations?: string[]
          total_events_hosted?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          active_date: string | null
          badge_reward: string | null
          challenge_date: string
          challenge_type: string
          created_at: string
          description: string
          difficulty_level: string
          expires_at: string | null
          id: string
          points_reward: number
          sport_category: string | null
          target_value: number
          title: string
        }
        Insert: {
          active_date?: string | null
          badge_reward?: string | null
          challenge_date: string
          challenge_type: string
          created_at?: string
          description: string
          difficulty_level: string
          expires_at?: string | null
          id?: string
          points_reward: number
          sport_category?: string | null
          target_value: number
          title: string
        }
        Update: {
          active_date?: string | null
          badge_reward?: string | null
          challenge_date?: string
          challenge_type?: string
          created_at?: string
          description?: string
          difficulty_level?: string
          expires_at?: string | null
          id?: string
          points_reward?: number
          sport_category?: string | null
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          attended: boolean | null
          created_at: string
          event_id: string
          id: string
          payment_status: string
          registered_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          created_at?: string
          event_id: string
          id?: string
          payment_status?: string
          registered_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          created_at?: string
          event_id?: string
          id?: string
          payment_status?: string
          registered_at?: string
          status?: string
          updated_at?: string
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
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
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
          coach_id: string
          cost: number
          created_at: string
          current_participants: number
          description: string
          difficulty_level: string | null
          end_time: string
          id: string
          location: string
          max_participants: number
          sport_category: string | null
          sport_type: string
          start_time: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          coach_id: string
          cost: number
          created_at?: string
          current_participants?: number
          description: string
          difficulty_level?: string | null
          end_time: string
          id?: string
          location: string
          max_participants: number
          sport_category?: string | null
          sport_type: string
          start_time: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          coach_id?: string
          cost?: number
          created_at?: string
          current_participants?: number
          description?: string
          difficulty_level?: string | null
          end_time?: string
          id?: string
          location?: string
          max_participants?: number
          sport_category?: string | null
          sport_type?: string
          start_time?: string
          status?: string
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
          achievements: Json | null
          badges: Json | null
          created_at: string
          current_level: number | null
          current_streak: number | null
          events_attended: number | null
          id: string
          last_activity_date: string | null
          level: number
          longest_streak: number | null
          streak_days: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements?: Json | null
          badges?: Json | null
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          events_attended?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number | null
          streak_days?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements?: Json | null
          badges?: Json | null
          created_at?: string
          current_level?: number | null
          current_streak?: number | null
          events_attended?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number
          longest_streak?: number | null
          streak_days?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          created_at: string
          id: string
          period: string
          rank: number | null
          score: number
          sport_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period: string
          rank?: number | null
          score?: number
          sport_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period?: string
          rank?: number | null
          score?: number
          sport_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
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
          first_name: string | null
          id: string
          last_name: string | null
          location: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          location?: string | null
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      recommendation_analytics: {
        Row: {
          ab_test_variant: string | null
          context_data: Json | null
          created_at: string | null
          engagement_score: number | null
          event_id: string | null
          id: string
          recommendation_id: string
          resulted_in_registration: boolean | null
          time_to_decision_seconds: number | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          ab_test_variant?: string | null
          context_data?: Json | null
          created_at?: string | null
          engagement_score?: number | null
          event_id?: string | null
          id?: string
          recommendation_id: string
          resulted_in_registration?: boolean | null
          time_to_decision_seconds?: number | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          ab_test_variant?: string | null
          context_data?: Json | null
          created_at?: string | null
          engagement_score?: number | null
          event_id?: string | null
          id?: string
          recommendation_id?: string
          resulted_in_registration?: boolean | null
          time_to_decision_seconds?: number | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_analytics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_analytics_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_experiments: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          ended_at: string | null
          experiment_name: string
          id: string
          is_active: boolean | null
          variant_name: string
          weight: number | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          experiment_name: string
          id?: string
          is_active?: boolean | null
          variant_name: string
          weight?: number | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          experiment_name?: string
          id?: string
          is_active?: boolean | null
          variant_name?: string
          weight?: number | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          recommendation_data: Json
          sport_type: string
          updated_at: string
          user_feedback: string | null
          user_id: string
          user_interaction_data: Json | null
          was_accepted: boolean | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          recommendation_data: Json
          sport_type: string
          updated_at?: string
          user_feedback?: string | null
          user_id: string
          user_interaction_data?: Json | null
          was_accepted?: boolean | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          recommendation_data?: Json
          sport_type?: string
          updated_at?: string
          user_feedback?: string | null
          user_id?: string
          user_interaction_data?: Json | null
          was_accepted?: boolean | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_data: Json
          achievement_type: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_data: Json
          achievement_type: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_data?: Json
          achievement_type?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          current_progress: number
          id: string
          points_earned: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          points_earned?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          points_earned?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sport_preferences: {
        Row: {
          created_at: string | null
          id: string
          interaction_count: number | null
          last_interaction_at: string | null
          negative_interactions: number | null
          positive_interactions: number | null
          preference_score: number | null
          sport_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_count?: number | null
          last_interaction_at?: string | null
          negative_interactions?: number | null
          positive_interactions?: number | null
          preference_score?: number | null
          sport_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_count?: number | null
          last_interaction_at?: string | null
          negative_interactions?: number | null
          positive_interactions?: number | null
          preference_score?: number | null
          sport_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_sport_preference: {
        Args: {
          p_is_positive: boolean
          p_sport_type: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
