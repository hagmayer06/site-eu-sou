import { supabase } from './supabase'
import type { PerfilUpdate } from './database.types'

/** Faz upload da foto de perfil e retorna a URL pública. */
export async function uploadFotoPerfil(userId: string, file: File) {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('fotos-perfil')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { url: null, error: uploadError }

  const { data } = supabase.storage.from('fotos-perfil').getPublicUrl(path)
  return { url: data.publicUrl, error: null }
}

// ===== Admin member operations =====

export type PerfilRow = {
  id: string
  nome: string
  telefone: string | null
  data_nascimento: string | null
  cep: string | null
  rua: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  foto_url: string | null
  grupo_id: string | null
  papeis: string[]
  ativo: boolean
  criado_em: string
}

export function temPapel(perfil: PerfilRow | null | undefined, papel: string) {
  return !!perfil && Array.isArray(perfil.papeis) && perfil.papeis.includes(papel)
}

export type AdminPerfilRow = Pick<PerfilRow, 'id' | 'nome' | 'telefone' | 'grupo_id' | 'papeis' | 'ativo' | 'criado_em'>

export async function getPerfil(userId: string) {
  const { data, error } = await supabase
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

  return data as PerfilRow
}

export type EnderecoViaCep = {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge?: string
  gia?: string
  ddd?: string
  siafi?: string
}

export async function fetchCep(cep: string): Promise<EnderecoViaCep> {
  const normalized = cep.replace(/\D/g, '')

  if (!/^\d{8}$/.test(normalized)) {
    throw new Error('CEP inválido')
  }

  const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`)
  if (!response.ok) {
    throw new Error('Falha ao consultar CEP')
  }

  const data = (await response.json()) as EnderecoViaCep & { erro?: boolean }

  if (data.erro) {
    throw new Error('CEP não encontrado')
  }

  return data
}

export async function listMembros() {
  const { data, error } = await supabase
    .from('perfis')
    .select('*')
    .order('nome', { ascending: true })

  if (error) throw error
  return (data ?? []) as PerfilRow[]
}

export async function updatePerfil(userId: string, data: Partial<PerfilRow>) {
  const { error } = await supabase
    .from('perfis')
    .update(data)
    .eq('id', userId)

  if (error) throw error
  return true
}

export async function setPapeis(userId: string, papeis: string[]) {
  const { data, error } = await supabase
    .from('perfis')
    .update({ papeis })
    .eq('id', userId)

  if (error) throw error
  return data
}

export async function setAtivo(userId: string, ativo: boolean) {
  const { data, error } = await supabase
    .from('perfis')
    .update({ ativo })
    .eq('id', userId)

  if (error) throw error
  return data
}

export async function getMembrosAdmin() {
  const { data, error } = await supabase
    .from('perfis')
    .select('id, nome, telefone, grupo_id, papeis, ativo, criado_em')
    .order('nome', { ascending: true })

  if (error) throw error
  return (data ?? []) as AdminPerfilRow[]
}

export async function getMembroAdmin(id: string) {
  const { data, error } = await supabase
    .from('perfis')
    .select('id, nome, telefone, grupo_id, papeis, ativo, criado_em')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as AdminPerfilRow
}

export async function setMembroAtivo(id: string, ativo: boolean) {
  const { data, error } = await supabase
    .from('perfis')
    .update({ ativo })
    .eq('id', id)

  if (error) throw error
  return data
}

export async function setMembroPapeis(id: string, papeis: string[]) {
  const { data, error } = await supabase
    .from('perfis')
    .update({ papeis })
    .eq('id', id)

  if (error) throw error
  return data
}

