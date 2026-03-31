import { supabase } from "./supabase";

export type Grupo = {
  id: string;
  nome: string | null;
  lider: string;
  bairro: string;
  dia_semana: string;
  horario: string;
  endereco: string | null;
  ativo: boolean;
  criado_em: string;
};

export type GrupoInput = Omit<Grupo, 'id' | 'criado_em'>

// ─── Funções (Usando o cliente público 'supabase') ──────────────────────────────

export async function getGrupos() {
  try {
    const { data, error } = await supabase
      .from('pequenos_grupos')
      .select('*')
      .order('dia_semana', { ascending: true })

    if (error) {
      console.error('❌ Erro ao buscar grupos:', error.message, error.details)
      return []
    }

    console.log('✅ Grupos carregados com sucesso:', data?.length, data)
    return data as Grupo[]
  } catch (err) {
    console.error('❌ Erro na query de grupos:', err)
    return []
  }
}

export async function getGruposAdmin() {
  try {
    const { data, error } = await supabase
      .from('pequenos_grupos')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar grupos admin:', error.message, error.details)
      return []
    }

    console.log('✅ Grupos admin carregados:', data?.length)
    return data as Grupo[]
  } catch (err) {
    console.error('❌ Erro na query de grupos admin:', err)
    return []
  }
}

export async function criarGrupo(grupo: GrupoInput) {
  try {
    const { data, error } = await supabase
      .from('pequenos_grupos')
      .insert([grupo])
      .select()

    if (error) throw new Error(error.message)
    console.log('✅ Grupo criado:', data[0])
    return data[0] as Grupo
  } catch (err) {
    console.error('❌ Erro ao criar grupo:', err)
    throw err
  }
}

export async function editarGrupo(id: string, updates: Partial<GrupoInput>) {
  try {
    const { data, error } = await supabase
      .from('pequenos_grupos')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw new Error(error.message)
    console.log('✅ Grupo editado:', data[0])
    return data[0] as Grupo
  } catch (err) {
    console.error('❌ Erro ao editar grupo:', err)
    throw err
  }
}

export async function excluirGrupo(id: string) {
  try {
    const { error } = await supabase
      .from('pequenos_grupos')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    console.log('✅ Grupo excluído com sucesso')
    return true
  } catch (err) {
    console.error('❌ Erro ao excluir grupo:', err)
    throw err
  }
}