'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, User, LogOut, ArrowUpCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const links = [
  { href: '/membro', label: 'Início', icon: Home },
  { href: '/membro/perfil', label: 'Meu Perfil', icon: User },
  { href: '/membro/contribuir', label: 'Contribuir', icon: ArrowUpCircle },
]

export default function MembroNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSair() {
    await supabase.auth.signOut()
    router.push('/entrar')
  }

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-zinc-900 border-r border-zinc-800 z-30 pt-20">
        <div className="px-4 py-6 border-b border-zinc-800">
          <p className="text-[#ff6b00] text-xs font-black uppercase tracking-widest">Área do Membro</p>
          <p className="text-zinc-600 text-xs mt-1 italic">Igreja Eu Sou</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                pathname === href
                  ? 'bg-[#ff6b00]/10 text-[#ff6b00]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-zinc-800">
          <button
            onClick={handleSair}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-bold text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex z-30">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold transition-all ${
              pathname === href ? 'text-[#ff6b00]' : 'text-zinc-500'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
        <button
          onClick={handleSair}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-bold text-zinc-500 hover:text-red-400 transition-all"
        >
          <LogOut size={18} />
          Sair
        </button>
      </nav>
    </>
  )
}
