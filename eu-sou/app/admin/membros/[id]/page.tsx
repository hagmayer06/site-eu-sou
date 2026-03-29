'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  getMembroAdmin,
  setMembroAtivo,
  setMembroPapeis,
  AdminPerfilRow,
} from '@/lib/membrosQueries'
import LoginPage from '../../login/page'

const papeisDisponiveis = ['membro', 'pastor', 'tesoureiro']

export default function EditarMembroPage() {
  const { id } = useParams() as { id?: string }
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<AdminPerfilRow | null>(null)
  const [loadingSave, setLoadingSave] = useState(false)
  const [papeisSelecionados, setPapeisSelecionados] = useState<string[]>([])
  const [ativo, setAtivo] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }

    getInitialSession()
  }, [])

  useEffect(() => {
    if (!id) return

    const carregarMembro = async () => {
      try {
        const data = await getMembroAdmin(id)
        setProfile(data)
        setPapeisSelecionados(data.papeis)
        setAtivo(data.ativo)
      } catch (error) {
        console.error('Falha ao carregar membro', error)
        alert('Não foi possível carregar o membro')
      }
    }

    carregarMembro()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#ff6b00] animate-pulse font-black tracking-tighter text-xl uppercase">
          CARREGANDO...
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6 pt-28">
        <div className="max-w-2xl mx-auto text-center text-zinc-300">Perfil não encontrado.</div>
      </div>
    )
  }

  const togglePapel = (papel: string) => {
    setPapeisSelecionados((prev) =>
      prev.includes(papel) ? prev.filter((p) => p !== papel) : [...prev, papel]
    )
  }

  const onSalvar = async () => {
    setLoadingSave(true)
    try {
      await Promise.all([setMembroPapeis(profile.id, papeisSelecionados), setMembroAtivo(profile.id, ativo)])
      alert('Perfil atualizado com sucesso')
      router.push('/admin/membros')
    } catch (error) {
      console.error('Falha ao salvar perfil', error)
      alert('Erro ao salvar alterações')
    } finally {
      setLoadingSave(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 pt-28">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 border-l-4 border-[#ff6b00] pl-6 flex justify-between items-center bg-zinc-900/50 p-6 rounded-r-xl border-y border-r border-zinc-800">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Editar Membro</h1>
            <p className="text-zinc-500 text-sm">{profile.nome} ({profile.id})</p>
          </div>
          <button
            onClick={() => router.push('/admin/membros')}
            className="px-4 py-2 text-xs uppercase font-black tracking-wider border border-zinc-700 rounded-lg hover:bg-zinc-800 transition"
          >
            Voltar
          </button>
        </header>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 uppercase tracking-wider">Status</label>
              <select
                value={ativo ? 'ativo' : 'inativo'}
                onChange={(e) => setAtivo(e.target.value === 'ativo')}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Papéis</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {papeisDisponiveis.map((papel) => (
                  <label key={papel} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={papeisSelecionados.includes(papel)}
                      onChange={() => togglePapel(papel)}
                      className="form-checkbox rounded border-zinc-600 bg-zinc-900"
                    />
                    <span className="capitalize">{papel}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3"> 
              <button
                onClick={onSalvar}
                disabled={loadingSave}
                className="px-5 py-3 bg-[#ff6b00] hover:bg-[#e65a00] rounded-xl font-black uppercase text-xs tracking-widest transition disabled:opacity-50"
              >
                {loadingSave ? 'Salvando...' : 'Salvar alterações'}
              </button>
              <button
                onClick={() => router.push('/admin/membros')}
                className="px-5 py-3 border border-zinc-700 rounded-xl text-xs uppercase tracking-widest hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
