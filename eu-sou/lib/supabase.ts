import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para o Lado do Navegador (Client Components)
 * Cybersecurity Sênior: Usando createBrowserClient para garantir que os tokens 
 * sejam sincronizados via Cookies com o Middleware e Server Actions.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
