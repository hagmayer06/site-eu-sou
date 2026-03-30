'use client'

import { useState, useCallback, useTransition } from 'react'
import { Plus, Edit2, Trash2, Users, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GrupoRow } from '@/lib/database.types'
import { deletarGrupoAction } from './actions'

interface GruposClientProps {
  gruposIniciais: GrupoRow[]
  perfilId: string
  ehPastor: boolean
}

export default function GruposClient({ gruposIniciais, perfilId, ehPastor }: GruposClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [grupos, setGrupos] = useState(gruposIniciais)
  const [search, setSearch] = useState('')
  const [deletando, setDeletando] = useState<string | null>(null)

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Tem certeza que deseja deletar este grupo?')) return

      setDeletando(id)
      try {
        const formData = new FormData()
        formData.append('id', id)
        
        const result = await deletarGrupoAction(formData)
        if (result.ok) {
          setGrupos((prev) => prev.filter((g) => g.id !== id))
        } else {
          alert('Erro ao deletar grupo')
        }
      } catch (err) {
        const mensagem = err instanceof Error ? err.message : 'Erro desconhecido'
        alert('Erro: ' + mensagem)
        console.error('Erro ao deletar grupo:', err)
      } finally {
        setDeletando(null)
      }
    },
    []
  )

  const gruposFiltrados = grupos.filter(
    (g) =>
      g.nome.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header com botão novo */}
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#ff6b00] outline-none"
        />
        <button
          onClick={() => router.push('/admin/grupos/novo')}
          className="ml-3 flex items-center gap-2 px-4 py-2.5 bg-[#ff6b00] hover:bg-[#e65a00] text-white text-sm font-black uppercase tracking-wider rounded-xl transition-all"
        >
          <Plus size={16} />
          Novo grupo
        </button>
      </div>

      {/* Tabela de grupos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {gruposFiltrados.length === 0 ? (
          <div className="text-center py-16 text-zinc-600 font-bold uppercase text-sm tracking-widest">
            {grupos.length === 0 ? 'Nenhum grupo criado ainda' : 'Nenhum grupo encontrado'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="text-zinc-500 uppercase tracking-widest border-b border-zinc-800 text-xs">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Líder</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Membros</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {gruposFiltrados.map((grupo) => (
                  <tr
                    key={grupo.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition"
                  >
                    <td className="px-4 py-3 text-white font-semibold">{grupo.nome}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{grupo.email}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      {grupo.lider_id === perfilId ? (
                        <span className="text-[#ff6b00] font-semibold">Seu grupo</span>
                      ) : ehPastor ? (
                        <span className="text-zinc-400">Outro líder</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                          grupo.ativo
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-zinc-700/20 text-zinc-400'
                        }`}
                      >
                        {grupo.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 flex items-center gap-1">
                      <Users size={14} />
                      <span>0</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(ehPastor || grupo.lider_id === perfilId) && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/grupos/${grupo.id}`)}
                            className="p-2 hover:bg-zinc-700 rounded-lg transition-colors text-zinc-400 hover:text-[#ff6b00]"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          {ehPastor && (
                            <button
                              onClick={() => handleDelete(grupo.id)}
                              disabled={deletando === grupo.id}
                              className="p-2 hover:bg-red-900/20 rounded-lg transition-colors text-zinc-400 hover:text-red-500 disabled:opacity-50"
                              title="Deletar"
                            >
                              {deletando === grupo.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
