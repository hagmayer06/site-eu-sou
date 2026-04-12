import { supabase } from './supabase'

// ─── Tipagenss ─────────────────────────────────────────────────────────────────

export type DepartamentoRow = {
  id: string
  nome: string
  descricao: string | null
  lideres: string | null       // "João Silva, Maria Souza"
  imagem_url: string | null  
  ativo: boolean
  criado_em: string
}

export type DepartamentoInsert = Omit<DepartamentoRow, 'id' | 'criado_em'>

// ─── Leitura pública ──────────────────────────────────────────────────────────

export async function getDepartamentos(): Promise<DepartamentoRow[]> {
  const { data, error } = await supabase
    .from('departamentos')
    .select('*')
    .eq('ativo', true)
    .order('criado_em', { ascending: true })

  if (error) {
    console.error('Erro ao buscar departamentos:', error.message)
    return []
  }
  return data as DepartamentoRow[]
}

// ─── Admin: leitura completa ──────────────────────────────────────────────────

export async function getDepartamentosAdmin(): Promise<DepartamentoRow[]> {
  const { data, error } = await supabase
    .from('departamentos')
    .select('*')
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar departamentos (admin):', error.message)
    return []
  }
  return data as DepartamentoRow[]
}

// ─── Admin: criar ─────────────────────────────────────────────────────────────

export async function criarDepartamento(payload: DepartamentoInsert): Promise<DepartamentoRow | null> {
  const { data, error } = await supabase
    .from('departamentos')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar departamento:', error.message)
    return null
  }
  return data as DepartamentoRow
}

// ─── Admin: editar ────────────────────────────────────────────────────────────

export async function editarDepartamento(
  id: string,
  payload: Partial<DepartamentoInsert>
): Promise<DepartamentoRow | null> {
  const { data, error } = await supabase
    .from('departamentos')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao editar departamento:', error.message)
    return null
  }
  return data as DepartamentoRow
}

// ─── Admin: excluir ───────────────────────────────────────────────────────────

export async function excluirDepartamento(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('departamentos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao excluir departamento:', error.message)
    return false
  }
  return true
}