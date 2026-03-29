'use client'

// app/admin/layout.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-zinc-900 text-white px-4 py-3 border-b border-zinc-800">
        <nav className="flex gap-4">
          <Link
            href="/admin/eventos"
            className={`text-sm font-bold ${pathname.startsWith('/admin/eventos') ? 'text-[#ff6b00]' : 'text-zinc-300 hover:text-white'}`}
          >
            Eventos
          </Link>
          <Link
            href="/admin/membros"
            className={`text-sm font-bold ${pathname.startsWith('/admin/membros') ? 'text-[#ff6b00]' : 'text-zinc-300 hover:text-white'}`}
          >
            Membros
          </Link>
          <Link
            href="/admin/financeiro"
            className={`text-sm font-bold ${pathname.startsWith('/admin/financeiro') ? 'text-[#ff6b00]' : 'text-zinc-300 hover:text-white'}`}
          >
            Financeiro
          </Link>
          <Link
            href="/admin/serie"
            className={`text-sm font-bold ${pathname.startsWith('/admin/serie') ? 'text-[#ff6b00]' : 'text-zinc-300 hover:text-white'}`}
          >
            Série do Mês
          </Link>
        </nav>
      </header>

      {children}
    </div>
  )
}