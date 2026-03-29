import { describe, expect, it } from 'vitest'
import {
  centavosParaReais,
  reaisParaCentavos,
  formatarReais,
  parseCentavos,
  calcularDashboardData,
} from './financeiroQueries'

describe('financeiroQueries util', () => {
  it('converte centavos para reais corretamente', () => {
    expect(centavosParaReais(12345)).toBe(123.45)
    expect(centavosParaReais(0)).toBe(0)
  })

  it('converte reais para centavos corretamente', () => {
    expect(reaisParaCentavos(123.45)).toBe(12345)
    expect(reaisParaCentavos(0)).toBe(0)
    expect(reaisParaCentavos(1.234)).toBe(123)
  })

  it('formata centavos para reais (R$)', () => {
    // Note: toLocaleString pode inserir non-breaking space, então normalizamos para comparação
    const normalize = (s: string) => s.replace(/\u00A0/g, ' ')
    expect(normalize(formatarReais(150000))).toBe('R$ 1.500,00')
    expect(normalize(formatarReais(0))).toBe('R$ 0,00')
    expect(normalize(formatarReais(50))).toBe('R$ 0,50')
    expect(normalize(formatarReais(1000))).toBe('R$ 10,00')
  })

  it('converte string de valor para centavos', () => {
    expect(parseCentavos('1500,00')).toBe(150000)
    expect(parseCentavos('1.500,00')).toBe(150000)
    expect(parseCentavos('R$ 1.500,00')).toBe(150000)
    expect(parseCentavos('0')).toBe(0)
    expect(parseCentavos('inválido')).toBe(0)
  })

  it('calcula dashboard data com saldo e proximidades', () => {
    const lancamentos = [
      { id: '1', tipo: 'entrada', categoria_id: '1', valor: 10000, descricao: 'd', data: new Date().toISOString().slice(0,10), grupo_id: null, membro_id: null, data_vencimento: null, status: 'confirmado', comprovante_url: null, criado_por: 'u1', criado_em: new Date().toISOString() },
      { id: '2', tipo: 'saida', categoria_id: '2', valor: 2500, descricao: 'd', data: new Date().toISOString().slice(0,10), grupo_id: null, membro_id: null, data_vencimento: null, status: 'confirmado', comprovante_url: null, criado_por: 'u1', criado_em: new Date().toISOString() },
      { id: '3', tipo: 'entrada', categoria_id: '1', valor: 5000, descricao: 'd', data: new Date().toISOString().slice(0,10), grupo_id: null, membro_id: null, data_vencimento: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().slice(0,10), status: 'pendente', comprovante_url: null, criado_por: 'u1', criado_em: new Date().toISOString() },
    ]

    const result = calcularDashboardData(lancamentos, 7)
    expect(result.totalEntradaMes).toBe(15000)
    expect(result.totalSaidaMes).toBe(2500)
    expect(result.saldoAtual).toBe(12500)
    expect(result.vencimentosProximos.length).toBe(1)
  })
})
