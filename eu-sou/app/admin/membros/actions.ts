import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { PerfilRow, temPapel } from '@/lib/membrosQueries'

async function getPerfilById(userId: string): Promise<PerfilRow | null> {
  const { data, error } = await supabaseAdmin
    .from('perfis')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
      return null
    }
    throw error
  }

  if (!data) return null
  return data as PerfilRow
}

async function validarAcessoAdmin(executorId: string) {
  const executor = await getPerfilById(executorId)

  if (!executor) {
    throw new Error('Executor não possui perfil')
  }

  if (!temPapel(executor, 'pastor') && !temPapel(executor, 'tesoureiro')) {
    throw new Error('Usuário não autorizado')
  }

  return executor
}

export async function listMembrosAction(executorId: string) {
  await validarAcessoAdmin(executorId)

  const { data, error } = await supabaseAdmin
    .from('perfis')
    .select('*')
    .order('nome', { ascending: true })

  if (error) throw error
  return (data ?? []) as PerfilRow[]
}

export async function getPerfilAction(executorId: string, targetId: string) {
  await validarAcessoAdmin(executorId)

  const perfil = await getPerfilById(targetId)
  if (!perfil) {
    throw new Error('Perfil não encontrado')
  }

  return perfil
}

export async function updatePerfilAction(executorId: string, targetId: string, data: Partial<PerfilRow>) {
  const executor = await validarAcessoAdmin(executorId)

  if (executorId !== targetId && !temPapel(executor, 'pastor')) {
    throw new Error('Somente pastor pode atualizar perfil de terceiros')
  }

  const { error } = await supabaseAdmin.from('perfis').update(data).eq('id', targetId)

  if (error) throw error
  return true
}

export async function setPapeisAction(executorId: string, targetId: string, papeis: string[]) {
  const executor = await validarAcessoAdmin(executorId)

  if (!temPapel(executor, 'pastor')) {
    throw new Error('Somente pastor pode alterar papéis')
  }

  const { error } = await supabaseAdmin
    .from('perfis')
    .update({ papeis })
    .eq('id', targetId)

  if (error) throw error
  return true
}

export async function setAtivoAction(executorId: string, targetId: string, ativo: boolean) {
  await validarAcessoAdmin(executorId)

  const { error } = await supabaseAdmin
    .from('perfis')
    .update({ ativo })
    .eq('id', targetId)

  if (error) throw error
  return true
}
