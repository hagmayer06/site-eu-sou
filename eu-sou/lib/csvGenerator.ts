import type { LancamentoRow } from './database.types'
import { formatarReais } from './financeiroQueries'

/**
 * Gera CSV a partir de array de lançamentos.
 * Utiliza BOM (Byte Order Mark) para melhor compatibilidade com Excel.
 */
export function gerarCSV(
  lancamentos: LancamentoRow[],
  nomeArquivo: string = 'relatorio.csv'
): void {
  const header = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Status', 'Membro']
  const rows = lancamentos.map((l) => [
    new Date(l.data).toLocaleDateString('pt-BR'),
    l.tipo === 'entrada' ? 'Entrada' : 'Saída',
    l.categoria_id, // TODO: buscar nome da categoria
    l.descricao,
    (l.valor / 100).toFixed(2).replace('.', ','),
    l.status,
    l.membro_id ?? '—',
  ])

  // Construir CSV com BOM (UTF-8 com BOM)
  const csv = [
    '\uFEFF', // BOM para Excel reconhecer UTF-8
    header.map(escaparCSV).join(','),
    ...rows.map((row) => row.map(escaparCSV).join(',')),
  ].join('\n')

  // Criar blob e trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', nomeArquivo)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Limpar URL
  URL.revokeObjectURL(url)
}

/**
 * Formata CSV com escape de aspas para campos com vírgula/aspas
 */
function escaparCSV(str: string): string {
  if (str == null) return '""'
  const s = String(str).trim()
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/**
 * Gera CSV de contribuições anuais de um membro
 */
export function gerarCSVContribuicao(
  lancamentos: LancamentoRow[],
  nomeMembro: string,
  ano: number
): void {
  const header = ['Data', 'Tipo', 'Valor (R$)', 'Status']
  const rows = lancamentos
    .filter((l) => {
      const year = new Date(l.data).getFullYear()
      return year === ano
    })
    .map((l) => [
      new Date(l.data).toLocaleDateString('pt-BR'),
      l.descricao.includes('dízimo') ? 'Dízimo' : 'Oferta',
      (l.valor / 100).toFixed(2).replace('.', ','),
      l.status === 'confirmado' ? 'Confirmado' : 'Pendente',
    ])

  const total = lancamentos
    .filter((l) => {
      const year = new Date(l.data).getFullYear()
      return year === ano && l.status === 'confirmado'
    })
    .reduce((sum, l) => sum + l.valor, 0)

  const csv = [
    '\uFEFF',
    `Relatório de Contribuições - ${nomeMembro} (${ano})`,
    '',
    header.map(escaparCSV).join(','),
    ...rows.map((row) => row.map(escaparCSV).join(',')),
    '',
    `Total Confirmado,,"${(total / 100).toFixed(2).replace('.', ',')}"`,
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  const nomeArquivo = `${nomeMembro.replace(/\s+/g, '_')}_${ano}.csv`
  link.setAttribute('href', url)
  link.setAttribute('download', nomeArquivo)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
