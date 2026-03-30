'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { enviarComprovanteMembro } from '@/app/admin/financeiro/actions'
import { formatarReais } from '@/lib/financeiroQueries'
import { Copy, CheckCircle2, Clock, AlertCircle, Upload } from 'lucide-react'
import type { ConfiguracaoIgrejaRow, LancamentoRow } from '@/lib/database.types'

type Tab = 'enviar' | 'historico'

interface ContribuirClientProps {
  config: ConfiguracaoIgrejaRow | null
  historico: LancamentoRow[]
  perfilNome: string
}

export function ContribuirClient({ config, historico, perfilNome }: ContribuirClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('enviar')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCopyPix = () => {
    if (config?.chave_pix) {
      navigator.clipboard.writeText(config.chave_pix)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData(e.currentTarget)
      await enviarComprovanteMembro(formData)
      setSuccess('✓ Comprovante enviado com sucesso! Aguarde confirmação do tesoureiro.')
      // Limpar form
      if (e.currentTarget) e.currentTarget.reset()
      // Recarregar em 2 segundos
      setTimeout(() => {
        router.refresh()
        setSuccess(null)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar comprovante')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-black uppercase">Contribuir</h1>

      {/* Pix Key Display */}
      <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 border border-emerald-800 rounded-2xl p-6">
        <p className="text-sm text-emerald-200 mb-2">Chave PIX</p>
        <div className="flex items-center gap-3 bg-emerald-900/50 p-4 rounded-lg mb-3 border border-emerald-700">
          <code className="flex-1 text-emerald-200 font-mono text-sm md:text-base break-all">
            {config?.chave_pix || 'Não configurado'}
          </code>
          <button
            onClick={handleCopyPix}
            type="button"
            className="shrink-0 p-2 hover:bg-emerald-800 rounded transition-colors text-emerald-200"
            title="Copiar chave PIX"
          >
            {copied ? (
              <CheckCircle2 size={20} className="text-green-400" />
            ) : (
              <Copy size={20} />
            )}
          </button>
        </div>
        <p className="text-xs text-emerald-300">
          {config?.nome_igreja || 'Igreja Eu Sou'} • CNPJ: {config?.cnpj || '—'}
        </p>
        <p className="text-xs text-emerald-400 mt-3 font-semibold">
          ✓ Copie a chave → Faça a transferência → Envie o comprovante abaixo
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('enviar')}
          className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 -mb-px ${
            activeTab === 'enviar'
              ? 'text-[#ff6b00] border-[#ff6b00]'
              : 'text-zinc-500 border-transparent hover:text-zinc-400'
          }`}
        >
          📤 Enviar Comprovante
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 -mb-px ${
            activeTab === 'historico'
              ? 'text-[#ff6b00] border-[#ff6b00]'
              : 'text-zinc-500 border-transparent hover:text-zinc-400'
          }`}
        >
          📋 Histórico ({historico.filter(h => h.comprovante_url).length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'enviar' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-950/30 border border-red-800 rounded-lg flex gap-3 text-red-200 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-950/30 border border-emerald-800 rounded-lg flex gap-3 text-emerald-200 text-sm">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <div>{success}</div>
            </div>
          )}

          {/* Tipo de Contribuição */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Tipo de Contribuição *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['dízimo', 'oferta'].map((tipo) => (
                <label
                  key={tipo}
                  className="flex items-center gap-3 p-3 border border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors has-[:checked]:border-[#ff6b00] has-[:checked]:bg-[#ff6b00]/5"
                >
                  <input
                    type="radio"
                    name="tipo"
                    value={tipo}
                    className="w-4 h-4"
                    required
                  />
                  <span className="font-semibold capitalize text-white">{tipo}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Valor (R$) *
            </label>
            <input
              type="text"
              name="valor"
              placeholder="0,00"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff6b00]"
              required
            />
            <p className="text-xs text-zinc-500 mt-1">Digite sem R$ ou separador de milhares</p>
          </div>

          {/* Comprovante Upload */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Comprovante (Imagem ou PDF) *
            </label>
            <div className="relative">
              <input
                type="file"
                name="comprovante"
                accept="image/*,.pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center hover:border-[#ff6b00]/50 transition-colors bg-zinc-800/30">
                <Upload className="mx-auto mb-2 text-zinc-500" size={32} />
                <p className="font-semibold text-white">Clique para selecionar</p>
                <p className="text-xs text-zinc-500 mt-1">Máx. 10MB • PNG, JPG, PDF</p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#ff6b00] hover:bg-[#ff6b00]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            {isSubmitting ? '⏳ Enviando...' : '✓ Enviar Comprovante'}
          </button>
        </form>
      )}

      {activeTab === 'historico' && (
        <div className="space-y-4">
          {historico.filter(h => h.comprovante_url).length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <Clock size={48} className="mx-auto mb-3 opacity-50" />
              <p className="font-semibold">Nenhuma contribuição enviada ainda</p>
              <p className="text-xs mt-2">Use a aba "Enviar Comprovante" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historico
                .filter(h => h.comprovante_url)
                .map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold capitalize text-white">
                      {item.descricao.includes('dízimo') ? 'Dízimo' : 'Oferta'}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.status === 'pendente' ? (
                        <>
                          <Clock size={16} className="text-yellow-500" />
                          <span className="text-xs font-semibold text-yellow-500">Pendente</span>
                        </>
                      ) : item.status === 'confirmado' ? (
                        <>
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-500">Confirmado</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} className="text-zinc-500" />
                          <span className="text-xs font-semibold text-zinc-500">{item.status}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">
                      {new Date(item.data).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="font-bold text-[#ff6b00]">{formatarReais(item.valor)}</span>
                  </div>
                </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
