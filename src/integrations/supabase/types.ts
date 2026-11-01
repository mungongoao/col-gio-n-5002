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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      faltas_alunos: {
        Row: {
          faltas: number
          id: string
          student_id: number
          trimestre: number
          updated_at: string
        }
        Insert: {
          faltas?: number
          id?: string
          student_id: number
          trimestre: number
          updated_at?: string
        }
        Update: {
          faltas?: number
          id?: string
          student_id?: number
          trimestre?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faltas_alunos_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          exame_escrito: number | null
          exame_oral: number | null
          faltas: number
          id: string
          mac: number | null
          npt: number | null
          qualitativo: string | null
          student_id: number
          subject_id: string
          trimestre: number
          updated_at: string
        }
        Insert: {
          exame_escrito?: number | null
          exame_oral?: number | null
          faltas?: number
          id?: string
          mac?: number | null
          npt?: number | null
          qualitativo?: string | null
          student_id: number
          subject_id: string
          trimestre: number
          updated_at?: string
        }
        Update: {
          exame_escrito?: number | null
          exame_oral?: number | null
          faltas?: number
          id?: string
          mac?: number | null
          npt?: number | null
          qualitativo?: string | null
          student_id?: number
          subject_id?: string
          trimestre?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_students: {
        Row: {
          created_at: string
          guardian_id: string
          id: string
          student_id: number
        }
        Insert: {
          created_at?: string
          guardian_id: string
          id?: string
          student_id: number
        }
        Update: {
          created_at?: string
          guardian_id?: string
          id?: string
          student_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "guardian_students_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardian_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_settings: {
        Row: {
          ano_lectivo: string
          boletim_coord_manha: string
          boletim_coord_tarde: string
          direccao_municipal: string
          id: number
          logo_url: string | null
          ministerio: string
          nome_escola: string
          pauta_direccao: string
          pauta_pedagogico: string
          republica: string
        }
        Insert: {
          ano_lectivo?: string
          boletim_coord_manha?: string
          boletim_coord_tarde?: string
          direccao_municipal?: string
          id?: number
          logo_url?: string | null
          ministerio?: string
          nome_escola?: string
          pauta_direccao?: string
          pauta_pedagogico?: string
          republica?: string
        }
        Update: {
          ano_lectivo?: string
          boletim_coord_manha?: string
          boletim_coord_tarde?: string
          direccao_municipal?: string
          id?: number
          logo_url?: string | null
          ministerio?: string
          nome_escola?: string
          pauta_direccao?: string
          pauta_pedagogico?: string
          republica?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cargo_pretendido: string
          created_at: string
          email: string
          genero: string | null
          id: string
          nome: string
          status: string
        }
        Insert: {
          cargo_pretendido?: string
          created_at?: string
          email?: string
          genero?: string | null
          id: string
          nome?: string
          status?: string
        }
        Update: {
          cargo_pretendido?: string
          created_at?: string
          email?: string
          genero?: string | null
          id?: string
          nome?: string
          status?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          bi: string
          classe: string
          created_at: string
          estado: string
          genero: string
          id: number
          idade: number | null
          nome: string
          telefone: string
          turma: string
        }
        Insert: {
          bi?: string
          classe: string
          created_at?: string
          estado?: string
          genero: string
          id?: never
          idade?: number | null
          nome: string
          telefone?: string
          turma?: string
        }
        Update: {
          bi?: string
          classe?: string
          created_at?: string
          estado?: string
          genero?: string
          id?: never
          idade?: number | null
          nome?: string
          telefone?: string
          turma?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          classe: string
          created_at: string
          extra: boolean
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          classe: string
          created_at?: string
          extra?: boolean
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          classe?: string
          created_at?: string
          extra?: boolean
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      teacher_assignments: {
        Row: {
          id: string
          subject_id: string
          turmas: string[]
          user_id: string
        }
        Insert: {
          id?: string
          subject_id: string
          turmas?: string[]
          user_id: string
        }
        Update: {
          id?: string
          subject_id?: string
          turmas?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_edit_grade: {
        Args: { _subject: string; _user_id: string }
        Returns: boolean
      }
      can_grade: { Args: { _subject: string; _uid: string }; Returns: boolean }
      can_grade_student: {
        Args: { _student: number; _subject: string; _uid: string }
        Returns: boolean
      }
      can_view_subject: {
        Args: { _subject: string; _user_id: string }
        Returns: boolean
      }
      credenciar_usuario: {
        Args: { _role: Database["public"]["Enums"]["app_role"]; _uid: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved: { Args: { _user_id: string }; Returns: boolean }
      is_coordinator: { Args: { _user_id: string }; Returns: boolean }
      is_guardian_of: {
        Args: { _student_id: number; _user_id: string }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      revogar_usuario: { Args: { _uid: string }; Returns: undefined }
      set_own_gender: { Args: { _genero: string }; Returns: undefined }
      staff_teacher_statistics: {
        Args: never
        Returns: {
          genero: string
          subject_id: string
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "pedagogico"
        | "coordenador"
        | "professor"
        | "encarregado"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "admin",
        "pedagogico",
        "coordenador",
        "professor",
        "encarregado",
      ],
    },
  },
} as const
