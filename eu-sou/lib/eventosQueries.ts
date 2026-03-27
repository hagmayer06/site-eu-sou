import { supabase } from './supabase'

// ─── Tipagens (Mantidas) ──────────────────────────────────────────────────────
export type EventoRow = {
  id: string
  titulo: string
  descricao: string | null
  data: string
  horario: string | null
  local: string | null
  imagem_url: string | null // <-- ADICIONE ESTA LINHA
  ativo: boolean
  criado_em: string
}

export type EventoInsert = Omit<EventoRow, 'id' | 'criado_em'>

// ─── Funções (Agora todas usam o cliente público 'supabase') ──────────────────

export async function getEventos() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('ativo', true)
    .order('data', { ascending: true })

  if (error) return []
  return data as EventoRow[]
}

export async function getEventosAdmin() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('data', { ascending: false })

  if (error) return []
  return data as EventoRow[]
}

export async function criarEvento(evento: EventoInsert) {
  // O 'supabase' aqui vai tentar inserir usando sua sessão de usuário logado
  const { data, error } = await supabase
    .from('eventos')
    .insert([evento])
    .select()

  if (error) throw new Error(error.message)
  return data[0] as EventoRow
}

export async function editarEvento(id: string, updates: Partial<EventoInsert>) {
  const { data, error } = await supabase
    .from('eventos')
    .update(updates)
    .eq('id', id)
    .select()

  if (error) throw new Error(error.message)
  return data[0] as EventoRow
}

export async function excluirEvento(id: string) {
  const { error } = await supabase
    .from('eventos')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return true
}