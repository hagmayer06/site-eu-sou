import { supabase } from './supabase'
import type {
  CategoriaFinanceiroRow,
  LancamentoRow,
  LancamentoStatus,
  ConfiguracaoIgrejaRow,
} from './database.types'

export type LancamentoFiltro = {
  dataInicio?: string
  dataFim?: string
  status?: 'pendente' | 'pago' | 'vencido' | 'confirmado'
  tipo?: 'entrada' | 'saida'
  grupo_id?: string
  membro_id?: string
  categoria_id?: string
}

export type DashboardData = {
  saldoAtual: number // em centavos
  totalEntradaMes: number // centavos
  totalSaidaMes: number // centavos
  vencimentosProximos: LancamentoRow[]
}

export function centavosParaReais(centavos: number): number {
  return centavos / 100
}

export function reaisParaCentavos(reais: number): number {
  return Math.round(reais * 100)
}

/** Formata centavos para "R$ 1.500,00" */
export function formatarReais(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/** Converte string digitada ("1.500,00" ou "1500,00") para centavos inteiros */
export function parseCentavos(valor: string): number {
  const normalizado = valor
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const num = parseFloat(normalizado)
  if (isNaN(num) || num <= 0) return 0
  return Math.round(num * 100)
}

export function calcularDashboardData(
  lancamentos: LancamentoRow[],
  diasProximos = 7
): DashboardData {
  const today = new Date()
  const inicioMes = new Date(today.getFullYear(), today.getMonth(), 1)
  const fimMes = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  let totalEntradaMes = 0
  let totalSaidaMes = 0

  const proximos = [] as LancamentoRow[]
  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + diasProximos)

  for (const l of lancamentos) {
    const data = new Date(l.data)

    if (data >= inicioMes && data <= fimMes) {
      if (l.tipo === 'entrada') totalEntradaMes += l.valor
      if (l.tipo === 'saida') totalSaidaMes += l.valor
    }

    if (l.data_vencimento) {
      const venc = new Date(l.data_vencimento)
      if (venc >= today && venc <= maxDate) {
        proximos.push(l)
      }
    }
  }

  const saldoAtual = totalEntradaMes - totalSaidaMes

  proximos.sort((a, b) => {
    if (!a.data_vencimento || !b.data_vencimento) return 0
    return new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime()
  })

  return { saldoAtual, totalEntradaMes, totalSaidaMes, vencimentosProximos: proximos }
}

export async function getCategorias(): Promise<CategoriaFinanceiroRow[]> {
  const { data, error } = await supabase
    .from('categorias_financeiro')
    .select('*')
    .eq('ativo', true)
    .order('nome', { ascending: true })

  if (error) throw error
  return (data ?? []) as CategoriaFinanceiroRow[]
}

export async function getLancamentos(filtro: LancamentoFiltro = {}): Promise<LancamentoRow[]> {
  let query = supabase.from('lancamentos').select('*')

  if (filtro.dataInicio) query = query.gte('data', filtro.dataInicio)
  if (filtro.dataFim) query = query.lte('data', filtro.dataFim)
  if (filtro.status) query = query.eq('status', filtro.status)
  if (filtro.tipo) query = query.eq('tipo', filtro.tipo)
  if (filtro.grupo_id) query = query.eq('grupo_id', filtro.grupo_id)
  if (filtro.membro_id) query = query.eq('membro_id', filtro.membro_id)
  if (filtro.categoria_id) query = query.eq('categoria_id', filtro.categoria_id)

  const { data, error } = await query.order('data', { ascending: false })

  if (error) throw error
  return (data ?? []) as LancamentoRow[]
}

export function calcularStatus(dataVencimento: string | null, statusAtual: LancamentoStatus, hoje: string = new Date().toISOString().slice(0, 10)): LancamentoStatus {
  if (statusAtual === 'pago' || statusAtual === 'confirmado') return statusAtual
  if (!dataVencimento) return 'pendente'

  return dataVencimento < hoje ? 'vencido' : 'pendente'
}

export async function atualizarVencidos(): Promise<number> {
  const hoje = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('lancamentos')
    .update({ status: 'vencido' })
    .lt('data_vencimento', hoje)
    .eq('status', 'pendente')

  if (error) throw error
  return (data ?? []).length
}

export async function getVencimentosProximos(dias = 7): Promise<LancamentoRow[]> {
  const hoje = new Date().toISOString().slice(0, 10)
  const final = new Date()
  final.setDate(final.getDate() + dias)
  const finalStr = final.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('lancamentos')
    .select('*')
    .in('status', ['pendente', 'vencido'])
    .gte('data_vencimento', hoje)
    .lte('data_vencimento', finalStr)
    .order('data_vencimento', { ascending: true })

  if (error) throw error
  return (data ?? []) as LancamentoRow[]
}

export async function getComprovantesNaoConfirmados(): Promise<LancamentoRow[]> {
  const { data, error } = await supabase
    .from('lancamentos')
    .select('*')
    .in('status', ['pendente', 'vencido'])
    .not('comprovante_url', 'is', null)
    .order('data', { ascending: false })

  if (error) throw error
  return (data ?? []) as LancamentoRow[]
}

export async function getHistoricoMembro(
  membroId: string,
  ano?: number
): Promise<LancamentoRow[]> {
  let query = supabase
    .from('lancamentos')
    .select('*')
    .eq('membro_id', membroId)

  if (ano) {
    const inicio = `${ano}-01-01`
    const fim = `${ano}-12-31`
    query = query.gte('data', inicio).lte('data', fim)
  }

  const { data, error } = await query.order('data', { ascending: false })

  if (error) throw error
  return (data ?? []) as LancamentoRow[]
}

export async function getConfiguracaoIgreja(): Promise<ConfiguracaoIgrejaRow | null> {
  const { data, error } = await supabase
    .from('configuracoes_igreja')
    .select('*')
    .single()

  if (error) {
    if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
      return null
    }
    throw error
  }

  return data as ConfiguracaoIgrejaRow
}

export async function getDashboardData(diasProximos = 7): Promise<DashboardData> {
  const lancamentos = await getLancamentos({})
  const vencimentosProximos = await getVencimentosProximos(diasProximos)
  const calculado = calcularDashboardData(lancamentos, diasProximos)
  return { ...calculado, vencimentosProximos }
}
