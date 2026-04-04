'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { DepartamentoInsert, DepartamentoRow } from '@/lib/departamentoQueries'

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
 * Cria um novo departamento (Blindado)
 */
export async function criarDepartamentoAction(departamento: DepartamentoInsert) {
  try {
    await validarAcessoAdmin()
    const { data, error } = await supabaseAdmin
      .from('departamentos')
      .insert([departamento])
      .select()

    if (error) throw new Error(error.message)
    revalidatePath('/')
    return { data: data[0] as DepartamentoRow }
  } catch (err: any) {
    console.error('Erro ao criar departamento:', err.message)
    return { erro: 'Não foi possível criar o departamento.' }
  }
}

/**
 * Edita um departamento (Blindado)
 */
export async function editarDepartamentoAction(id: string, updates: Partial<DepartamentoInsert>) {
  try {
    await validarAcessoAdmin()
    const { data, error } = await supabaseAdmin
      .from('departamentos')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw new Error(error.message)
    revalidatePath('/')
    return { data: data[0] as DepartamentoRow }
  } catch (err: any) {
    console.error('Erro ao editar departamento:', err.message)
    return { erro: 'Não foi possível editar o departamento.' }
  }
}

/**
 * Exclui um departamento (Blindado)
 */
export async function excluirDepartamentoAction(id: string) {
  try {
    await validarAcessoAdmin()
    const { error } = await supabaseAdmin
      .from('departamentos')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Erro ao excluir departamento:', err.message)
    return { erro: 'Não foi possível excluir o departamento.' }
  }
}
