import { supabase } from './supabase'
import type {
  GrupoRow,
  MembroGrupoRow,
  ReuniaoGrupoRow,
  AvisoGrupoRow,
  PerfilRow,
} from './database.types'

/**
 * Filtros opcionais para listagem de grupos
 */
export type GrupoFiltro = {
  ativo?: boolean
  search?: string
  lider_id?: string
}

/**
 * Resultado expandido: Grupo com membros associados
 */
export type GrupoComMembros = GrupoRow & {
  membros: MembroGrupoRow[]
  lider?: PerfilRow
}

/**
 * Resultado expandido: Grupo com membros + reuniões + avisos
 */
export type GrupoComDetalhes = GrupoComMembros & {
  reunioes: ReuniaoGrupoRow[]
  avisos: AvisoGrupoRow[]
}

/**
 * Membro com dados do perfil
 */
export type MembroGrupoComPerfil = MembroGrupoRow & {
  perfil?: PerfilRow
}

/**
 * Bounding box (mapa): grupo com localização
 */
export type GrupoBoundingBox = {
  id: string
  nome: string
  latitude: number | null
  longitude: number | null
  email: string
  lider_id: string
}

/**
 * Lista grupos com filtros opcionais
 * @param filtro - ativo, search (por nome/email), lider_id
 * @returns Array de grupos
 */
export async function getGrupos(filtro?: GrupoFiltro): Promise<GrupoRow[]> {
  let query = supabase
    .from('grupos')
    .select('*')
    .order('criado_em', { ascending: false })

  if (filtro?.ativo !== undefined) {
    query = query.eq('ativo', filtro.ativo)
  }

  if (filtro?.search) {
    query = query.or(`nome.ilike.%${filtro.search}%,email.ilike.%${filtro.search}%`)
  }

  if (filtro?.lider_id) {
    query = query.eq('lider_id', filtro.lider_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar grupos:', error)
    return []
  }

  return data ?? []
}

/**
 * Obtém um grupo específico por ID
 * @param id - ID do grupo
 * @returns Grupo completo com membros, ou null se não encontrado/sem permissão
 */
export async function getGrupoById(id: string): Promise<GrupoComMembros | null> {
  const { data: grupo, error } = await supabase
    .from('grupos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar grupo:', error)
    return null
  }

  if (!grupo) return null

  // Busca membros do grupo
  const { data: membros } = await supabase
    .from('membros_grupo')
    .select('*')
    .eq('grupo_id', id)
    .order('data_entrada', { ascending: false })

  // Busca dados do lider
  const { data: lider } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', grupo.lider_id)
    .single()

  return {
    ...grupo,
    membros: membros ?? [],
    lider,
  }
}

/**
 * Obtém um grupo com todos os detalhes: membros, reuniões, avisos
 * @param id - ID do grupo
 * @returns Grupo com detalhes completos, ou null
 */
export async function getGrupoComDetalhes(id: string): Promise<GrupoComDetalhes | null> {
  const grupoComMembros = await getGrupoById(id)
  if (!grupoComMembros) return null

  // Busca reuniões
  const { data: reunioes } = await supabase
    .from('reunioes_grupo')
    .select('*')
    .eq('grupo_id', id)
    .order('dia_semana', { ascending: true })

  // Busca avisos recentes
  const { data: avisos } = await supabase
    .from('avisos_grupo')
    .select('*')
    .eq('grupo_id', id)
    .order('criado_em', { ascending: false })
    .limit(10)

  return {
    ...grupoComMembros,
    reunioes: reunioes ?? [],
    avisos: avisos ?? [],
  }
}

/**
 * Lista membros de um grupo específico
 * @param grupoId - ID do grupo
 * @param filtro - filtrar apenas ativos, por cargo, etc.
 * @returns Array de membros com dados do perfil
 */
export async function getMembrosGrupo(
  grupoId: string,
  filtro?: { ativo?: boolean; cargo?: string }
): Promise<MembroGrupoComPerfil[]> {
  let query = supabase
    .from('membros_grupo')
    .select('*')
    .eq('grupo_id', grupoId)

  if (filtro?.ativo !== undefined) {
    query = query.eq('ativo', filtro.ativo)
  }

  if (filtro?.cargo) {
    query = query.eq('cargo', filtro.cargo)
  }

  const { data: membros, error } = await query.order('data_entrada', { ascending: false })

  if (error) {
    console.error('Erro ao buscar membros do grupo:', error)
    return []
  }

  if (!membros) return []

  // Enriquece com dados de perfil
  const membrosComPerfil = await Promise.all(
    membros.map(async (m) => {
      const { data: perfil } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', m.perfil_id)
        .single()

      return { ...m, perfil }
    })
  )

  return membrosComPerfil
}

/**
 * Conta de membros ativos em um grupo
 * @param grupoId - ID do grupo
 * @returns Numero de membros ativos
 */
export async function countMembrosAtivosGrupo(grupoId: string): Promise<number> {
  const { count, error } = await supabase
    .from('membros_grupo')
    .select('id', { count: 'exact' })
    .eq('grupo_id', grupoId)
    .eq('ativo', true)

  if (error) {
    console.error('Erro ao contar membros:', error)
    return 0
  }

  return count ?? 0
}

