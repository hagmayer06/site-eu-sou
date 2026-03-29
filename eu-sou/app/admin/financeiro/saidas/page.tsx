
'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, X, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  getCategorias,
  getLancamentos,
  formatarReais,
  atualizarVencidos,
  calcularStatus,
} from '@/lib/financeiroQueries'
import { criarSaidaAction, marcarPagoAction } from '@/app/admin/financeiro/actions'
import LancamentoForm from '@/components/financeiro/LancamentoForm'
import type { CategoriaFinanceiroRow, LancamentoRow } from '@/lib/database.types'

export default function SaidasPage() {
  const [categorias, setCategorias] = useState<CategoriaFinanceiroRow[]>([])
  const [lancamentos, setLancamentos] = useState<LancamentoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [grupoId, setGrupoId] = useState<string | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)

  // Filtros
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')

  // Banner de alerta
  const [vencidas, setVencidas] = useState<LancamentoRow[]>([])

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      await atualizarVencidos()
      const [cats, lands] = await Promise.all([
        getCategorias(),
        getLancamentos({
          tipo: 'saida',
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined,
          categoria_id: filtroCategoria || undefined,
          status: (filtroStatus as 'pendente' | 'pago' | 'vencido' | 'confirmado' | undefined) || undefined,
        }),
      ])
      setCategorias(cats)
      setLancamentos(lands)
      setVencidas(lands.filter(l => calcularStatus(l.data_vencimento, l.status) === 'vencido'))
    } catch (err) {
      console.error('Erro ao carregar saídas', err)
    } finally {
      setLoading(false)
    }
  }, [dataInicio, dataFim, filtroCategoria, filtroStatus])

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

  const categoriasSaida = categorias.filter((c) => c.tipo === 'saida')
  const totalFiltrado = lancamentos.reduce((s, l) => s + l.valor, 0)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Banner de alerta */}
      {vencidas.length > 0 && (
        <div className="flex items-center gap-3 bg-rose-900/80 border border-rose-700 text-rose-200 p-4 rounded-xl mb-6">
          <AlertTriangle className="text-rose-400" size={24} />
          <div>
            <b>{vencidas.length} conta(s) vencida(s)</b> não pagas. Regularize para evitar bloqueios!
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
            Saídas <span className="text-[#ff6b00]">Financeiras</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Despesas e contas a pagar registradas no sistema.</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ff6b00] hover:bg-[#e65a00] text-white text-sm font-black uppercase tracking-wider rounded-xl transition-all"
        >
          {mostrarForm ? <X size={16} /> : <Plus size={16} />}
          {mostrarForm ? 'Cancelar' : 'Nova saída'}
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white">
          <option value="">Status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="vencido">Vencido</option>
        </select>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white">
          <option value="">Categoria</option>
          {categoriasSaida.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white" placeholder="Início" />
        <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="p-2 rounded bg-zinc-800 border border-zinc-700 text-white" placeholder="Fim" />
        <button onClick={carregar} className="px-4 py-2 bg-sky-600 text-white rounded-lg">Filtrar</button>
      </div>

      {/* Formulário de nova saída */}
      {mostrarForm && (
        <div className="mb-6">
          <LancamentoForm tipo="saida" categorias={categorias} grupoId={grupoId} onSuccess={() => { setMostrarForm(false); carregar() }} onCancel={() => setMostrarForm(false)} />
        </div>
      )}

      {/* Lista de saídas */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-white">Saídas lançadas</h2>
          <span className="text-xs text-zinc-400">Total filtrado: <b>{formatarReais(totalFiltrado)}</b></span>
        </div>
        {loading ? (
          <p className="text-zinc-400">Carregando...</p>
        ) : lancamentos.length === 0 ? (
          <p className="text-zinc-400">Nenhuma saída encontrada.</p>
        ) : (
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="text-zinc-400">
                <th className="text-left">Vencimento</th>
                <th className="text-left">Descrição</th>
                <th className="text-left">Categoria</th>
                <th className="text-right">Valor</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map(l => {
                const status = calcularStatus(l.data_vencimento, l.status)
                return (
                  <tr key={l.id} className="border-b border-zinc-800 last:border-0">
                    <td>{l.data_vencimento ? new Date(l.data_vencimento).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>{l.descricao}</td>
                    <td>{categoriasSaida.find(c => c.id === l.categoria_id)?.nome || '-'}</td>
                    <td className="text-right">{formatarReais(l.valor)}</td>
                    <td className="text-center">
                      <span className={
                        status === 'pago' ? 'bg-emerald-700 text-emerald-100 px-2 py-1 rounded-full text-xs' :
                        status === 'vencido' ? 'bg-rose-700 text-rose-100 px-2 py-1 rounded-full text-xs' :
                        'bg-yellow-700 text-yellow-100 px-2 py-1 rounded-full text-xs'
                      }>
                        {status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
