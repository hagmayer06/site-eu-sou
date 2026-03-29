'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  getMembrosAdmin,
  setMembroAtivo,
  AdminPerfilRow,
} from '@/lib/membrosQueries'
import LoginPage from '../login/page'

const papeisDisponiveis = ['membro', 'pastor', 'tesoureiro']

function formatarTelefone(telefone: string | null) {
  return telefone ? telefone : '—'
}

function exportToCsv(rows: AdminPerfilRow[]) {
  if (!rows.length) return

  const headers = ['Nome', 'Telefone', 'Grupo', 'Papéis', 'Status', 'Criado em']
  const lines = rows.map((row) => [
    row.nome,
    row.telefone ?? '',
    row.grupo_id ?? '',
    row.papeis.join(';'),
    row.ativo ? 'Ativo' : 'Inativo',
    new Date(row.criado_em).toLocaleString('pt-BR'),
  ])

  const csvContent = [headers, ...lines]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `membros_${new Date().toISOString().slice(0, 10)}.csv`)
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminMembrosPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [membros, setMembros] = useState<AdminPerfilRow[]>([])
  const [loadingLista, setLoadingLista] = useState(false)

  const [busca, setBusca] = useState('')
  const [filtroPapel, setFiltroPapel] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('')

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session) carregarLista()
      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (_event === 'SIGNED_IN') carregarLista()
      if (_event === 'SIGNED_OUT') {
        setSession(null)
        setMembros([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function carregarLista() {
    setLoadingLista(true)
    try {
      const data = await getMembrosAdmin()
      setMembros(data)
    } catch (error) {
      console.error('Falha ao buscar membros', error)
      alert('Falha ao buscar membros. Verifique o console.')
    } finally {
      setLoadingLista(false)
    }
  }

  const gruposUnicos = useMemo(() => {
    const grupos = Array.from(new Set(membros.map((m) => m.grupo_id).filter(Boolean))) as string[]
    return grupos
  }, [membros])

  const membrosFiltrados = useMemo(() => {
    return membros.filter((m) => {
      const termo = busca.toLowerCase().trim()
      const matchesBusca =
        !termo ||
        m.nome.toLowerCase().includes(termo) ||
        (m.telefone?.toLowerCase().includes(termo) ?? false)

      const matchesPapel = !filtroPapel || m.papeis.includes(filtroPapel)
      const matchesStatus =
        !filtroStatus ||
        (filtroStatus === 'ativo' ? m.ativo : !m.ativo)
      const matchesGrupo = !filtroGrupo || m.grupo_id === filtroGrupo

      return matchesBusca && matchesPapel && matchesStatus && matchesGrupo
    })
  }, [membros, busca, filtroPapel, filtroStatus, filtroGrupo])

  const alternarAtivo = async (id: string, ativo: boolean) => {
    const confirmMsg = ativo
      ? 'Deseja ativar este membro?'
      : 'Deseja desativar este membro?'

    if (!confirm(confirmMsg)) return

    try {
      await setMembroAtivo(id, ativo)
      setMembros((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ativo } : m))
      )
    } catch (error) {
      console.error('Falha ao alterar status', error)
      alert('Não foi possível atualizar o status do membro.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#ff6b00] animate-pulse font-black tracking-tighter text-xl uppercase">
          SISTEMA <span className="text-white uppercase font-black">Eu Sou</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 pt-28">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-l-4 border-[#ff6b00] pl-6 flex justify-between items-center bg-zinc-900/50 p-6 rounded-r-xl border-y border-r border-zinc-800">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">
              Admin <span className="text-[#ff6b00] italic">Membros</span>
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
              Consulta, filtros e gestão de perfis
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => exportToCsv(membrosFiltrados)}
              className="px-4 py-2 border border-zinc-700 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition"
            >
              Exportar CSV
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/10 transition"
            >
              Sair
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, telefone"
            className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#ff6b00]"
          />

          <select
            value={filtroPapel}
            onChange={(e) => setFiltroPapel(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#ff6b00]"
          >
            <option value="">Todos os papéis</option>
            {papeisDisponiveis.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#ff6b00]"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>

          <select
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#ff6b00]"
          >
            <option value="">Todos os grupos</option>
            {gruposUnicos.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-4 md:p-6 shadow-2xl">
          {loadingLista ? (
            <div className="flex justify-center py-20 text-[#ff6b00]">Carregando...</div>
          ) : membrosFiltrados.length === 0 ? (
            <div className="text-center py-20 text-zinc-600 font-bold uppercase text-sm tracking-widest border-2 border-dashed border-zinc-800 rounded-2xl">
              Nenhum membro encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-sm border-collapse">
                <thead>
                  <tr className="text-zinc-400 uppercase tracking-widest border-b border-zinc-700">
                    <th className="p-3">Nome</th>
                    <th className="p-3">Telefone</th>
                    <th className="p-3">Grupo</th>
                    <th className="p-3">Papéis</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {membrosFiltrados.map((m) => (
                    <tr key={m.id} className="border-b border-zinc-800 hover:bg-zinc-800/40 transition">
                      <td className="p-3 font-bold text-white">{m.nome}</td>
                      <td className="p-3 text-zinc-300">{formatarTelefone(m.telefone)}</td>
                      <td className="p-3 text-zinc-300">{m.grupo_id ?? '—'}</td>
                      <td className="p-3 text-zinc-300">{m.papeis.join(', ')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${m.ativo ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                          {m.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-3 space-x-2">
                        <button
                          onClick={() => router.push(`/admin/membros/${m.id}`)}
                          className="px-2 py-1 text-xs bg-[#ff6b00] hover:bg-[#e65a00] rounded-lg font-black uppercase"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => alternarAtivo(m.id, !m.ativo)}
                          className={`px-2 py-1 text-xs font-black uppercase rounded-lg ${m.ativo ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                        >
                          {m.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
