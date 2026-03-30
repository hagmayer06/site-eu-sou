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
      grupos: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          endereco: string
          latitude: number | null
          longitude: number | null
          telefone: string | null
          email: string
          imagem_url: string | null
          lider_id: string
          ativo: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          endereco: string
          latitude?: number | null
          longitude?: number | null
          telefone?: string | null
          email: string
          imagem_url?: string | null
          lider_id: string
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          endereco?: string
          latitude?: number | null
          longitude?: number | null
          telefone?: string | null
          email?: string
          imagem_url?: string | null
          lider_id?: string
          ativo?: boolean
          criado_em?: string
          atualizado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupos_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          }
        ]
      }
      membros_grupo: {
        Row: {
          id: string
          grupo_id: string
          perfil_id: string
          cargo: string
          data_entrada: string
          data_saida: string | null
          ativo: boolean
        }
        Insert: {
          id?: string
          grupo_id: string
          perfil_id: string
          cargo: string
          data_entrada?: string
          data_saida?: string | null
          ativo?: boolean
        }
        Update: {
          id?: string
          grupo_id?: string
          perfil_id?: string
          cargo?: string
          data_entrada?: string
          data_saida?: string | null
          ativo?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "membros_grupo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_grupo_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          }
        ]
      }
      reunioes_grupo: {
        Row: {
          id: string
          grupo_id: string
          titulo: string
          descricao: string | null
          dia_semana: number
          horario: string
          localizacao: string | null
          criado_por: string
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          grupo_id: string
          titulo: string
          descricao?: string | null
          dia_semana: number
          horario: string
          localizacao?: string | null
          criado_por: string
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          grupo_id?: string
          titulo?: string
          descricao?: string | null
          dia_semana?: number
          horario?: string
          localizacao?: string | null
          criado_por?: string
          criado_em?: string
          atualizado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "reunioes_grupo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reunioes_grupo_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          }
        ]
      }
      avisos_grupo: {
        Row: {
          id: string
          grupo_id: string
          titulo: string
          mensagem: string
          tipo: string
          data_envio: string
          enviado_por: string
          wa_message_id: string | null
          criado_em: string
        }
        Insert: {
          id?: string
          grupo_id: string
          titulo: string
          mensagem: string
          tipo: string
          data_envio: string
          enviado_por: string
          wa_message_id?: string | null
          criado_em?: string
        }
        Update: {
          id?: string
          grupo_id?: string
          titulo?: string
          mensagem?: string
          tipo?: string
          data_envio?: string
          enviado_por?: string
          wa_message_id?: string | null
          criado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "avisos_grupo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avisos_grupo_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          }
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

// ──────────────────────────────────────────────
// Módulo Grupos Familiares
// ──────────────────────────────────────────────

export type TipoAcessoGrupo = 'pastor' | 'lider' | 'membro' | 'publico'
export type CargoMembro = 'lider' | 'membro'
export type TipoAviso = 'reuniao' | 'evento' | 'geral'

export type GrupoRow = {
  id: string
  nome: string
  descricao: string | null
  endereco: string
  latitude: number | null
  longitude: number | null
  telefone: string | null
  email: string
  imagem_url: string | null
  lider_id: string
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export type GrupoInsert = Omit<GrupoRow, 'id' | 'criado_em' | 'atualizado_em'> & {
  id?: string
  criado_em?: string
  atualizado_em?: string
}

export type GrupoUpdate = Partial<Omit<GrupoRow, 'id' | 'criado_em' | 'atualizado_em'>>

export type MembroGrupoRow = {
  id: string
  grupo_id: string
  perfil_id: string
  cargo: CargoMembro
  data_entrada: string
  data_saida: string | null
  ativo: boolean
}

export type MembroGrupoInsert = Omit<MembroGrupoRow, 'id'>
export type MembroGrupoUpdate = Partial<Omit<MembroGrupoRow, 'id' | 'grupo_id' | 'perfil_id'>>

export type ReuniaoGrupoRow = {
  id: string
  grupo_id: string
  titulo: string
  descricao: string | null
  dia_semana: number // 0 = segunda, 6 = domingo
  horario: string // HH:MM format
  localizacao: string | null
  criado_por: string
  criado_em: string
  atualizado_em: string
}

export type ReuniaoGrupoInsert = Omit<ReuniaoGrupoRow, 'id' | 'criado_em' | 'atualizado_em'> & {
  id?: string
  criado_em?: string
  atualizado_em?: string
}

export type ReuniaoGrupoUpdate = Partial<Omit<ReuniaoGrupoRow, 'id' | 'grupo_id' | 'criado_em' | 'atualizado_em'>>

export type AvisoGrupoRow = {
  id: string
  grupo_id: string
  titulo: string | null
  mensagem: string
  tipo: TipoAviso
  data_envio: string
  enviado_por: string
  wa_message_id: string | null
  criado_em: string
}

export type AvisoGrupoInsert = Omit<AvisoGrupoRow, 'id' | 'criado_em'> & {
  id?: string
  criado_em?: string
}

export type AvisoGrupoUpdate = Partial<Omit<AvisoGrupoRow, 'id' | 'grupo_id' | 'criado_em'>>
