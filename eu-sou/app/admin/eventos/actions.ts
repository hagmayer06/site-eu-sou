'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { EventoInsert, EventoRow } from '@/lib/eventosQueries'

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
 * Cria um novo evento (Blindado)
 */
export async function criarEventoAction(evento: EventoInsert) {
  try {
    await validarAcessoAdmin()
    const { data, error } = await supabaseAdmin
      .from('eventos')
      .insert([evento])
      .select()

    if (error) throw new Error(error.message)
    revalidatePath('/')
    return { data: data[0] as EventoRow }
  } catch (err: any) {
    console.error('Erro ao criar evento:', err.message)
    return { erro: 'Não foi possível criar o evento.' }
  }
}

/**
 * Edita um evento (Blindado)
 */
export async function editarEventoAction(id: string, updates: Partial<EventoInsert>) {
  try {
    await validarAcessoAdmin()
    const { data, error } = await supabaseAdmin
      .from('eventos')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw new Error(error.message)
    revalidatePath('/')
    return { data: data[0] as EventoRow }
  } catch (err: any) {
    console.error('Erro ao editar evento:', err.message)
    return { erro: 'Não foi possível editar o evento.' }
  }
}

/**
 * Exclui um evento (Blindado)
 */
export async function excluirEventoAction(id: string) {
  try {
    await validarAcessoAdmin()
    const { error } = await supabaseAdmin
      .from('eventos')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    console.error('Erro ao excluir evento:', err.message)
    return { erro: 'Não foi possível excluir o evento.' }
  }
}
