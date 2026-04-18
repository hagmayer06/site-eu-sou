import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Ignorar erro em Server Components
            }
          },
          remove(name: string, options) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // Ignorar erro em Server Components
            }
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/admin/eventos', request.url))
}
