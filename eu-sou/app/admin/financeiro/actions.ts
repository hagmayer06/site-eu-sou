'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getPerfilAtual } from '@/lib/auth'
import { parseCentavos } from '@/lib/financeiroQueries'

// ── Lançamentos ──────────────────────────────────────────────

export async function criarLancamentoAction(formData: FormData) {
  const perfil = await getPerfilAtual()
  if (!perfil) throw new Error('Não autenticado')

  const tipo = String(formData.get('tipo') ?? '').trim()
  const categoria_id = String(formData.get('categoria_id') ?? '').trim()
  const valor_str = String(formData.get('valor') ?? '0')
  const descricao = String(formData.get('descricao') ?? '').trim()
  const data = String(formData.get('data') ?? '').trim()
  const membro_id = String(formData.get('membro_id') ?? '').trim() || null
  const grupo_id = String(formData.get('grupo_id') ?? '').trim() || null

  if (!tipo || !['entrada', 'saida'].includes(tipo)) throw new Error('Tipo inválido')
  if (!categoria_id) throw new Error('Categoria obrigatória')
  if (!descricao) throw new Error('Descrição obrigatória')
  if (!data) throw new Error('Data obrigatória')

  const valor = parseCentavos(valor_str)
  if (valor <= 0) throw new Error('Valor inválido')

  const { error } = await supabaseAdmin.from('lancamentos').insert({
    tipo,
    categoria_id,
    valor,
    descricao,
    data,
    membro_id,
    grupo_id,
    status: 'confirmado',
    criado_por: perfil.id,
  })

  if (error) throw error
  revalidatePath('/admin/financeiro/entradas')
  revalidatePath('/admin/financeiro')
}

/** Estorna um lançamento confirmado criando um lançamento contrário (tipo invertido, mesmo valor). */
export async function estornarLancamentoAction(formData: FormData) {
  const perfil = await getPerfilAtual()
  if (!perfil) throw new Error('Não autenticado')

  const id = String(formData.get('id') ?? '').trim()
  if (!id) throw new Error('ID obrigatório')

  const { data: original, error: getErr } = await supabaseAdmin
    .from('lancamentos')
    .select('*')
    .eq('id', id)
    .single()

  if (getErr || !original) throw new Error('Lançamento não encontrado')

  // Estorno inverte o tipo para neutralizar o efeito no saldo
  const tipoEstorno = original.tipo === 'entrada' ? 'saida' : 'entrada'

  const { error } = await supabaseAdmin.from('lancamentos').insert({
    tipo: tipoEstorno,
    categoria_id: original.categoria_id,
    valor: original.valor,
    descricao: `ESTORNO: ${original.descricao}`,
    data: new Date().toISOString().slice(0, 10),
    grupo_id: original.grupo_id,
    membro_id: original.membro_id,
    status: 'confirmado',
    criado_por: perfil.id,
  })

  if (error) throw error
  revalidatePath('/admin/financeiro/entradas')
  revalidatePath('/admin/financeiro')
}

