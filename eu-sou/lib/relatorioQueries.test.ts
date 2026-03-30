import { describe, expect, it } from 'vitest'
import { gerarCSV } from './relatorioQueries'
import type { LancamentoRow } from './database.types'

function lancamento(overrides: Partial<LancamentoRow> = {}): LancamentoRow {
  return {
    id: '1',
    tipo: 'entrada',
    categoria_id: 'cat-1',
    valor: 10000,
    descricao: 'Dízimo',
    data: '2025-10-01',
    grupo_id: null,
    membro_id: null,
    data_vencimento: null,
    status: 'confirmado',
    comprovante_url: null,
    criado_por: 'user-1',
    criado_em: '2025-10-01T00:00:00Z',
    ...overrides,
  }
}

describe('gerarCSV', () => {
  it('retorna apenas cabeçalho para lista vazia', () => {
    const csv = gerarCSV([])
    const linhas = csv.split('\n')
    expect(linhas).toHaveLength(1)
    expect(linhas[0]).toBe('Data;Tipo;Descrição;Categoria;Valor;Status;Vencimento')
  })

  it('gera cabeçalho correto com separador ponto-e-vírgula', () => {
    const csv = gerarCSV([])
    expect(csv.startsWith('Data;Tipo;Descrição;Categoria;Valor;Status;Vencimento')).toBe(true)
  })

  it('formata lançamento corretamente', () => {
    const csv = gerarCSV([lancamento()])
    const linhas = csv.split('\n')
    expect(linhas).toHaveLength(2)
    const campos = linhas[1].split(';')
    expect(campos[0]).toBe('2025-10-01')            // data
    expect(campos[1]).toBe('entrada')               // tipo
    expect(campos[2]).toBe('"Dízimo"')              // descrição entre aspas
    expect(campos[3]).toBe('"cat-1"')               // categoria_id (sem mapa)
    expect(campos[4]).toContain('100')              // valor formatado em R$
    expect(campos[5]).toBe('confirmado')            // status
    expect(campos[6]).toBe('')                      // vencimento vazio
  })

  it('usa nome de categoria quando mapa é fornecido', () => {
    const categorias = new Map([['cat-1', 'Dízimos']])
    const csv = gerarCSV([lancamento()], categorias)
    const linha = csv.split('\n')[1]
    expect(linha).toContain('"Dízimos"')
  })

  it('usa categoria_id quando mapa não contém o id', () => {
    const categorias = new Map([['cat-outro', 'Outro']])
    const csv = gerarCSV([lancamento()], categorias)
    const linha = csv.split('\n')[1]
    expect(linha).toContain('"cat-1"')
  })

  it('escapa aspas duplas dentro de descrições', () => {
    const csv = gerarCSV([lancamento({ descricao: 'Oferta "especial"' })])
    const linha = csv.split('\n')[1]
    expect(linha).toContain('"Oferta ""especial"""')
  })

  it('preenche coluna Vencimento quando data_vencimento existe', () => {
    const csv = gerarCSV([lancamento({ data_vencimento: '2025-11-01' })])
    const linha = csv.split('\n')[1]
    const campos = linha.split(';')
    expect(campos[6]).toBe('2025-11-01')
  })

  it('gera múltiplas linhas para múltiplos lançamentos', () => {
    const lista = [
      lancamento({ id: '1', data: '2025-10-01' }),
      lancamento({ id: '2', data: '2025-10-02', tipo: 'saida', valor: 5000 }),
    ]
    const csv = gerarCSV(lista)
    const linhas = csv.split('\n')
    expect(linhas).toHaveLength(3) // cabeçalho + 2 linhas
    expect(linhas[1]).toContain('2025-10-01')
    expect(linhas[2]).toContain('2025-10-02')
    expect(linhas[2]).toContain('saida')
  })
})
