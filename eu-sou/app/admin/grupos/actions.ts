'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSession } from '@/lib/auth'
import type { Grupo, GrupoInput } from '@/lib/gruposQueries'

/**
 * Validação de Segurança Centralizada
 */
async function validarAcessoAdmin() {
  const user = await getSession()
  if (!user) {
    throw new Error('Acesso negado: Usuário não autenticado.')
  }
  return user
}

/**
 * Busca TODOS os grupos (ativos e inativos) para o painel admin.
 */
export async function getGruposAdminAction(): Promise<Grupo[]> {
  try {
    await validarAcessoAdmin() // <--- BLINDAGEM

    const { data, error } = await supabaseAdmin
      .from('pequenos_grupos')
      .select('*')
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Erro ao buscar grupos (admin):', error.message)
      return []
    }

    return data ?? []
  } catch (err) {
    console.error('Falha de segurança/erro no fetch:', err)
    return []
  }
}

/**
 * Cria um novo grupo.
 */
export async function criarGrupo(input: GrupoInput): Promise<{ erro?: string }> {
  try {
    await validarAcessoAdmin() // <--- BLINDAGEM

    const { error } = await supabaseAdmin
      .from('pequenos_grupos')
      .insert([input])

    if (error) {
      console.error('Erro ao criar grupo:', error.message)
      return { erro: error.message }
    }

    return {}
  } catch (err: any) {
    console.error('Tentativa de criação não autorizada ou erro:', err.message)
    return { erro: 'Ação não permitida.' }
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
    await validarAcessoAdmin() // <--- BLINDAGEM

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
    console.error('Tentativa de edição não autorizada ou erro:', err.message)
    return { erro: 'Ação não permitida.' }
  }
}

/**
 * Exclui um grupo pelo id.
 */
export async function excluirGrupo(id: string): Promise<{ erro?: string }> {
  try {
    await validarAcessoAdmin() // <--- BLINDAGEM

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
    console.error('Tentativa de exclusão não autorizada ou erro:', err.message)
    return { erro: 'Ação não permitida.' }
  }
}
