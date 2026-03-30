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

// ── Comprovantes (Contribuição de Membros) ───────────────────

/** Membro envia comprovante de contribuição via Pix. */
export async function enviarComprovanteMembro(formData: FormData) {
  const perfil = await getPerfilAtual()
  if (!perfil) throw new Error('Não autenticado')

  const tipo_str = String(formData.get('tipo') ?? '').trim()
  const valor_str = String(formData.get('valor') ?? '0')
  const comprovante = formData.get('comprovante') as File | null

  if (!tipo_str || !['dízimo', 'oferta'].includes(tipo_str)) {
    throw new Error('Tipo inválido (dízimo ou oferta)')
  }

  const valor = parseCentavos(valor_str)
  if (valor <= 0) throw new Error('Valor inválido')
  
  if (!comprovante || comprovante.size === 0) {
    throw new Error('Comprovante obrigatório')
  }

  // Validar tamanho máximo (10 MB)
  const maxSizeMB = 10
  if (comprovante.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`Arquivo não pode exceder ${maxSizeMB}MB`)
  }

  // Upload do comprovante
  const nomeArquivo = `${perfil.id}_${Date.now()}_${comprovante.name}`
  const { error: uploadErr } = await supabaseAdmin.storage
    .from('comprovantes')
    .upload(nomeArquivo, comprovante, {
      contentType: comprovante.type,
      upsert: false,
    })

  if (uploadErr) throw uploadErr

  // Mapear tipo de contribuição para categoria
  // Procurar categoria de entrada que corresponda a "dízimo" ou "oferta"
  const { data: categorias, error: catErr } = await supabaseAdmin
    .from('categorias_financeiro')
    .select('id')
    .eq('tipo', 'entrada')
    .or(`nome.ilike.%dízimo%,nome.ilike.%oferta%`)
    .limit(1)

  if (catErr) throw catErr
  
  const categoria_id = categorias?.[0]?.id
  if (!categoria_id) throw new Error('Categoria de entrada não configurada')

  // Criar lançamento com status pendente
  const { error: insertErr } = await supabaseAdmin.from('lancamentos').insert({
    tipo: 'entrada',
    categoria_id,
    valor,
    descricao: `${tipo_str} - Comprovante enviado por ${perfil.nome}`,
    data: new Date().toISOString().slice(0, 10),
    membro_id: perfil.id,
    grupo_id: perfil.grupo_id,
    status: 'pendente',
    comprovante_url: nomeArquivo,
    criado_por: perfil.id,
  })

  if (insertErr) throw insertErr

  revalidatePath('/membro/contribuir')
  revalidatePath('/admin/financeiro/comprovantes')
}

/** Tesoureiro confirma comprovante e ajusta valor se necessário. */
export async function confirmarComprovante(formData: FormData) {
  const perfil = await getPerfilAtual()
  if (!perfil) throw new Error('Não autenticado')

  // Validar permissão
  if (!perfil.papeis?.includes('tesoureiro')) {
    throw new Error('Apenas tesoureiros podem confirmar comprovantes')
  }

  const lancamento_id = String(formData.get('lancamento_id') ?? '').trim()
  const valor_confirmado_str = String(formData.get('valor_confirmado') ?? '').trim()

  if (!lancamento_id) throw new Error('ID do lançamento obrigatório')

  // Buscar lançamento
  const { data: lancamento, error: getErr } = await supabaseAdmin
    .from('lancamentos')
    .select('*')
    .eq('id', lancamento_id)
    .single()

  if (getErr || !lancamento) throw new Error('Lançamento não encontrado')
  if (lancamento.status !== 'pendente') {
    throw new Error('Apenas comprovantes pendentes podem ser confirmados')
  }
  if (!lancamento.comprovante_url) {
    throw new Error('Lançamento não possui comprovante')
  }

  // Usar valor confirmado ou manter o informado
  let valor_final = lancamento.valor
  if (valor_confirmado_str.trim()) {
    valor_final = parseCentavos(valor_confirmado_str)
    if (valor_final <= 0) throw new Error('Valor confirmado inválido')
  }

  // Atualizar lançamento para confirmado
  const { error: updateErr } = await supabaseAdmin
    .from('lancamentos')
    .update({
      status: 'confirmado',
      valor: valor_final,
      criado_por: perfil.id,
    })
    .eq('id', lancamento_id)

  if (updateErr) throw updateErr

  revalidatePath('/admin/financeiro/comprovantes')
  revalidatePath('/membro/contribuir')
}

