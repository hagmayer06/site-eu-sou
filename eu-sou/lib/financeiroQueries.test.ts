import { describe, expect, it } from 'vitest'
import {
  centavosParaReais,
  reaisParaCentavos,
  formatarReais,
  parseCentavos,
  calcularDashboardData,
  calcularUltimos6Meses,
  calcularStatus,
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

  it('calcularUltimos6Meses retorna 6 entradas com meses corretos, incluindo meses sem lançamento', () => {
    const hoje = new Date(2025, 9, 15) // outubro 2025
    const lancamentos = [
      // agosto 2025 — só entrada
      { id: '1', tipo: 'entrada', categoria_id: 'c1', valor: 5000, descricao: 'd', data: '2025-08-10', grupo_id: null, membro_id: null, data_vencimento: null, status: 'confirmado', comprovante_url: null, criado_por: 'u1', criado_em: '' },
      // outubro 2025 — entrada + saída
      { id: '2', tipo: 'entrada', categoria_id: 'c1', valor: 10000, descricao: 'd', data: '2025-10-01', grupo_id: null, membro_id: null, data_vencimento: null, status: 'confirmado', comprovante_url: null, criado_por: 'u1', criado_em: '' },
      { id: '3', tipo: 'saida', categoria_id: 'c2', valor: 3000, descricao: 'd', data: '2025-10-05', grupo_id: null, membro_id: null, data_vencimento: null, status: 'pago', comprovante_url: null, criado_por: 'u1', criado_em: '' },
      // janeiro 2026 — fora da janela
      { id: '4', tipo: 'entrada', categoria_id: 'c1', valor: 9999, descricao: 'd', data: '2026-01-01', grupo_id: null, membro_id: null, data_vencimento: null, status: 'confirmado', comprovante_url: null, criado_por: 'u1', criado_em: '' },
    ]

    const result = calcularUltimos6Meses(lancamentos, hoje)

    expect(result).toHaveLength(6)
    // Últimos 6 meses a partir de outubro 2025: mai, jun, jul, ago, set, out
    const mesKeys = result.map(m => m.mesKey)
    expect(mesKeys).toEqual(['2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10'])

    // Meses sem lançamento devem ter zeros
    const maio = result.find(m => m.mesKey === '2025-05')!
    expect(maio.entradas).toBe(0)
    expect(maio.saidas).toBe(0)

    const setembro = result.find(m => m.mesKey === '2025-09')!
    expect(setembro.entradas).toBe(0)
    expect(setembro.saidas).toBe(0)

    // Agosto: só entrada
    const agosto = result.find(m => m.mesKey === '2025-08')!
    expect(agosto.entradas).toBe(5000)
    expect(agosto.saidas).toBe(0)

    // Outubro: entrada + saída
    const outubro = result.find(m => m.mesKey === '2025-10')!
    expect(outubro.entradas).toBe(10000)
    expect(outubro.saidas).toBe(3000)

    // Lançamento fora da janela não aparece
    const totalEntradas = result.reduce((s, m) => s + m.entradas, 0)
    expect(totalEntradas).toBe(15000) // 5000 + 10000
  })

  describe('calcularStatus', () => {
    const hoje = '2025-10-15'

    it('retorna status atual quando pago ou confirmado (ignora data)', () => {
      expect(calcularStatus('2020-01-01', 'pago', hoje)).toBe('pago')
      expect(calcularStatus(null, 'pago', hoje)).toBe('pago')
      expect(calcularStatus('2020-01-01', 'confirmado', hoje)).toBe('confirmado')
      expect(calcularStatus(null, 'confirmado', hoje)).toBe('confirmado')
    })

    it('retorna pendente quando sem data_vencimento', () => {
      expect(calcularStatus(null, 'pendente', hoje)).toBe('pendente')
      expect(calcularStatus(null, 'vencido', hoje)).toBe('pendente')
    })

    it('retorna vencido quando data_vencimento é anterior a hoje', () => {
      expect(calcularStatus('2025-10-14', 'pendente', hoje)).toBe('vencido')
      expect(calcularStatus('2025-01-01', 'pendente', hoje)).toBe('vencido')
    })

    it('retorna pendente quando data_vencimento é hoje ou futura', () => {
      expect(calcularStatus('2025-10-15', 'pendente', hoje)).toBe('pendente')
      expect(calcularStatus('2025-12-31', 'pendente', hoje)).toBe('pendente')
    })
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
