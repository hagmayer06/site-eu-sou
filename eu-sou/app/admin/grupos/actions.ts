'use server'

import { revalidatePath } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getPerfilAtual } from '@/lib/auth'
import type { GrupoRow, GrupoInsert } from '@/lib/database.types'

// ── Nominatim API & Geocoding ────────────────────────────────

/** Cache para evitar rechamar Nominatim múltiplas vezes */
const geocodingCache = new Map<string, { lat: number; lng: number; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 horas em ms
const NOMINATIM_DELAY = 1100 // 1.1s entre requests para respeitar rate limit

let lastNominatimCall = 0

/**
 * Geocodifica um endereço usando Nominatim OpenStreetMap
 * Respeita rate limit (1 req/seg) com delay
 * Usa cache para endereços já consultados
 *
 * @param endereco - Endereço a geocodificar
 * @returns {lat, lng} ou null se não encontrado
 */
async function geocodificarEndereco(
  endereco: string
): Promise<{ lat: number; lng: number } | null> {
  if (!endereco.trim()) return null

  // Verificar cache
  const cached = geocodingCache.get(endereco)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Geocoding] Cache hit para: ${endereco}`)
    return { lat: cached.lat, lng: cached.lng }
  }

  // Respeitar rate limit: aguardar 1.1s desde último call
  const timeSinceLastCall = Date.now() - lastNominatimCall
  if (timeSinceLastCall < NOMINATIM_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, NOMINATIM_DELAY - timeSinceLastCall)
    )
  }

  try {
    console.log(`[Geocoding] Chamando Nominatim para: ${endereco}`)
    lastNominatimCall = Date.now()

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'EuSou-Igreja-App/1.0 (+https://eu-sou.com.br)',
        },
      }
    )

    if (!response.ok) {
      console.error(`[Geocoding] Nominatim error: ${response.status}`)
      return null
    }

    const data = await response.json()
    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`[Geocoding] Endereço não encontrado: ${endereco}`)
      return null
    }

    const { lat, lon } = data[0]
    const result = { lat: parseFloat(lat), lng: parseFloat(lon) }

    // Guardar no cache
    geocodingCache.set(endereco, { ...result, timestamp: Date.now() })
    console.log(`[Geocoding] Sucesso: ${endereco} → (${result.lat}, ${result.lng})`)

    return result
  } catch (error) {
    console.error('[Geocoding] Erro:', error)
    return null
  }
}

// ── Storage ─────────────────────────────────────────────────

/**
 * Upload de imagem para bucket grupo-imagens
 * Valida tipo MIME e tamanho
 *
 * @param file - File object
 * @param grupoId - ID do grupo (path)
 * @returns URL pública da imagem ou null
 */
async function uploadGrupoImagem(
  file: File,
  grupoId: string
): Promise<string | null> {
  // Validar tipo MIME
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedMimes.includes(file.type)) {
    throw new Error(`Tipo de imagem não permitido. Use: JPEG, PNG ou WebP`)
  }

  // Validar tamanho (5MB)
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    throw new Error(`Imagem muito grande. Máximo: 5MB`)
  }

  try {
    // Gerar nome único
    const fileExt = file.name.split('.').pop()
    const fileName = `${grupoId}/${Date.now()}.${fileExt}`

    console.log(`[Storage] Upload para: ${fileName}`)

    // Upload
    const { error: uploadError } = await supabaseAdmin.storage
      .from('grupo-imagens')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      console.error('[Storage] Upload error:', uploadError)
      throw uploadError
    }

    // Gerar URL pública
    const { data } = supabaseAdmin.storage
      .from('grupo-imagens')
      .getPublicUrl(fileName)

    console.log(`[Storage] URL gerada: ${data.publicUrl}`)
    return data.publicUrl
  } catch (error) {
    console.error('[Storage] Erro:', error)
    throw error instanceof Error ? error : new Error('Erro ao fazer upload de imagem')
  }
}

// ── CRUD Actions ────────────────────────────────────────────

/**
 * Cria um novo grupo com geocoding automático
 */
export async function criarGrupoAction(formData: FormData) {
  const perfil = await getPerfilAtual()
  if (!perfil) throw new Error('Não autenticado')

  // Validar role
  const papeis: string[] = perfil?.papeis ?? []
  if (!papeis.includes('pastor') && !papeis.includes('lider')) {
    throw new Error('Acesso negado. Apenas pastor ou líder pode criar grupos.')
  }

  // Extrair dados
  const nome = String(formData.get('nome') ?? '').trim()
  const descricao = String(formData.get('descricao') ?? '').trim() || null
  const endereco = String(formData.get('endereco') ?? '').trim()
  const telefone = String(formData.get('telefone') ?? '').trim() || null
  const email = String(formData.get('email') ?? '').trim()
  const ativo = String(formData.get('ativo') ?? 'true') === 'true'
  const imagemFile = formData.get('imagem') as File | null

  // Validar campos obrigatórios
  if (!nome) throw new Error('Nome é obrigatório')
  if (!email) throw new Error('Email é obrigatório')
  if (!endereco) throw new Error('Endereço é obrigatório')
  if (!imagemFile) throw new Error('Imagem é obrigatória')

  // Validar email formato
  if (!email.includes('@')) throw new Error('Email inválido')

  // Para um líder criar grupo, ele fica como lider
  // Para um pastor criar, precisa selecionar quem será o líder (Task 4.0 simplificado: usa o criador)
  const lider_id = perfil.id

  // 1. Geocodificar endereço
  console.log('[Task 4.0] Geocodificando endereço...')
  const coordenadas = await geocodificarEndereco(endereco)
  if (!coordenadas) {
    console.warn('[Task 4.0] Geocoding falhou, prosseguindo sem lat/lng')
  }

  // 2. Upload de imagem
  console.log('[Task 4.0] Fazendo upload de imagem...')
  // Gerar ID temporário para o upload
  const tempGrupoId = `temp-${Date.now()}`
  const imagemUrl = await uploadGrupoImagem(imagemFile, tempGrupoId)
  if (!imagemUrl) throw new Error('Falha ao fazer upload de imagem')

  // 3. Verificar unicidade de email
  const { data: existente } = await supabaseAdmin
    .from('grupos')
    .select('id')
    .eq('email', email)
    .single()

  if (existente) {
    // Deletar imagem se email duplicado
    if (imagemUrl) {
      await supabaseAdmin.storage
        .from('grupo-imagens')
        .remove([`temp-${Date.now()}/*`])
    }
    throw new Error('Email já existe para outro grupo')
  }

  // 4. Inserir grupo
  console.log('[Task 4.0] Inserindo grupo no banco...')
  const { data: novoGrupo, error: insertError } = await supabaseAdmin
    .from('grupos')
    .insert({
      nome,
      descricao,
      endereco,
      latitude: coordenadas?.lat ?? null,
      longitude: coordenadas?.lng ?? null,
      telefone,
      email,
      imagem_url: imagemUrl,
      lider_id,
      ativo,
    })
    .select()
    .single()

  if (insertError) {
    console.error('[Task 4.0] Insert error:', insertError)
    throw insertError
  }

  // 5. Mover imagem para pasta com ID real do grupo
  if (novoGrupo?.id && imagemUrl.includes(tempGrupoId)) {
    try {
      const nomeArquivo = imagemUrl.split('/').pop()
      if (nomeArquivo) {
        await supabaseAdmin.storage
          .from('grupo-imagens')
          .move(`temp-${Date.now() }/${nomeArquivo}`, `${novoGrupo.id}/${nomeArquivo}`)

        const { data: urlAtualizada } = supabaseAdmin.storage
          .from('grupo-imagens')
          .getPublicUrl(`${novoGrupo.id}/${nomeArquivo}`)

        // Atualizar URL
        await supabaseAdmin
          .from('grupos')
          .update({ imagem_url: urlAtualizada.publicUrl })
          .eq('id', novoGrupo.id)
      }
    } catch (error) {
      console.warn('[Task 4.0] Erro ao reorganizar imagem:', error)
      // Não falha se reorganização não funcionar
    }
  }

  revalidatePath('/admin/grupos')
  console.log('[Task 4.0] Grupo criado com sucesso:', novoGrupo?.id)
  return { ok: true, grupoId: novoGrupo?.id }
}

/**
 * Atualiza um grupo existente
 */
export async function atualizarGrupoAction(formData: FormData) {
  const perfil = await getPerfilAtual()
  if (!perfil) throw new Error('Não autenticado')

  const id = String(formData.get('id') ?? '').trim()
  if (!id) throw new Error('ID do grupo obrigatório')

  // Buscar grupo
  const { data: grupoAtual, error: getErr } = await supabaseAdmin
    .from('grupos')
    .select('*')
    .eq('id', id)
    .single()

  if (getErr || !grupoAtual) throw new Error('Grupo não encontrado')

  // Validar acesso (apenas lider do grupo ou pastor)
  const papeis: string[] = perfil?.papeis ?? []
  if (
    !papeis.includes('pastor') &&
    grupoAtual.lider_id !== perfil.id
  ) {
    throw new Error('Você não tem permissão para editar este grupo')
  }

  // Extrair dados
  const nome = String(formData.get('nome') ?? '').trim()
  const descricao = String(formData.get('descricao') ?? '').trim() || null
  const endereco = String(formData.get('endereco') ?? '').trim()
  const telefone = String(formData.get('telefone') ?? '').trim() || null
  const email = String(formData.get('email') ?? '').trim()
  const ativo = String(formData.get('ativo') ?? 'true') === 'true'
  const imagemFile = formData.get('imagem') as File | null

  if (!nome) throw new Error('Nome é obrigatório')
  if (!email) throw new Error('Email é obrigatório')
  if (!endereco) throw new Error('Endereço é obrigatório')

  // Validações adicionais
  if (!email.includes('@')) throw new Error('Email inválido')

  let novaImagemUrl = grupoAtual.imagem_url

  // Se endereço mudou, re-geocodificar
  if (endereco !== grupoAtual.endereco) {
    console.log('[Task 4.0] Endereço mudou, re-geocodificando...')
    const coordenadas = await geocodificarEndereco(endereco)
    if (!coordenadas) {
      console.warn('[Task 4.0] Geocoding falhou, mantendo valores anteriores')
    }
  }

  // Se nova imagem foi enviada
  if (imagemFile) {
    console.log('[Task 4.0] Novo upload de imagem...')
    novaImagemUrl = await uploadGrupoImagem(imagemFile, id)
  }

  // Verificar duplicação de email (exceto o do próprio grupo)
  if (email !== grupoAtual.email) {
    const { data: existente } = await supabaseAdmin
      .from('grupos')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .single()

    if (existente) {
      throw new Error('Email já existe para outro grupo')
    }
  }

  // Atualizar grupo
  const { error: updateError } = await supabaseAdmin
    .from('grupos')
    .update({
      nome,
      descricao,
      endereco,
      telefone,
      email,
      imagem_url: novaImagemUrl,
      ativo,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    console.error('[Task 4.0] Update error:', updateError)
    throw updateError
  }

  revalidatePath('/admin/grupos')
  revalidatePath(`/admin/grupos/${id}`)
  console.log('[Task 4.0] Grupo atualizado:', id)
  return { ok: true }
}

/**
 * Deleta um grupo (soft delete - marca como inativo)
 */
export async function deletarGrupoAction(formData: FormData) {
  const perfil = await getPerfilAtual()
  if (!perfil) throw new Error('Não autenticado')

  const id = String(formData.get('id') ?? '').trim()
  if (!id) throw new Error('ID do grupo obrigatório')

  // Buscar grupo
  const { data: grupo, error: getErr } = await supabaseAdmin
    .from('grupos')
    .select('*')
    .eq('id', id)
    .single()

  if (getErr || !grupo) throw new Error('Grupo não encontrado')

  // Apenas pastor pode deletar
  const papeis: string[] = perfil?.papeis ?? []
  if (!papeis.includes('pastor')) {
    throw new Error('Apenas pastor pode deletar grupos')
  }

  // Soft delete: marcar como inativo
  const { error: updateError } = await supabaseAdmin
    .from('grupos')
    .update({ ativo: false })
    .eq('id', id)

  if (updateError) {
    console.error('[Task 4.0] Delete error:', updateError)
    throw updateError
  }

  revalidatePath('/admin/grupos')
  console.log('[Task 4.0] Grupo deletado (soft):', id)
  return { ok: true }
}
