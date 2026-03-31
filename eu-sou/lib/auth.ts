import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Função para criar o cliente Supabase no servidor (SSR/Actions/Server Components)
 * Cybersecurity Sênior: Atualizado para Next.js 15/16 com cookies assíncronos.
 */
export async function createClient() {
  const cookieStore = await cookies() // <--- CRÍTICO: await para Next.js 15+

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Opcional: Tratar erros de set em Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Opcional: Tratar erros de remove em Server Components
          }
        },
      },
    }
  )
}

/**
 * Verifica se o usuário atual está autenticado no servidor.
 * Cybersecurity Sênior: Sempre use getUser() em vez de getSession() para validação real.
 */
export async function getSession() {
  try {
    const supabase = await createClient() // <--- Agora é assíncrona
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) return null
    return user
  } catch (error) {
    console.error('Erro de segurança ao verificar sessão:', error)
    return null
  }
}