/**
 * Lista reuniões de um grupo
 * @param grupoId - ID do grupo
 * @returns Array de reuniões ordenadas por dia da semana
 */
export async function getReunioesGrupo(grupoId: string): Promise<ReuniaoGrupoRow[]> {
  const { data, error } = await supabase
    .from('reunioes_grupo')
    .select('*')
    .eq('grupo_id', grupoId)
    .order('dia_semana', { ascending: true })

  if (error) {
    console.error('Erro ao buscar reuniões:', error)
    return []
  }

  return data ?? []
}

/**
 * Obtém reuniões para um dia específico da semana
 * @param grupoId - ID do grupo
 * @param diaSemana - 0=seg, 6=dom
 * @returns Array de reuniões do dia
 */
export async function getReunioesGrupoPorDia(
  grupoId: string,
  diaSemana: number
): Promise<ReuniaoGrupoRow[]> {
  const { data, error } = await supabase
    .from('reunioes_grupo')
    .select('*')
    .eq('grupo_id', grupoId)
    .eq('dia_semana', diaSemana)
    .order('horario', { ascending: true })

  if (error) {
    console.error('Erro ao buscar reuniões do dia:', error)
    return []
  }

  return data ?? []
}

/**
 * Lista avisos de um grupo
 * @param grupoId - ID do grupo
 * @param limit - número máximo de avisos a retornar (default 10)
 * @returns Array de avisos recentes (DESC por criado_em)
 */
export async function getAvisosGrupo(grupoId: string, limit = 10): Promise<AvisoGrupoRow[]> {
  const { data, error } = await supabase
    .from('avisos_grupo')
    .select('*')
    .eq('grupo_id', grupoId)
    .order('criado_em', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Erro ao buscar avisos:', error)
    return []
  }

  return data ?? []
}

/**
 * Lista avisos de um tipo específico
 * @param grupoId - ID do grupo
 * @param tipo - 'reuniao', 'evento', 'geral'
 * @param limit - número máximo a retornar
 * @returns Array de avisos do tipo
 */
export async function getAvisosGrupoPorTipo(
  grupoId: string,
  tipo: string,
  limit = 10
): Promise<AvisoGrupoRow[]> {
  const { data, error } = await supabase
    .from('avisos_grupo')
    .select('*')
    .eq('grupo_id', grupoId)
    .eq('tipo', tipo)
    .order('criado_em', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Erro ao buscar avisos por tipo:', error)
    return []
  }

  return data ?? []
}

/**
 * Obtém bounding box de todos os grupos ativos para exibição no mapa
 * Usado para Leaflet Map — retorna apenas lat, lng e info do grupo
 * @returns Array com grupos ativos que têm localização (lat/lng)
 */
export async function getBoundingBoxGrupos(): Promise<GrupoBoundingBox[]> {
  const { data, error } = await supabase
    .from('grupos')
    .select('id, nome, latitude, longitude, email, lider_id')
    .eq('ativo', true)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar bounding box:', error)
    return []
  }

  return (data as GrupoBoundingBox[]) ?? []
}

/**
 * Busca grupos por localização geográfica (distância usando lat/lng)
 * Implementação simples: cálculo de distância Haversine
 * @param latitude - latitude do usuário
 * @param longitude - longitude do usuário
 * @param raioKm - raio de busca em km (default 50)
 * @returns Array de grupos dentro do raio
 */
export async function getGruposProximos(
  latitude: number,
  longitude: number,
  raioKm = 50
): Promise<GrupoRow[]> {
  const grupos = await getGrupos({ ativo: true })

  // Filtro simples usando distância Haversine
  const gruposProximos = grupos.filter((g) => {
    if (!g.latitude || !g.longitude) return false

    const distancia = haversineDistance(
      latitude,
      longitude,
      Number(g.latitude),
      Number(g.longitude)
    )

    return distancia <= raioKm
  })

  return gruposProximos
}

/**
 * Calcula distância entre dois pontos geográficos (Haversine)
 * @returns distância em km
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distancia = R * c

  return distancia
}

/**
 * Obtém estatísticas de um grupo
 * @param grupoId - ID do grupo
 * @returns Objeto com contagem de membros, reuniões, avisos
 */
export async function getEstatisticasGrupo(grupoId: string) {
  const [membros, reunioes, avisos] = await Promise.all([
    supabase
      .from('membros_grupo')
      .select('id', { count: 'exact' })
      .eq('grupo_id', grupoId)
      .eq('ativo', true),
    supabase.from('reunioes_grupo').select('id', { count: 'exact' }).eq('grupo_id', grupoId),
    supabase
      .from('avisos_grupo')
      .select('id', { count: 'exact' })
      .eq('grupo_id', grupoId),
  ])

  return {
    totalMembros: membros.count ?? 0,
    totalReunioes: reunioes.count ?? 0,
    totalAvisos: avisos.count ?? 0,
  }
}