/** Editar lançamento não confirmado. Lançamentos confirmados são imutáveis (use estorno). */
export async function editarLancamentoAction(formData: FormData) {
  const perfil = await getPerfilAtual()
  if (!perfil) throw new Error('Não autenticado')

  const id = String(formData.get('id') ?? '').trim()
  const categoria_id = String(formData.get('categoria_id') ?? '').trim()
  const valor_str = String(formData.get('valor') ?? '0')
  const descricao = String(formData.get('descricao') ?? '').trim()
  const data = String(formData.get('data') ?? '').trim()
  const membro_id = String(formData.get('membro_id') ?? '').trim() || null
  const data_vencimento = String(formData.get('data_vencimento') ?? '').trim() || null

  if (!id) throw new Error('ID obrigatório')
  if (!categoria_id) throw new Error('Categoria obrigatória')
  if (!descricao) throw new Error('Descrição obrigatória')
  if (!data) throw new Error('Data obrigatória')

  const valor = parseCentavos(valor_str)
  if (valor <= 0) throw new Error('Valor inválido')

  // Buscar lançamento
  const { data: original, error: getErr } = await supabaseAdmin
    .from('lancamentos')
    .select('*')
    .eq('id', id)
    .single()

  if (getErr || !original) throw new Error('Lançamento não encontrado')
  if (original.status === 'confirmado') throw new Error('Lançamentos confirmados não podem ser editados. Use estorno.')

  // Atualizar
  const { error } = await supabaseAdmin
    .from('lancamentos')
    .update({
      categoria_id,
      valor,
      descricao,
      data,
      membro_id,
      data_vencimento,
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/financeiro/entradas')
  revalidatePath('/admin/financeiro')
}

// ── Categorias ───────────────────────────────────────────────

export async function criarSaidaAction(formData: FormData) {
  const perfil = await getPerfilAtual()
  if (!perfil) throw new Error('Não autenticado')

  const categoria_id = String(formData.get('categoria_id') ?? '').trim()
  const valor_str = String(formData.get('valor') ?? '0')
  const descricao = String(formData.get('descricao') ?? '').trim()
  const data = String(formData.get('data') ?? '').trim()
  const data_vencimento = String(formData.get('data_vencimento') ?? '').trim() || null
  const membro_id = String(formData.get('membro_id') ?? '').trim() || null
  const grupo_id = String(formData.get('grupo_id') ?? '').trim() || null

  if (!categoria_id) throw new Error('Categoria obrigatória')
  if (!descricao) throw new Error('Descrição obrigatória')
  if (!data) throw new Error('Data obrigatória')

  const valor = parseCentavos(valor_str)
  if (valor <= 0) throw new Error('Valor inválido')

  const { error } = await supabaseAdmin.from('lancamentos').insert({
    tipo: 'saida',
    categoria_id,
    valor,
    descricao,
    data,
    data_vencimento,
    membro_id,
    grupo_id,
    status: 'pendente',
    criado_por: perfil.id,
  })

  if (error) throw error
  revalidatePath('/admin/financeiro/saidas')
  revalidatePath('/admin/financeiro')
}

export async function marcarPagoAction(formData: FormData) {
  const perfil = await getPerfilAtual()
  if (!perfil) throw new Error('Não autenticado')

  const id = String(formData.get('id') ?? '').trim()
  const comprovante = formData.get('comprovante') as File | null

  if (!id) throw new Error('ID obrigatório')

  let comprovante_url: string | null = null
  if (comprovante && comprovante.size > 0) {
    const nomeArquivo = `${Date.now()}_${comprovante.name}`
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('comprovantes')
      .upload(nomeArquivo, comprovante, { contentType: comprovante.type, upsert: true })

    if (uploadErr) throw uploadErr
    comprovante_url = nomeArquivo
  }

  const payload: any = { status: 'pago', criado_por: perfil.id }
  if (comprovante_url) payload.comprovante_url = comprovante_url

  const { error } = await supabaseAdmin
    .from('lancamentos')
    .update({ ...payload, data_vencimento: null })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/financeiro/saidas')
}

export async function adicionarCategoriaAction(formData: FormData) {
  const nome = String(formData.get('nome') ?? '').trim()
  const tipo = String(formData.get('tipo') ?? 'entrada').trim()
  const icone = String(formData.get('icone') ?? '').trim() || null

  if (!nome) throw new Error('Nome obrigatório')
  if (!['entrada', 'saida'].includes(tipo)) throw new Error('Tipo inválido')

  const { error } = await supabaseAdmin
    .from('categorias_financeiro')
    .insert({ nome, tipo, icone, ativo: true })

  if (error) throw error
  revalidatePath('/admin/financeiro/configuracoes')
}

export async function editarCategoriaAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim()
  const nome = String(formData.get('nome') ?? '').trim()
  const icone = String(formData.get('icone') ?? '').trim() || null

  if (!id || !nome) throw new Error('ID e nome obrigatórios')

  const { error } = await supabaseAdmin
    .from('categorias_financeiro')
    .update({ nome, icone })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/financeiro/configuracoes')
}

export async function desativarCategoriaAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim()

  if (!id) throw new Error('ID obrigatório')

  const { count, error: countErr } = await supabaseAdmin
    .from('lancamentos')
    .select('id', { count: 'exact', head: true })
    .eq('categoria_id', id)

  if (countErr) throw countErr
  if (count && count > 0) {
    throw new Error('Categoria em uso não pode ser desativada')
  }

  const { error } = await supabaseAdmin
    .from('categorias_financeiro')
    .update({ ativo: false })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/financeiro/configuracoes')
}

export async function salvarConfiguracaoAction(formData: FormData) {
  const nome_igreja = String(formData.get('nome_igreja') ?? '').trim() || null
  const cnpj = String(formData.get('cnpj') ?? '').trim() || null
  const chave_pix = String(formData.get('chave_pix') ?? '').trim() || null

  const { data: existing, error: findError } = await supabaseAdmin
    .from('configuracoes_igreja')
    .select('*')
    .limit(1)
    .single()

  if (findError && findError.code !== 'PGRST116') throw findError

  if (existing?.id) {
    const { error } = await supabaseAdmin
      .from('configuracoes_igreja')
      .update({ nome_igreja, cnpj, chave_pix, updated_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (error) throw error
  } else {
    const { error } = await supabaseAdmin
      .from('configuracoes_igreja')
      .insert({ nome_igreja, cnpj, chave_pix, updated_at: new Date().toISOString() })

    if (error) throw error
  }

  revalidatePath('/admin/financeiro/configuracoes')
}
