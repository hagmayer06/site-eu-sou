import { supabase } from './supabase'

// ─── Tipagens (Mantidas para consistência) ────────────────────────────────────
export type EventoRow = {
  id: string
  titulo: string
  descricao: string | null
  data: string
  horario: string | null
  local: string | null
  imagem_url: string | null
  ativo: boolean
  criado_em: string
}

export type EventoInsert = Omit<EventoRow, 'id' | 'criado_em'>

// ─── Funções Públicas e de Leitura (Seguras) ──────────────────────────────────

/**
 * Busca eventos ativos para o site público.
 */
export async function getEventos() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('ativo', true)
    .order('data', { ascending: true })

  if (error) {
    console.error('Erro ao buscar eventos públicos:', error.message)
    return []
  }
  return data as EventoRow[]
}

/**
 * Busca todos os eventos para o admin (Apenas Leitura).
 * Cybersecurity: A segurança real de escrita está nas Server Actions.
 */
export async function getEventosAdmin() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('data', { ascending: false })

  if (error) {
    console.error('Erro ao buscar eventos para o admin:', error.message)
    return []
  }
  return data as EventoRow[]
}
