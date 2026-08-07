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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      fialn_enrollments: {
        Row: {
          created_at: string | null
          end_date: string | null
          group_id: string | null
          id: string
          is_partner: boolean | null
          partner_details: string | null
          received_by: string | null
          payment_method: string | null
          modality: Database["public"]["Enums"]["fialn_modality_type"]
          notes: string | null
          person_id: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          group_id?: string | null
          id?: string
          is_partner?: boolean | null
          partner_details?: string | null
          received_by?: string | null
          payment_method?: string | null
          modality: Database["public"]["Enums"]["fialn_modality_type"]
          notes?: string | null
          person_id: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          group_id?: string | null
          id?: string
          is_partner?: boolean | null
          partner_details?: string | null
          received_by?: string | null
          payment_method?: string | null
          modality?: Database["public"]["Enums"]["fialn_modality_type"]
          notes?: string | null
          person_id?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fialn_enrollments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "fialn_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fialn_enrollments_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      fialn_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          level: string
          name: string
          weekday: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          level: string
          name: string
          weekday: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          level?: string
          name?: string
          weekday?: number
        }
        Relationships: []
      }
      fialn_lesson_bundles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          notes: string | null
          person_id: string
          price: number
          status: string
          total_lessons: number
          updated_at: string | null
          used_lessons: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          person_id: string
          price?: number
          status?: string
          total_lessons: number
          updated_at?: string | null
          used_lessons?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          person_id?: string
          price?: number
          status?: string
          total_lessons?: number
          updated_at?: string | null
          used_lessons?: number
        }
        Relationships: [
          {
            foreignKeyName: "fialn_lesson_bundles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      fialn_lessons: {
        Row: {
          action_items: string | null
          bundle_id: string | null
          created_at: string | null
          duration_hours: number
          id: string
          lesson_date: string
          location: string
          performance_notes: string | null
          person_id: string | null
          topics_covered: string
        }
        Insert: {
          action_items?: string | null
          bundle_id?: string | null
          created_at?: string | null
          duration_hours: number
          id?: string
          lesson_date: string
          location: string
          performance_notes?: string | null
          person_id?: string | null
          topics_covered: string
        }
        Update: {
          action_items?: string | null
          bundle_id?: string | null
          created_at?: string | null
          duration_hours?: number
          id?: string
          lesson_date?: string
          location?: string
          performance_notes?: string | null
          person_id?: string | null
          topics_covered?: string
        }
        Relationships: [
          {
            foreignKeyName: "fialn_lessons_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "fialn_lesson_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fialn_lessons_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      fialn_student_profiles: {
        Row: {
          created_at: string | null
          dificulties: string | null
          financial_status: string | null
          growth_pathway: string | null
          id: string
          person_id: string | null
          strengths: string | null
        }
        Insert: {
          created_at?: string | null
          dificulties?: string | null
          financial_status?: string | null
          growth_pathway?: string | null
          id?: string
          person_id?: string | null
          strengths?: string | null
        }
        Update: {
          created_at?: string | null
          dificulties?: string | null
          financial_status?: string | null
          growth_pathway?: string | null
          id?: string
          person_id?: string | null
          strengths?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fialn_student_profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      fiatt_client_records: {
        Row: {
          created_at: string | null
          emergency_contact: string | null
          id: string
          medical_history: string | null
          pathologies: string | null
          person_id: string | null
          physiological_notes: string | null
        }
        Insert: {
          created_at?: string | null
          emergency_contact?: string | null
          id?: string
          medical_history?: string | null
          pathologies?: string | null
          person_id?: string | null
          physiological_notes?: string | null
        }
        Update: {
          created_at?: string | null
          emergency_contact?: string | null
          id?: string
          medical_history?: string | null
          pathologies?: string | null
          person_id?: string | null
          physiological_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiatt_client_records_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      fiatt_sessions: {
        Row: {
          created_at: string | null
          feedback_received: string | null
          id: string
          incidents: string | null
          person_id: string | null
          session_date: string
          transaction_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_received?: string | null
          id?: string
          incidents?: string | null
          person_id?: string | null
          session_date: string
          transaction_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_received?: string | null
          id?: string
          incidents?: string | null
          person_id?: string | null
          session_date?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiatt_sessions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiatt_sessions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "fiorc_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      fiorc_commitments: {
        Row: {
          category_type: Database["public"]["Enums"]["commitment_type"]
          created_at: string | null
          default_amount: number
          due_day: number
          id: string
          is_active: boolean
          name: string
          split_rule: Database["public"]["Enums"]["split_rule_type"]
          user_id: string | null
        }
        Insert: {
          category_type?: Database["public"]["Enums"]["commitment_type"]
          created_at?: string | null
          default_amount?: number
          due_day?: number
          id?: string
          is_active?: boolean
          name: string
          split_rule?: Database["public"]["Enums"]["split_rule_type"]
          user_id?: string | null
        }
        Update: {
          category_type?: Database["public"]["Enums"]["commitment_type"]
          created_at?: string | null
          default_amount?: number
          due_day?: number
          id?: string
          is_active?: boolean
          name?: string
          split_rule?: Database["public"]["Enums"]["split_rule_type"]
          user_id?: string | null
        }
        Relationships: []
      }
      fiorc_house_settings: {
        Row: {
          active_roommates_count: number
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active_roommates_count?: number
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active_roommates_count?: number
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fiorc_monthly_commitments: {
        Row: {
          commitment_id: string | null
          created_at: string | null
          id: string
          is_active: boolean
          is_paid: boolean
          month_year: string
          total_amount: number
          transaction_id: string | null
          user_calculated_share: number
        }
        Insert: {
          commitment_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_paid?: boolean
          month_year: string
          total_amount: number
          transaction_id?: string | null
          user_calculated_share: number
        }
        Update: {
          commitment_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          is_paid?: boolean
          month_year?: string
          total_amount?: number
          transaction_id?: string | null
          user_calculated_share?: number
        }
        Relationships: [
          {
            foreignKeyName: "fiorc_monthly_commitments_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "fiorc_commitments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiorc_monthly_commitments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "fiorc_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      fiorc_monthly_targets: {
        Row: {
          commitments: Json | null
          created_at: string | null
          credit_card_total: number
          id: string
          month_year: string
          notes: string | null
          total_target: number
        }
        Insert: {
          commitments?: Json | null
          created_at?: string | null
          credit_card_total?: number
          id?: string
          month_year?: string
          notes?: string | null
          total_target?: number
        }
        Update: {
          commitments?: Json | null
          created_at?: string | null
          credit_card_total?: number
          id?: string
          month_year?: string
          notes?: string | null
          total_target?: number
        }
        Relationships: []
      }
      fiorc_rent_boletos: {
        Row: {
          condo_credit_prev_month: number
          condo_measured: number
          created_at: string | null
          file_path: string | null
          id: string
          month_year: string
          raw_ocr_json: Json | null
          rent_amount: number
          total_payable: number | null
        }
        Insert: {
          condo_credit_prev_month: number
          condo_measured: number
          created_at?: string | null
          file_path?: string | null
          id?: string
          month_year?: string
          raw_ocr_json?: Json | null
          rent_amount: number
          total_payable?: number | null
        }
        Update: {
          condo_credit_prev_month?: number
          condo_measured?: number
          created_at?: string | null
          file_path?: string | null
          id?: string
          month_year?: string
          raw_ocr_json?: Json | null
          rent_amount?: number
          total_payable?: number | null
        }
        Relationships: []
      }
      fiorc_transactions: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          created_at: string | null
          description: string | null
          due_date: string
          enrollment_id: string | null
          id: string
          installment_index: number | null
          is_credit_card: boolean | null
          is_projection: boolean | null
          paid_at: string | null
          parent_id: string | null
          person_id: string | null
          received_by: string | null
          tags: string[] | null
          total_installments: number | null
          transaction_datetime: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          created_at?: string | null
          description?: string | null
          due_date: string
          enrollment_id?: string | null
          id?: string
          installment_index?: number | null
          is_credit_card?: boolean | null
          is_projection?: boolean | null
          paid_at?: string | null
          parent_id?: string | null
          person_id?: string | null
          received_by?: string | null
          tags?: string[] | null
          total_installments?: number | null
          transaction_datetime?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["transaction_category"]
          created_at?: string | null
          description?: string | null
          due_date?: string
          enrollment_id?: string | null
          id?: string
          installment_index?: number | null
          is_credit_card?: boolean | null
          is_projection?: boolean | null
          paid_at?: string | null
          parent_id?: string | null
          person_id?: string | null
          received_by?: string | null
          tags?: string[] | null
          total_installments?: number | null
          transaction_datetime?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "fiorc_transactions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "fiorc_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiorc_transactions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      fiteo_attendance: {
        Row: {
          class_id: string | null
          created_at: string | null
          enrollment_id: string | null
          id: string
          payment_type: string | null
          person_id: string | null
          present: boolean | null
          transaction_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          payment_type?: string | null
          person_id?: string | null
          present?: boolean | null
          transaction_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          id?: string
          payment_type?: string | null
          person_id?: string | null
          present?: boolean | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiteo_attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "fiteo_class_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiteo_attendance_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "fialn_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiteo_attendance_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiteo_attendance_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "fiorc_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      fiteo_class_schedules: {
        Row: {
          class_date: string
          created_at: string | null
          id: string
          is_planned: boolean | null
          minutes_and_notes: string | null
          proposed_theme: string
        }
        Insert: {
          class_date: string
          created_at?: string | null
          id?: string
          is_planned?: boolean | null
          minutes_and_notes?: string | null
          proposed_theme: string
        }
        Update: {
          class_date?: string
          created_at?: string | null
          id?: string
          is_planned?: boolean | null
          minutes_and_notes?: string | null
          proposed_theme?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_client: boolean | null
          is_student: boolean | null
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_client?: boolean | null
          is_student?: boolean | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_client?: boolean | null
          is_student?: boolean | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          role: Database["public"]["Enums"]["fi_role_type"]
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["fi_role_type"]
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["fi_role_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fiorc_confirm_shibari_projection: {
        Args: {
          p_transaction_id: string
        }
        Returns: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          created_at: string | null
          description: string | null
          due_date: string
          enrollment_id: string | null
          id: string
          installment_index: number | null
          is_credit_card: boolean | null
          is_projection: boolean | null
          paid_at: string | null
          parent_id: string | null
          person_id: string | null
          received_by: string | null
          tags: string[] | null
          total_installments: number | null
          transaction_datetime: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
      }
      fialn_create_enrollment_financials: {
        Args: {
          p_amount_per_installment: number
          p_category: Database["public"]["Enums"]["transaction_category"]
          p_description: string
          p_enrollment_id: string
          p_first_due_date: string
          p_is_partner?: boolean
          p_payment_method: string
          p_person_id: string
          p_received_by: string
          p_total_installments: number
        }
        Returns: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          created_at: string | null
          description: string | null
          due_date: string
          enrollment_id: string | null
          id: string
          installment_index: number | null
          is_credit_card: boolean | null
          is_projection: boolean | null
          paid_at: string | null
          parent_id: string | null
          person_id: string | null
          received_by: string | null
          tags: string[] | null
          total_installments: number | null
          transaction_datetime: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }[]
      }
      fialn_create_plan_installments: {
        Args: {
          p_amount_per_installment: number
          p_category: Database["public"]["Enums"]["transaction_category"]
          p_description: string
          p_first_due_date: string
          p_person_id: string
          p_total_installments: number
        }
        Returns: {
          amount: number
          category: Database["public"]["Enums"]["transaction_category"]
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          installment_index: number | null
          is_credit_card: boolean | null
          is_projection: boolean | null
          paid_at: string | null
          parent_id: string | null
          person_id: string | null
          tags: string[] | null
          total_installments: number | null
          transaction_datetime: string | null
          type: Database["public"]["Enums"]["transaction_type"]
        }[]
        SetofOptions: {
          from: "*"
          to: "fiorc_transactions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      commitment_type: "fixed" | "optional" | "occasional"
      fi_role_type: "admin" | "associate" | "clerk"
      fialn_modality_type:
        | "monthly_group"
        | "quarterly_group"
        | "private_bundle"
        | "single_group"
        | "single_private"
      split_rule_type:
        | "none"
        | "equal_roommates"
        | "weighted_rent"
        | "mobile_shared"
      transaction_category:
        | "housing"
        | "food_grocery"
        | "food_delivery"
        | "transport_public"
        | "transport_app"
        | "health"
        | "education"
        | "leisure"
        | "business"
        | "investment"
        | "unforeseen"
        | "pet"
        | "session"
        | "private_lesson"
        | "study_group"
        | "workshop"
        | "performance"
        | "freelance_dev"
      transaction_type: "income" | "expense"
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
      commitment_type: ["fixed", "optional", "occasional"],
      fi_role_type: ["admin", "associate", "clerk"],
      fialn_modality_type: [
        "monthly_group",
        "quarterly_group",
        "private_bundle",
        "single_group",
        "single_private",
      ],
      split_rule_type: [
        "none",
        "equal_roommates",
        "weighted_rent",
        "mobile_shared",
      ],
      transaction_category: [
        "housing",
        "food_grocery",
        "food_delivery",
        "transport_public",
        "transport_app",
        "health",
        "education",
        "leisure",
        "business",
        "investment",
        "unforeseen",
        "pet",
        "session",
        "private_lesson",
        "study_group",
        "workshop",
        "performance",
        "freelance_dev",
      ],
      transaction_type: ["income", "expense"],
    },
  },
} as const
