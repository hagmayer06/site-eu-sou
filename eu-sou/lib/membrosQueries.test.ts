import { describe, expect, it, vi } from 'vitest'
import { temPapel, fetchCep } from './membrosQueries'

describe('temPapel', () => {
  it('retorna true quando o perfil tem o papel', () => {
    const perfil = { papeis: ['membro', 'pastor'] }
    expect(temPapel(perfil as any, 'pastor')).toBe(true)
  })

  it('retorna false quando papel não existe', () => {
    const perfil = { papeis: ['membro'] }
    expect(temPapel(perfil as any, 'tesoureiro')).toBe(false)
  })

  it('retorna false quando perfil é null', () => {
    expect(temPapel(null as any, 'membro')).toBe(false)
  })
})

describe('fetchCep', () => {
  const cepMock = {
    cep: '01001-000',
    logradouro: 'Praça da Sé',
    complemento: 'lado ímpar',
    bairro: 'Sé',
    localidade: 'São Paulo',
    uf: 'SP',
  }

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('resolve cep válido', async () => {
    const mock = global.fetch as unknown as vi.Mock
    mock.mockResolvedValue({ ok: true, json: async () => cepMock })

    const result = await fetchCep('01001-000')
    expect(result.localidade).toBe('São Paulo')
    expect(result.uf).toBe('SP')
  })

  it('lança erro para cep inválido', async () => {
    await expect(fetchCep('123')).rejects.toThrow('CEP inválido')
  })

  it('lança erro quando API retorna erro', async () => {
    const mock = global.fetch as unknown as vi.Mock
    mock.mockResolvedValue({ ok: true, json: async () => ({ erro: true }) })

    await expect(fetchCep('01001-000')).rejects.toThrow('CEP não encontrado')
  })
})
