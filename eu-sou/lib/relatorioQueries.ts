import type { LancamentoRow } from './database.types'
import { formatarReais } from './financeiroQueries'

/**
 * Gera CSV com separador ponto-e-vírgula (padrão pt-BR).
 * @param lancamentos - lista de lançamentos a exportar
 * @param categorias  - mapa opcional de categoria_id → nome legível
 */
export function gerarCSV(
  lancamentos: LancamentoRow[],
  categorias: Map<string, string> = new Map(),
): string {
  const cabecalho = [
    'Data',
    'Tipo',
    'Descrição',
    'Categoria',
    'Valor',
    'Status',
    'Vencimento',
  ].join(';')

  const linhas = lancamentos.map((l) => {
    const categoria = categorias.get(l.categoria_id) ?? l.categoria_id
    const descricao = l.descricao.replace(/"/g, '""')
    return [
      l.data,
      l.tipo,
      `"${descricao}"`,
      `"${categoria}"`,
      formatarReais(l.valor),
      l.status,
      l.data_vencimento ?? '',
    ].join(';')
  })

  return [cabecalho, ...linhas].join('\n')
}
