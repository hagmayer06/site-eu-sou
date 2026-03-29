'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  getCategorias,
  getLancamentos,
  formatarReais,
} from '@/lib/financeiroQueries'
import { estornarLancamentoAction } from '@/app/admin/financeiro/actions'
import LancamentoForm from '@/components/financeiro/LancamentoForm'
import type { CategoriaFinanceiroRow, LancamentoRow } from '@/lib/database.types'

export default function EntradasPage() {
  const [categorias, setCategorias] = useState<CategoriaFinanceiroRow[]>([])
  const [lancamentos, setLancamentos] = useState<LancamentoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [grupoId, setGrupoId] = useState<string | null>(null)

  const [mostrarForm, setMostrarForm] = useState(false)
  const [estornando, setEstornando] = useState<string | null>(null)

  // Filtros
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const [cats, lands] = await Promise.all([
        getCategorias(),
        getLancamentos({
          tipo: 'entrada',
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
          categoria_id: filtroCategoria || undefined,
        }),
      ])
      setCategorias(cats)
      setLancamentos(lands)
    } catch (err) {
      console.error('Erro ao carregar entradas', err)
    } finally {
      setLoading(false)
    }
  }, [dataInicio, dataFim, filtroCategoria])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      const { data: perfil } = await supabase
        .from('perfis')
        .select('grupo_id')
        .eq('id', session.user.id)
        .single()
      setGrupoId(perfil?.grupo_id ?? null)
      await carregar()
    }
    init()
  }, [carregar])

  async function handleEstornar(id: string) {
    if (!confirm('Confirma o estorno deste lançamento? Será criado um lançamento contrário.')) return
    setEstornando(id)
    const fd = new FormData()
    fd.set('id', id)
    try {
      await estornarLancamentoAction(fd)
      await carregar()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao estornar.')
    } finally {
      setEstornando(null)
    }
  }

  const categoriasEntrada = categorias.filter((c) => c.tipo === 'entrada')
  const totalFiltrado = lancamentos.reduce((s, l) => s + l.valor, 0)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
            Entradas <span className="text-[#ff6b00]">Financeiras</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Receitas da comunidade registradas no sistema.</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ff6b00] hover:bg-[#e65a00] text-white text-sm font-black uppercase tracking-wider rounded-xl transition-all"
        >
          {mostrarForm ? <X size={16} /> : <Plus size={16} />}
          {mostrarForm ? 'Cancelar' : 'Nova entrada'}
        </button>
      </div>

      {/* Formulário expansível */}
      {mostrarForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 border-b border-zinc-800 pb-2">
            Novo lançamento de entrada
          </p>
          <LancamentoForm
            tipo="entrada"
            categorias={categorias}
            grupoId={grupoId}
            onSuccess={() => { setMostrarForm(false); carregar() }}
            onCancel={() => setMostrarForm(false)}
          />
        </div>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className={inputCls}
          placeholder="Data início"
        />
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className={inputCls}
          placeholder="Data fim"
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className={inputCls}
        >
          <option value="">Todas as categorias</option>
          {categoriasEntrada.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icone ? `${c.icone} ` : ''}{c.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Totalizador */}
      {lancamentos.length > 0 && (
        <div className="bg-[#ff6b00]/10 border border-[#ff6b00]/20 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Total filtrado ({lancamentos.length} lançamento{lancamentos.length !== 1 ? 's' : ''})
          </span>
          <span className="text-[#ff6b00] font-black text-lg">{formatarReais(totalFiltrado)}</span>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16 text-[#ff6b00] animate-pulse font-bold text-sm uppercase tracking-widest">
            Carregando...
          </div>
        ) : lancamentos.length === 0 ? (
          <div className="text-center py-16 text-zinc-600 font-bold uppercase text-sm tracking-widest border-2 border-dashed border-zinc-800 rounded-2xl m-4">
            Nenhuma entrada encontrada
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="text-zinc-500 uppercase tracking-widest border-b border-zinc-800 text-xs">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.map((l) => {
                  const cat = categorias.find((c) => c.id === l.categoria_id)
                  const isEstorno = l.descricao.startsWith('ESTORNO:')
                  return (
                    <tr key={l.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition">
                      <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                        {new Date(l.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {cat ? `${cat.icone ?? ''} ${cat.nome}`.trim() : '—'}
                      </td>
                      <td className="px-4 py-3 text-white max-w-xs truncate">
                        {isEstorno
                          ? <span className="text-amber-400">{l.descricao}</span>
                          : l.descricao}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-400 whitespace-nowrap">
                        {formatarReais(l.valor)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {l.status === 'confirmado' && !isEstorno && (
                          <button
                            onClick={() => handleEstornar(l.id)}
                            disabled={estornando === l.id}
                            className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 rounded-lg transition disabled:opacity-50"
                          >
                            {estornando === l.id ? '...' : 'Estornar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmado: 'bg-emerald-500/20 text-emerald-300',
    pendente: 'bg-yellow-500/20 text-yellow-300',
    pago: 'bg-blue-500/20 text-blue-300',
    vencido: 'bg-red-500/20 text-red-300',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status] ?? 'bg-zinc-700 text-zinc-400'}`}>
      {status}
    </span>
  )
}

const inputCls = 'bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-[#ff6b00] w-full'
