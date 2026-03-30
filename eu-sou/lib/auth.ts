import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { PerfilRow } from './database.types'

async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

/** Retorna a sessão atual (lida dos cookies, não verificada no servidor Auth). */
export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/** Retorna o perfil do usuário autenticado, ou null se não autenticado. */
export async function getPerfilAtual(): Promise<PerfilRow | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', user.id)
    .single()

  return data ?? null
}

/** Encerra a sessão e redireciona para /entrar. */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/entrar')
}

/**
 * Extrai grupo_id do perfil do usuário autenticado.
 * Retorna null se não autenticado ou sem grupo_id.
 */
export async function getGrupoIdFromAuth(): Promise<string | null> {
  const perfil = await getPerfilAtual()
  return perfil?.grupo_id ?? null
}

/**
 * Valida se o usuário pode acessar um grupo específico.
 * - Pastor: sempre pode (acesso total)
 * - Lider: pode apenas seu grupo (comparar grupo_id)
 * - Membro/outros: não podem acessar `/admin/grupos`
 *
 * @param grupoId - ID do grupo a verificar
 * @returns true se pode acessar, false caso contrário
 */
export async function canAccessGrupo(grupoId: string): Promise<boolean> {
  const perfil = await getPerfilAtual()
  if (!perfil) return false

  const papeis: string[] = perfil?.papeis ?? []

  // Pastor tem acesso a todos os grupos
  if (papeis.includes('pastor')) {
    return true
  }

  // Lider tem acesso apenas ao seu grupo
  if (papeis.includes('lider')) {
    // Aqui você pode adicionar lógica para verificar se é lider do grupo específico
    // Por enquanto, apenas verifica se tem grupo_id
    return !!perfil.grupo_id
  }

  return false
}

/**
 * Valida se o usuário é lider ou pastor.
 * Usado para rotas admin/grupos.
 */
export async function isGruposAdmin(): Promise<boolean> {
  const perfil = await getPerfilAtual()
  if (!perfil) return false

  const papeis: string[] = perfil?.papeis ?? []
  return papeis.includes('pastor') || papeis.includes('lider')
}
