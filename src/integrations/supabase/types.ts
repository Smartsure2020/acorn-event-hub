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
      milestones: {
        Row: {
          actual_date: string | null
          code: string
          created_at: string
          id: string
          name: string
          phase: string | null
          project_id: string
          sign_off: string | null
          sort_order: number
          status: Database["public"]["Enums"]["milestone_status"]
          target_date: string | null
          target_week: number | null
          updated_at: string
        }
        Insert: {
          actual_date?: string | null
          code: string
          created_at?: string
          id?: string
          name: string
          phase?: string | null
          project_id: string
          sign_off?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          target_date?: string | null
          target_week?: number | null
          updated_at?: string
        }
        Update: {
          actual_date?: string | null
          code?: string
          created_at?: string
          id?: string
          name?: string
          phase?: string | null
          project_id?: string
          sign_off?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["milestone_status"]
          target_date?: string | null
          target_week?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget_zar: number | null
          client: string | null
          created_at: string
          event_date: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          phase: Database["public"]["Enums"]["project_phase"]
          pm: string | null
          status: Database["public"]["Enums"]["project_status"]
          type: Database["public"]["Enums"]["project_type"]
          updated_at: string
        }
        Insert: {
          budget_zar?: number | null
          client?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          phase?: Database["public"]["Enums"]["project_phase"]
          pm?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Update: {
          budget_zar?: number | null
          client?: string | null
          created_at?: string
          event_date?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          phase?: Database["public"]["Enums"]["project_phase"]
          pm?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          type?: Database["public"]["Enums"]["project_type"]
          updated_at?: string
        }
        Relationships: []
      }
      risks: {
        Row: {
          created_at: string
          description: string
          id: string
          impact: Database["public"]["Enums"]["risk_level"]
          likelihood: Database["public"]["Enums"]["risk_level"]
          mitigation: string | null
          owner: string | null
          project_id: string
          rating: Database["public"]["Enums"]["risk_rating"]
          risk_number: number
          status: Database["public"]["Enums"]["risk_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          impact?: Database["public"]["Enums"]["risk_level"]
          likelihood?: Database["public"]["Enums"]["risk_level"]
          mitigation?: string | null
          owner?: string | null
          project_id: string
          rating?: Database["public"]["Enums"]["risk_rating"]
          risk_number: number
          status?: Database["public"]["Enums"]["risk_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          impact?: Database["public"]["Enums"]["risk_level"]
          likelihood?: Database["public"]["Enums"]["risk_level"]
          mitigation?: string | null
          owner?: string | null
          project_id?: string
          rating?: Database["public"]["Enums"]["risk_rating"]
          risk_number?: number
          status?: Database["public"]["Enums"]["risk_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          critical_path: boolean
          duration_days: number
          id: string
          is_milestone: boolean
          name: string
          owner: string | null
          phase: Database["public"]["Enums"]["project_phase"]
          priority: Database["public"]["Enums"]["task_priority"]
          project_id: string
          sort_order: number
          start_day: number
          status: Database["public"]["Enums"]["task_status"]
          task_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          critical_path?: boolean
          duration_days?: number
          id?: string
          is_milestone?: boolean
          name: string
          owner?: string | null
          phase: Database["public"]["Enums"]["project_phase"]
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id: string
          sort_order?: number
          start_day?: number
          status?: Database["public"]["Enums"]["task_status"]
          task_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          critical_path?: boolean
          duration_days?: number
          id?: string
          is_milestone?: boolean
          name?: string
          owner?: string | null
          phase?: Database["public"]["Enums"]["project_phase"]
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string
          sort_order?: number
          start_day?: number
          status?: Database["public"]["Enums"]["task_status"]
          task_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          name: string
          project_id: string | null
          role: Database["public"]["Enums"]["team_role"]
          updated_at: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          name: string
          project_id?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          updated_at?: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string
          project_id?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      milestone_status: "Not Started" | "Complete" | "At Risk"
      project_phase:
        | "Initiation"
        | "Planning"
        | "Creative"
        | "Procurement"
        | "Execution Prep"
        | "Activation"
        | "Post-Activation"
      project_status:
        | "Planning"
        | "Active"
        | "On Hold"
        | "Complete"
        | "Cancelled"
      project_type: "On-ground" | "Sponsorship" | "Both"
      risk_level: "Low" | "Medium" | "High"
      risk_rating: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
      risk_status: "Open" | "Mitigated" | "Closed"
      task_priority: "High" | "Medium" | "Low"
      task_status: "Not Started" | "In Progress" | "Complete" | "Blocked"
      team_role: "PM" | "Marketing" | "Executor" | "Client" | "Other"
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
      milestone_status: ["Not Started", "Complete", "At Risk"],
      project_phase: [
        "Initiation",
        "Planning",
        "Creative",
        "Procurement",
        "Execution Prep",
        "Activation",
        "Post-Activation",
      ],
      project_status: [
        "Planning",
        "Active",
        "On Hold",
        "Complete",
        "Cancelled",
      ],
      project_type: ["On-ground", "Sponsorship", "Both"],
      risk_level: ["Low", "Medium", "High"],
      risk_rating: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      risk_status: ["Open", "Mitigated", "Closed"],
      task_priority: ["High", "Medium", "Low"],
      task_status: ["Not Started", "In Progress", "Complete", "Blocked"],
      team_role: ["PM", "Marketing", "Executor", "Client", "Other"],
    },
  },
} as const
