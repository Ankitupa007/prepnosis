export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      questions: {
        Row: {
          choice_type: string | null
          correct_option: number
          created_at: string | null
          difficulty_level: string | null
          exam_types: string[] | null
          explanation: string | null
          id: string
          is_active: boolean | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          random_order: number | null
          subject_id: string | null
          topic_id: string | null
        }
        Insert: {
          choice_type?: string | null
          correct_option: number
          created_at?: string | null
          difficulty_level?: string | null
          exam_types?: string[] | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_text: string
          random_order?: number | null
          subject_id?: string | null
          topic_id?: string | null
        }
        Update: {
          choice_type?: string | null
          correct_option?: number
          created_at?: string | null
          difficulty_level?: string | null
          exam_types?: string[] | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question_text?: string
          random_order?: number | null
          subject_id?: string | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
          weightage_inicet: number | null
          weightage_neet_pg: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug?: string
          weightage_inicet?: number | null
          weightage_neet_pg?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
          weightage_inicet?: number | null
          weightage_neet_pg?: number | null
        }
        Relationships: []
      }
      test_questions: {
        Row: {
          created_at: string | null
          id: string
          marks: number
          question_id: string | null
          question_order: number
          section_number: number | null
          test_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          marks?: number
          question_id?: string | null
          question_order: number
          section_number?: number | null
          test_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          marks?: number
          question_id?: string | null
          question_order?: number
          section_number?: number | null
          test_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_rankings: {
        Row: {
          attempt_id: string | null
          created_at: string | null
          id: string
          percentile: number | null
          rank: number
          score: number
          test_id: string | null
          user_id: string | null
        }
        Insert: {
          attempt_id?: string | null
          created_at?: string | null
          id?: string
          percentile?: number | null
          rank: number
          score: number
          test_id?: string | null
          user_id?: string | null
        }
        Update: {
          attempt_id?: string | null
          created_at?: string | null
          id?: string
          percentile?: number | null
          rank?: number
          score?: number
          test_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_rankings_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "user_test_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_rankings_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number
          exam_pattern: Database["public"]["Enums"]["exam_pattern"]
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_shareable: boolean | null
          negative_marking: number | null
          scheduled_at: string | null
          sections: Json | null
          share_code: string | null
          share_expires_at: string | null
          shared_at: string | null
          test_mode: Database["public"]["Enums"]["test_mode"]
          test_type: Database["public"]["Enums"]["test_type"]
          title: string
          total_marks: number
          total_questions: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes: number
          exam_pattern: Database["public"]["Enums"]["exam_pattern"]
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_shareable?: boolean | null
          negative_marking?: number | null
          scheduled_at?: string | null
          sections?: Json | null
          share_code?: string | null
          share_expires_at?: string | null
          shared_at?: string | null
          test_mode: Database["public"]["Enums"]["test_mode"]
          test_type: Database["public"]["Enums"]["test_type"]
          title: string
          total_marks: number
          total_questions: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          exam_pattern?: Database["public"]["Enums"]["exam_pattern"]
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_shareable?: boolean | null
          negative_marking?: number | null
          scheduled_at?: string | null
          sections?: Json | null
          share_code?: string | null
          share_expires_at?: string | null
          shared_at?: string | null
          test_mode?: Database["public"]["Enums"]["test_mode"]
          test_type?: Database["public"]["Enums"]["test_type"]
          title?: string
          total_marks?: number
          total_questions?: number
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          subject_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          subject_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_answers: {
        Row: {
          answered_at: string | null
          attempt_id: string | null
          id: string
          is_correct: boolean | null
          is_marked_for_review: boolean | null
          marks_awarded: number | null
          question_id: string | null
          selected_option: number | null
          time_taken_seconds: number | null
        }
        Insert: {
          answered_at?: string | null
          attempt_id?: string | null
          id?: string
          is_correct?: boolean | null
          is_marked_for_review?: boolean | null
          marks_awarded?: number | null
          question_id?: string | null
          selected_option?: number | null
          time_taken_seconds?: number | null
        }
        Update: {
          answered_at?: string | null
          attempt_id?: string | null
          id?: string
          is_correct?: boolean | null
          is_marked_for_review?: boolean | null
          marks_awarded?: number | null
          question_id?: string | null
          selected_option?: number | null
          time_taken_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "user_test_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_subject_performance: {
        Row: {
          accuracy_percentage: number | null
          average_time_per_question: number | null
          correct_answers: number | null
          id: string
          last_updated: string | null
          subject_id: string | null
          total_questions_attempted: number | null
          user_id: string | null
        }
        Insert: {
          accuracy_percentage?: number | null
          average_time_per_question?: number | null
          correct_answers?: number | null
          id?: string
          last_updated?: string | null
          subject_id?: string | null
          total_questions_attempted?: number | null
          user_id?: string | null
        }
        Update: {
          accuracy_percentage?: number | null
          average_time_per_question?: number | null
          correct_answers?: number | null
          id?: string
          last_updated?: string | null
          subject_id?: string | null
          total_questions_attempted?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subject_performance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_test_attempts: {
        Row: {
          correct_answers: number | null
          created_at: string | null
          id: string
          incorrect_answers: number | null
          is_completed: boolean | null
          section_times: Json | null
          started_at: string | null
          submitted_at: string | null
          test_id: string | null
          time_taken_minutes: number | null
          total_score: number | null
          unanswered: number | null
          user_id: string | null
        }
        Insert: {
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          incorrect_answers?: number | null
          is_completed?: boolean | null
          section_times?: Json | null
          started_at?: string | null
          submitted_at?: string | null
          test_id?: string | null
          time_taken_minutes?: number | null
          total_score?: number | null
          unanswered?: number | null
          user_id?: string | null
        }
        Update: {
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          incorrect_answers?: number | null
          is_completed?: boolean | null
          section_times?: Json | null
          started_at?: string | null
          submitted_at?: string | null
          test_id?: string | null
          time_taken_minutes?: number | null
          total_score?: number | null
          unanswered?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_test_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_topic_performance: {
        Row: {
          accuracy_percentage: number | null
          correct_answers: number | null
          id: string
          last_updated: string | null
          strength_level: string | null
          subject_id: string | null
          topic_id: string | null
          total_questions_attempted: number | null
          user_id: string | null
        }
        Insert: {
          accuracy_percentage?: number | null
          correct_answers?: number | null
          id?: string
          last_updated?: string | null
          strength_level?: string | null
          subject_id?: string | null
          topic_id?: string | null
          total_questions_attempted?: number | null
          user_id?: string | null
        }
        Update: {
          accuracy_percentage?: number | null
          correct_answers?: number | null
          id?: string
          last_updated?: string | null
          strength_level?: string | null
          subject_id?: string | null
          topic_id?: string | null
          total_questions_attempted?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_topic_performance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_topic_performance_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_test_share: {
        Args: { test_id_param: string; expires_at_param?: string }
        Returns: string
      }
      custom_query: {
        Args:
          | {
              query: string
              params: string[]
              additional_limit: number
              total_limit: number
            }
          | { query: string; params: string[]; total_limit: number }
          | { query: string; params: Json }
        Returns: {
          id: string
          subject_id: string
        }[]
      }
      generate_share_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_random_questions: {
        Args: { subject_ids: string[]; question_count: number }
        Returns: {
          id: string
          question_text: string
          explanation: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          correct_option: number
          choice_type: string
          subject_id: string
          topic_id: string
          difficulty_level: string
          exam_types: string[]
        }[]
      }
      get_test_by_share_code: {
        Args: { code: string }
        Returns: {
          test_id: string
          title: string
          description: string
          total_questions: number
          total_marks: number
          test_mode: Database["public"]["Enums"]["test_mode"]
          exam_pattern: Database["public"]["Enums"]["exam_pattern"]
          created_by: string
          creator_name: string
          is_expired: boolean
        }[]
      }
      make_test_shareable: {
        Args: { test_id: string; expires_in_hours?: number }
        Returns: string
      }
      revoke_test_sharing: {
        Args: { test_id: string }
        Returns: boolean
      }
    }
    Enums: {
      exam_pattern: "NEET_PG" | "INICET"
      test_mode: "regular" | "exam"
      test_type: "custom" | "grand_test"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      exam_pattern: ["NEET_PG", "INICET"],
      test_mode: ["regular", "exam"],
      test_type: ["custom", "grand_test"],
    },
  },
} as const
