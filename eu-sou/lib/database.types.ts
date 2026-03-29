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
      perfis: {
        Row: {
          ativo: boolean
          bairro: string | null
          cep: string | null
          cidade: string | null
          criado_em: string
          data_nascimento: string | null
          foto_url: string | null
          grupo_id: string | null
          id: string
          nome: string
          papeis: string[]
          rua: string | null
          telefone: string | null
          uf: string | null
        }
        Insert: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          criado_em?: string
          data_nascimento?: string | null
          foto_url?: string | null
          grupo_id?: string | null
          id: string
          nome: string
          papeis?: string[]
          rua?: string | null
          telefone?: string | null
          uf?: string | null
        }
        Update: {
          ativo?: boolean
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          criado_em?: string
          data_nascimento?: string | null
          foto_url?: string | null
          grupo_id?: string | null
          id?: string
          nome?: string
          papeis?: string[]
          rua?: string | null
          telefone?: string | null
          uf?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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

// Atalhos para a tabela perfis
export type PerfilRow = Tables<"perfis">
export type PerfilInsert = TablesInsert<"perfis">
export type PerfilUpdate = TablesUpdate<"perfis">

// Papéis válidos
export type Papel = "membro" | "lider" | "conferente" | "tesoureiro" | "pastor"

// ──────────────────────────────────────────────
// Módulo Financeiro
// ──────────────────────────────────────────────

export type CategoriaFinanceiroRow = {
  id: string
  nome: string
  tipo: 'entrada' | 'saida'
  icone: string | null
  ativo: boolean
}

export type LancamentoStatus = 'pendente' | 'pago' | 'vencido' | 'confirmado'
export type LancamentoTipo = 'entrada' | 'saida'

export type LancamentoRow = {
  id: string
  tipo: LancamentoTipo
  categoria_id: string
  valor: number           // em centavos
  descricao: string
  data: string            // ISO date (YYYY-MM-DD)
  grupo_id: string | null
  membro_id: string | null
  data_vencimento: string | null
  status: LancamentoStatus
  comprovante_url: string | null
  criado_por: string
  criado_em: string
}

export type LancamentoInsert = Omit<LancamentoRow, 'id' | 'criado_em'> & {
  id?: string
  criado_em?: string
}

export type ConfiguracaoIgrejaRow = {
  id: string
  chave_pix: string | null
  cnpj: string | null
  nome_igreja: string | null
  updated_at: string | null
}
