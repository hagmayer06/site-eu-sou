'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { confirmarComprovante } from '@/app/admin/financeiro/actions'
import { formatarReais } from '@/lib/financeiroQueries'
import { CheckCircle2, AlertCircle, Clock, Eye, X } from 'lucide-react'
import type { LancamentoRow } from '@/lib/database.types'

interface ComprovantesClientProps {
  comprovantes: LancamentoRow[]
  perfilNome: string
}

interface ModalState {
  isOpen: boolean
  lancamento: LancamentoRow | null
  valorConfirmado: string
  isSubmitting: boolean
  error: string | null
}

export function ComprovantesClient({ comprovantes, perfilNome }: ComprovantesClientProps) {
  const router = useRouter()
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    lancamento: null,
    valorConfirmado: '',
    isSubmitting: false,
    error: null,
  })

  const handleOpenModal = (lancamento: LancamentoRow) => {
    setModal({
      isOpen: true,
      lancamento,
      valorConfirmado: formatarReais(lancamento.valor).replace('R$ ', ''),
      isSubmitting: false,
      error: null,
    })
  }

  const handleCloseModal = () => {
    setModal({
      isOpen: false,
      lancamento: null,
      valorConfirmado: '',
      isSubmitting: false,
      error: null,
    })
  }

  const handleConfirm = async () => {
    if (!modal.lancamento) return

    setModal(prev => ({ ...prev, isSubmitting: true, error: null }))

    try {
      const formData = new FormData()
      formData.append('lancamento_id', modal.lancamento.id)
      formData.append('valor_confirmado', modal.valorConfirmado)

      await confirmarComprovante(formData)

      setModal({
        isOpen: false,
        lancamento: null,
        valorConfirmado: '',
        isSubmitting: false,
        error: null,
      })

      // Recarregar página
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (err: any) {
      setModal(prev => ({
        ...prev,
        error: err.message || 'Erro ao confirmar comprovante',
        isSubmitting: false,
      }))
    }
  }

  const pendentes = comprovantes.filter(c => c.status === 'pendente')
  const confirmados = comprovantes.filter(c => c.status === 'confirmado')

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase">Fila de Comprovantes</h1>
        <p className="text-zinc-500 text-sm mt-1">Confirme comprovantes de contribuição de membros</p>
      </div>

      {/* Pendentes Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock size={24} className="text-yellow-500" />
          <h2 className="text-xl font-bold text-white">
            Pendentes ({pendentes.length})
          </h2>
        </div>

        {pendentes.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-lg">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-emerald-500 opacity-50" />
            <p className="font-semibold text-zinc-400">Nenhum comprovante pendente</p>
            <p className="text-xs text-zinc-600 mt-1">Todos foram confirmados!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendentes.map((lancamento) => (
              <div
                key={lancamento.id}
                className="bg-zinc-900 border border-yellow-800/50 rounded-lg overflow-hidden hover:border-yellow-700 transition-colors"
              >
                {/* Comprovante Preview */}
                {lancamento.comprovante_url && (
                  <div className="bg-zinc-800 h-40 relative group">
                    <div className="w-full h-full bg-gradient-to-b from-yellow-950 to-zinc-900 flex items-center justify-center">
                      <AlertCircle size={32} className="text-yellow-600" />
                    </div>
                    <button
                      onClick={() => {/* TODO: View full image */}}
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      title="Visualizar comprovante completo"
                    >
                      <Eye size={32} className="text-white" />
                    </button>
                  </div>
                )}

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Membro</p>
                    <p className="font-bold text-white">{lancamento.descricao.split(' - ')[0]}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Valor Informado</p>
                      <p className="font-bold text-[#ff6b00]">{formatarReais(lancamento.valor)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Data</p>
                      <p className="font-semibold text-zinc-300">
                        {new Date(lancamento.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenModal(lancamento)}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded transition-colors"
                  >
                    ✓ Confirmar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmados Section */}
      {confirmados.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={24} className="text-emerald-500" />
            <h2 className="text-xl font-bold text-white">
              Confirmados ({confirmados.length})
            </h2>
          </div>

          <div className="space-y-2">
            {confirmados.slice(0, 10).map((lancamento) => (
              <div
                key={lancamento.id}
                className="bg-zinc-900 border border-emerald-800/30 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">
                    {lancamento.descricao.split(' - ')[0]}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(lancamento.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="shrink-0 ml-2 text-right">
                  <p className="font-bold text-emerald-400">{formatarReais(lancamento.valor)}</p>
                  <p className="text-xs text-zinc-600 flex items-center gap-1 justify-end">
                    <CheckCircle2 size={12} /> Confirmado
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {modal.isOpen && modal.lancamento && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="font-bold text-lg text-white">Confirmar Comprovante</h3>
              <button
                onClick={handleCloseModal}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error */}
            {modal.error && (
              <div className="mx-4 p-3 bg-red-950/30 border border-red-800 rounded-lg flex gap-2 text-red-200 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {modal.error}
              </div>
            )}

            {/* Content */}
            <div className="px-4 space-y-3">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Descrição</p>
                <p className="font-semibold text-white">{modal.lancamento.descricao}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Valor Informado</p>
                  <p className="font-bold text-[#ff6b00]">{formatarReais(modal.lancamento.valor)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Data</p>
                  <p className="font-semibold text-zinc-300">
                    {new Date(modal.lancamento.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-2">
                  Valor Confirmado (R$) - Deixe em branco para usar o informado
                </label>
                <input
                  type="text"
                  value={modal.valorConfirmado}
                  onChange={(e) =>
                    setModal(prev => ({
                      ...prev,
                      valorConfirmado: e.target.value,
                    }))
                  }
                  placeholder="0,00"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-600 text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 border-t border-zinc-800">
              <button
                onClick={handleCloseModal}
                disabled={modal.isSubmitting}
                className="flex-1 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-bold rounded transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={modal.isSubmitting}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded transition-colors text-sm"
              >
                {modal.isSubmitting ? '⏳ Confirmando...' : '✓ Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
