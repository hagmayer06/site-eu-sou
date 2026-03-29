'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Home, ArrowUpCircle, ArrowDownCircle, FileText, BarChart3, Settings2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const items = [
  { href: '/admin/financeiro', label: 'Dashboard', icon: Home, roles: ['pastor', 'tesoureiro', 'conferente'] },
  { href: '/admin/financeiro/entradas', label: 'Entradas', icon: ArrowUpCircle, roles: ['pastor', 'tesoureiro', 'conferente'] },
  { href: '/admin/financeiro/saidas', label: 'Saídas', icon: ArrowDownCircle, roles: ['pastor', 'tesoureiro', 'conferente'] },
  { href: '/admin/financeiro/comprovantes', label: 'Comprovantes', icon: FileText, roles: ['pastor', 'tesoureiro'] },
  { href: '/admin/financeiro/relatorios', label: 'Relatórios', icon: BarChart3, roles: ['pastor', 'tesoureiro'] },
  { href: '/admin/financeiro/configuracoes', label: 'Configurações', icon: Settings2, roles: ['pastor', 'tesoureiro'] },
]

export default function FinanceiroNav() {
  const pathname = usePathname()
  const [papeis, setPapeis] = useState<string[]>([])

  useEffect(() => {
    const fetchPerfil = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      const { data } = await supabase
        .from('perfis')
        .select('papeis')
        .eq('id', session.user.id)
        .single()
      if (data?.papeis) setPapeis(data.papeis)
    }

    fetchPerfil()
  }, [])

  const menu = useMemo(() => {
    if (!papeis.length) return []
    return items.filter((item) => item.roles.some((role) => papeis.includes(role)))
  }, [papeis])

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-zinc-900 border-r border-zinc-800 z-40 pt-24">
      <div className="px-4 py-4 border-b border-zinc-800">
        <p className="text-[#ff6b00] text-xs font-black uppercase tracking-widest">Financeiro</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menu.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                active
                  ? 'bg-[#ff6b00]/20 text-[#ff6b00]'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
