import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Padrão recomendado pelo @supabase/ssr: recriar a response a cada setAll
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() verifica o token no servidor Auth — use-o para decisões de acesso
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/entrar'
    return NextResponse.redirect(url)
  }

  // Rotas /admin/financeiro/* exigem papel pastor, tesoureiro ou conferente
  if (pathname.startsWith('/admin/financeiro')) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('papeis, grupo_id')
      .eq('id', user.id)
      .single()

    const papeis: string[] = perfil?.papeis ?? []
    const grupoid = perfil?.grupo_id
    const podeAcessarFinanceiro =
      papeis.includes('pastor') ||
      papeis.includes('tesoureiro') ||
      (papeis.includes('conferente') && !!grupoid)

    if (!podeAcessarFinanceiro) {
      const url = request.nextUrl.clone()
      url.pathname = '/membro'
      return NextResponse.redirect(url)
    }
  }

  // Rotas /admin/* (exceto financeiro) exigem pastor ou tesoureiro
  if (pathname.startsWith('/admin')) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('papeis')
      .eq('id', user.id)
      .single()

    const papeis: string[] = perfil?.papeis ?? []
    const podeAcessarAdmin =
      papeis.includes('pastor') || papeis.includes('tesoureiro')

    if (!podeAcessarAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/membro'
      return NextResponse.redirect(url)
    }
  }

  // /membro/contribuir exige apenas autenticação (já coberto por check de user)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/membro/:path*',
    '/admin/:path*',
  ],
}