// ── Relatórios e Declarações PDF ─────────────────────────────

/** Gera PDF de relatório financeiro. */
export async function gerarRelatorioPDFAction(
  dataInicio: string,
  dataFim: string,
  tipo?: 'entrada' | 'saida'
): Promise<Buffer> {
  const perfil = await getPerfilAtual()
  if (!perfil) throw new Error('Não autenticado')

  if (!perfil.papeis?.includes('tesoureiro')) {
    throw new Error('Apenas tesoureiros podem gerar relatórios')
  }

  // Buscar lançamentos no período
  let query = supabaseAdmin
    .from('lancamentos')
    .select('*')
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: true })

  if (tipo && ['entrada', 'saida'].includes(tipo)) {
    query = query.eq('tipo', tipo)
  }

  const { data: lancamentos, error } = await query

  if (error) throw error

  // Buscar categorias
  const { data: categorias, error: catError } = await supabaseAdmin
    .from('categorias_financeiro')
    .select('id, nome')

  if (catError) throw catError

  const categoriaMap = new Map(categorias?.map((c: any) => [c.id, c.nome]) ?? [])

  // Buscar configuração da Igreja
  const { data: config } = await supabaseAdmin
    .from('configuracoes_igreja')
    .select('*')
    .single()

  // Importar dinamicamente para renderizar no servidor
  const { renderToBuffer } = await import('@react-pdf/renderer')
  const React = await import('react')

  // Renderizar PDF
  const titulo = tipo
    ? tipo === 'entrada'
      ? 'Relatório de Entradas'
      : 'Relatório de Saídas'
    : 'Relatório de Fluxo de Caixa'

  const { RelatorioPDF } = await import('@/components/financeiro/RelatorioPDF')

  const pdfDoc = RelatorioPDF({
    config: config || null,
    lancamentos: lancamentos ?? [],
    categorias: categoriaMap,
    dataInicio,
    dataFim,
    titulo,
  } as any)

  const pdfBuffer = await renderToBuffer(pdfDoc)
  return pdfBuffer
}

/** Gera PDF de declaração anual de contribuição de um membro. */
export async function gerarDeclaracaoAction(
  membroId: string,
  ano: number
): Promise<Buffer> {
  const perfil = await getPerfilAtual()
  if (!perfil) throw new Error('Não autenticado')

  // Apenas tesoureiro pode gerar declaração de outro membro
  // Membro pode gerar sua própria declaração
  const ehMesmoMembro = perfil.id === membroId
  const ehTesoureiro = perfil.papeis?.includes('tesoureiro')

  if (!ehMesmoMembro && !ehTesoureiro) {
    throw new Error('Sem permissão para gerar esta declaração')
  }

  // Buscar perfil do membro
  const { data: membroPerfil, error: perfilError } = await supabaseAdmin
    .from('perfis')
    .select('nome')
    .eq('id', membroId)
    .single()

  if (perfilError || !membroPerfil) throw new Error('Membro não encontrado')

  // Buscar lançamentos confirmados do membro
  const { data: lancamentos, error: lancError } = await supabaseAdmin
    .from('lancamentos')
    .select('*')
    .eq('membro_id', membroId)
    .eq('status', 'confirmado')
    .not('comprovante_url', 'is', null)

  if (lancError) throw lancError

  // Buscar categorias
  const { data: categorias } = await supabaseAdmin
    .from('categorias_financeiro')
    .select('id, nome')

  const categoriaMap = new Map(categorias?.map((c: any) => [c.id, c.nome]) ?? [])

  // Buscar configuração da Igreja
  const { data: config } = await supabaseAdmin
    .from('configuracoes_igreja')
    .select('*')
    .single()

  // Importar dinamicamente
  const { renderToBuffer } = await import('@react-pdf/renderer')

  const { DeclaracaoPDF } = await import('@/components/financeiro/DeclaracaoPDF')

  const pdfDoc = DeclaracaoPDF({
    config: config || null,
    nomeMembro: membroPerfil.nome,
    ano,
    lancamentos: lancamentos ?? [],
    categoriasPorLancamento: categoriaMap,
  } as any)

  const pdfBuffer = await renderToBuffer(pdfDoc)
  return pdfBuffer
}
