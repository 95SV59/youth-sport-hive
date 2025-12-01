// Centralized type definitions for the application

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  cost: number;
  sport_type: string;
  sport_category?: string;
  difficulty_level: string;
  max_participants: number;
  current_participants: number;
  coach_id: string;
  status: string;
  age_min?: number;
  age_max?: number;
  image_url?: string;
  equipment_provided?: string[];
  equipment_required?: string[];
  created_at: string;
  updated_at: string;
  coaches?: {
    id: string;
    user_id?: string;
    specializations?: string[];
    rating: number;
    is_verified?: boolean;
    experience_years?: number;
    total_events_hosted?: number;
    profiles: {
      first_name: string;
      last_name: string;
      avatar_url?: string;
      bio?: string;
      email?: string;
      phone?: string;
    };
  };
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  status: string;
  registered_at: string;
  attended?: boolean;
  payment_status: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface Coach {
  id: string;
  user_id: string;
  specializations: string[];
  certifications?: string[];
  experience_years: number;
  availability?: any;
  hourly_rate?: number;
  is_verified: boolean;
  rating: number;
  total_reviews?: number;
  total_events_hosted?: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
    bio?: string;
    phone?: string;
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  sport_category?: string;
  target_value: number;
  points_reward: number;
  badge_reward?: string;
  difficulty_level: string;
  challenge_date: string;
  active_date?: string;
  expires_at?: string;
  created_at: string;
  progress?: {
    id: string;
    user_id: string;
    challenge_id: string;
    current_progress: number;
    completed: boolean;
    completed_at?: string;
    points_earned: number;
    created_at: string;
    updated_at: string;
  };
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  sport_type: string;
  score: number;
  rank?: number;
  period: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface Recommendation {
  id: string;
  user_id: string;
  sport_type: string;
  recommended_sport?: string; // Legacy field
  recommendation_data: {
    sport: string;
    reasoning: string;
    benefits: string[];
    matchFactors?: string[];
    scoringBreakdown?: {
      aiConfidence: number;
      userPreferenceScore: number;
      profileMatchScore: number;
      diversityBonus: number;
      trendingBonus: number;
      finalScore: number;
    };
    abVariant?: string;
  };
  confidence_score: number;
  was_accepted?: boolean;
  user_feedback?: string;
  user_interaction_data?: {
    interacted_at: string;
    feedback_provided: boolean;
    timeToDecisionSeconds?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string; // Changed from specific union to string to match database
  phone?: string;
  date_of_birth?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface GamificationStats {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
  current_level?: number;
  streak_days: number;
  current_streak?: number;
  longest_streak?: number;
  events_attended?: number;
  badges?: any;
  achievements?: any;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
