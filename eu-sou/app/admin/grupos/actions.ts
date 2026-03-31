'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { Grupo, GrupoInput } from '@/lib/gruposQueries'

/**
 * Busca TODOS os grupos (ativos e inativos) para o painel admin.
 * Server Action - seguro usar supabaseAdmin aqui
 */
export async function getGruposAdminAction(): Promise<Grupo[]> {
  const { data, error } = await supabaseAdmin
    .from('pequenos_grupos')
    .select('*')
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('Erro ao buscar grupos (admin):', error.message)
    return []
  }

  return data ?? []
}

/**
 * Cria um novo grupo.
 */
export async function criarGrupo(input: GrupoInput): Promise<{ erro?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('pequenos_grupos')
      .insert([input])

    if (error) {
      console.error('Erro ao criar grupo:', error.message)
      return { erro: error.message }
    }

    return {}
  } catch (err: any) {
    console.error('Erro ao criar grupo:', err)
    return { erro: err.message }
  }
}

/**
 * Edita um grupo existente pelo id.
 */
export async function editarGrupo(
  id: string,
  campos: Partial<GrupoInput>
): Promise<{ erro?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('pequenos_grupos')
      .update(campos)
      .eq('id', id)

    if (error) {
      console.error('Erro ao editar grupo:', error.message)
      return { erro: error.message }
    }

    return {}
  } catch (err: any) {
    console.error('Erro ao editar grupo:', err)
    return { erro: err.message }
  }
}

/**
 * Exclui um grupo pelo id.
 */
export async function excluirGrupo(id: string): Promise<{ erro?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('pequenos_grupos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir grupo:', error.message)
      return { erro: error.message }
    }

    return {}
  } catch (err: any) {
    console.error('Erro ao excluir grupo:', err)
    return { erro: err.message }
  }
}
