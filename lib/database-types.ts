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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      clinical_questions: {
        Row: {
          choice_type: string | null
          correct_option: number
          created_at: string | null
          difficulty_level: string | null
          exam_types: string | null
          explanation: string | null
          id: string
          is_active: boolean | null
          option_a: string | null
          option_b: string | null
          option_c: string | null
          option_d: string | null
          option_e: string | null
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
          exam_types?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          option_e?: string | null
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
          exam_types?: string | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          option_a?: string | null
          option_b?: string | null
          option_c?: string | null
          option_d?: string | null
          option_e?: string | null
          question_text?: string
          random_order?: number | null
          subject_id?: string | null
          topic_id?: string | null
        }
        Relationships: []
      }
      grand_tests: {
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
      grand_tests_questions: {
        Row: {
          choice_type: string | null
          correct_option: number
          created_at: string | null
          difficulty_level: string | null
          exam_types: string[] | null
          explanation: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          marks: number | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_order: number | null
          question_text: string
          section_number: number | null
          subject_id: string | null
          test_id: string
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
          images?: Json | null
          is_active?: boolean | null
          marks?: number | null
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_order?: number | null
          question_text: string
          section_number?: number | null
          subject_id?: string | null
          test_id: string
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
          images?: Json | null
          is_active?: boolean | null
          marks?: number | null
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question_order?: number | null
          question_text?: string
          section_number?: number | null
          subject_id?: string | null
          test_id?: string
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grand_tests_questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grand_tests_questions_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "grand_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grand_tests_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_cases: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          patient_info: Json | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          patient_info?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          patient_info?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
            referencedRelation: "user_grand_tests_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_rankings_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "grand_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_rankings_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
      user_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_question: {
        Row: {
          id: string
          is_correct: boolean | null
          question_id: string | null
          selected_option: number | null
          shown_on: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          selected_option?: number | null
          shown_on?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          selected_option?: number | null
          shown_on?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_question_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "clinical_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_grand_tests_answers: {
        Row: {
          answered_at: string | null
          attempt_id: string | null
          id: string
          is_correct: boolean | null
          is_marked_for_review: boolean | null
          marks_awarded: number | null
          question_id: string | null
          question_state: Database["public"]["Enums"]["question_state"] | null
          section_number: number | null
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
          question_state?: Database["public"]["Enums"]["question_state"] | null
          section_number?: number | null
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
          question_state?: Database["public"]["Enums"]["question_state"] | null
          section_number?: number | null
          selected_option?: number | null
          time_taken_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_grand_tests_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "user_grand_tests_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_grand_tests_answers_question_id_fkey1"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "grand_tests_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_grand_tests_attempts: {
        Row: {
          auto_submitted: boolean | null
          correct_answers: number | null
          created_at: string | null
          current_section: number | null
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
          auto_submitted?: boolean | null
          correct_answers?: number | null
          created_at?: string | null
          current_section?: number | null
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
          auto_submitted?: boolean | null
          correct_answers?: number | null
          created_at?: string | null
          current_section?: number | null
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
            foreignKeyName: "user_grand_tests_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "grand_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_grand_tests_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
        Args: { expires_at_param?: string; test_id_param: string }
        Returns: string
      }
      custom_query:
        | {
            Args: { params: Json; query: string }
            Returns: {
              id: string
              subject_id: string
            }[]
          }
        | {
            Args: {
              additional_limit: number
              params: string[]
              query: string
              total_limit: number
            }
            Returns: {
              id: string
              subject_id: string
            }[]
          }
        | {
            Args: { params: string[]; query: string; total_limit: number }
            Returns: {
              id: string
              subject_id: string
            }[]
          }
      generate_share_code: { Args: never; Returns: string }
      get_random_questions: {
        Args: { question_count: number; subject_ids: string[] }
        Returns: {
          id: string
          is_active: boolean
          question_text: string
          subject_id: string
        }[]
      }
      get_random_questions_v2: {
        Args: {
          p_counts: number[]
          p_exam_type?: string
          p_subject_ids: string[]
        }
        Returns: {
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
        }[]
        SetofOptions: {
          from: "*"
          to: "questions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_random_unseen_question: {
        Args: { p_user_id: string }
        Returns: {
          choice_type: string
          correct_option: number
          created_at: string
          difficulty_level: string
          exam_types: string
          explanation: string
          id: string
          is_active: boolean
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          option_e: string
          question_text: string
          random_order: number
          subject_id: string
          topic_id: string
        }[]
      }
      get_test_by_share_code: {
        Args: { code: string }
        Returns: {
          created_by: string
          creator_name: string
          description: string
          exam_pattern: Database["public"]["Enums"]["exam_pattern"]
          is_expired: boolean
          test_id: string
          test_mode: Database["public"]["Enums"]["test_mode"]
          title: string
          total_marks: number
          total_questions: number
        }[]
      }
      make_test_shareable: {
        Args: { expires_in_hours?: number; test_id: string }
        Returns: string
      }
      revoke_test_sharing: { Args: { test_id: string }; Returns: boolean }
    }
    Enums: {
      exam_pattern: "NEET_PG" | "INICET"
      question_state:
        | "not_visited"
        | "skipped"
        | "answered"
        | "marked_for_review"
        | "answered_and_marked"
      test_mode: "regular" | "exam"
      test_type: "custom" | "grand_test"
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
      exam_pattern: ["NEET_PG", "INICET"],
      question_state: [
        "not_visited",
        "skipped",
        "answered",
        "marked_for_review",
        "answered_and_marked",
      ],
      test_mode: ["regular", "exam"],
      test_type: ["custom", "grand_test"],
    },
  },
} as const
