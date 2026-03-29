'use client'

import { useState } from 'react'
import { criarLancamentoAction, criarSaidaAction } from '@/app/admin/financeiro/actions'
import type { CategoriaFinanceiroRow } from '@/lib/database.types'

interface Props {
  tipo: 'entrada' | 'saida'
  categorias: CategoriaFinanceiroRow[]
  grupoId?: string | null
  onSuccess?: () => void
  onCancel?: () => void
}

export default function LancamentoForm({ tipo, categorias, grupoId, onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [form, setForm] = useState({
    categoria_id: '',
    valor: '',
    descricao: '',
    data: new Date().toISOString().slice(0, 10),
    data_vencimento: '',
    membro_id: '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErro(null)
  }

  /** Formata o valor digitado para "1.500,00" ao sair do campo */
  function handleValorBlur() {
    const raw = form.valor.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
    const num = parseFloat(raw)
    if (!isNaN(num) && num > 0) {
      set('valor', num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.categoria_id) { setErro('Selecione uma categoria.'); return }
    if (!form.valor) { setErro('Informe o valor.'); return }
    if (!form.descricao.trim()) { setErro('Informe a descrição.'); return }

    setLoading(true)
    setErro(null)

    const fd = new FormData()
    fd.set('tipo', tipo)
    fd.set('categoria_id', form.categoria_id)
    fd.set('valor', form.valor)
    fd.set('descricao', form.descricao.trim())
    fd.set('data', form.data)
    if (form.data_vencimento) fd.set('data_vencimento', form.data_vencimento)
    if (form.membro_id.trim()) fd.set('membro_id', form.membro_id.trim())
    if (grupoId) fd.set('grupo_id', grupoId)

    const action = tipo === 'saida' ? criarSaidaAction : criarLancamentoAction

    try {
      await action(fd)
      setForm({ categoria_id: '', valor: '', descricao: '', data: new Date().toISOString().slice(0, 10), data_vencimento: '', membro_id: '' })
      onSuccess?.()
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar lançamento.')
    } finally {
      setLoading(false)
    }
  }

  const categoriasDoTipo = categorias.filter((c) => c.tipo === tipo && c.ativo)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 text-xs p-3 rounded-lg font-bold">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo label="Data" obrigatorio>
          <input
            type="date"
            value={form.data}
            onChange={(e) => set('data', e.target.value)}
            className={inputCls}
            required
          />
        </Campo>

        <Campo label="Valor (R$)" obrigatorio>
          <input
            type="text"
            inputMode="decimal"
            value={form.valor}
            onChange={(e) => set('valor', e.target.value)}
            onBlur={handleValorBlur}
            className={inputCls}
            placeholder="0,00"
            required
          />
        </Campo>
      </div>

      <Campo label="Categoria" obrigatorio>
        <select
          value={form.categoria_id}
          onChange={(e) => set('categoria_id', e.target.value)}
          className={inputCls}
          required
        >
          <option value="">Selecione...</option>
          {categoriasDoTipo.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icone ? `${c.icone} ` : ''}{c.nome}
            </option>
          ))}
        </select>
      </Campo>

      <Campo label="Descrição" obrigatorio>
        <input
          type="text"
          value={form.descricao}
          onChange={(e) => set('descricao', e.target.value)}
          className={inputCls}
          placeholder={tipo === 'entrada' ? 'Ex: Dízimos culto domingo' : 'Ex: Aluguel maio/2026'}
          required
        />
      </Campo>

      <Campo label="ID do membro vinculado (opcional)">
        <input
          type="text"
          value={form.membro_id}
          onChange={(e) => set('membro_id', e.target.value)}
          className={inputCls}
          placeholder="UUID do membro (opcional)"
        />
      </Campo>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 bg-[#ff6b00] hover:bg-[#e65a00] text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600"
        >
          {loading ? 'Salvando...' : `Lançar ${tipo === 'entrada' ? 'Entrada' : 'Saída'}`}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-bold rounded-xl transition-all"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

const inputCls =
  'w-full bg-black border border-zinc-800 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-zinc-700'

function Campo({
  label,
  obrigatorio,
  children,
}: {
  label: string
  obrigatorio?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-1.5 tracking-widest">
        {label}
        {obrigatorio && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
