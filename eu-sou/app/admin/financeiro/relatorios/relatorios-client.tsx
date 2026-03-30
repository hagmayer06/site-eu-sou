'use client'

import { useState } from 'react'
import { gerarRelatorioPDFAction, gerarDeclaracaoAction } from '@/app/admin/financeiro/actions'
import { gerarCSV } from '@/lib/csvGenerator'
import { formatarReais } from '@/lib/financeiroQueries'
import { Download, AlertCircle } from 'lucide-react'
import type { LancamentoRow, CategoriaFinanceiroRow, ConfiguracaoIgrejaRow } from '@/lib/database.types'

interface RelatoriosClientProps {
  lancamentos: LancamentoRow[]
  categorias: CategoriaFinanceiroRow[]
  config: ConfiguracaoIgrejaRow | null
  perfilNome: string
}

type Tab = 'relatorios' | 'declaracao'

export function RelatoriosClient({
  lancamentos,
  categorias,
  config,
  perfilNome,
}: RelatoriosClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('relatorios')

  // Filters para relatórios
  const [dataInicio, setDataInicio] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10)
  )
  const [dataFim, setDataFim] = useState(new Date().toISOString().slice(0, 10))
  const [tipoRelatorio, setTipoRelatorio] = useState<'fluxo' | 'entrada' | 'saida'>('fluxo')

  // Filters para declaração
  const [membroSelecionado, setMembroSelecionado] = useState('')
  const [anoDeclaracao, setAnoDeclaracao] = useState(new Date().getFullYear())
  const [membrosFiltrados, setMembrosFiltrados] = useState<
    Array<{ id: string; nome: string }>
  >([])

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get unique members from lancamentos
  const membros = Array.from(
    new Map(
      lancamentos
        .filter((l) => l.membro_id)
        .map((l) => [
          l.membro_id,
          { id: l.membro_id as string, nome: l.descricao.split(' - ')[1] as string },
        ])
    ).values()
  ).sort((a, b) => a.nome.localeCompare(b.nome))

  const handleMembroSearch = (query: string) => {
    setMembroSelecionado(query)
    if (query.length > 0) {
      const filtered = membros.filter((m) =>
        m.nome.toLowerCase().includes(query.toLowerCase())
      )
      setMembrosFiltrados(filtered)
    } else {
      setMembrosFiltrados([])
    }
  }

  const handleGerarRelatorioPDF = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const tipo = tipoRelatorio === 'fluxo' ? undefined : (tipoRelatorio as 'entrada' | 'saida')
      const pdfBuffer = await gerarRelatorioPDFAction(dataInicio, dataFim, tipo)

      // Converter buffer para blob e download
      const uint8Array = new Uint8Array(pdfBuffer)
      const blob = new Blob([uint8Array], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      const nomeArquivo = `relatorio_${tipoRelatorio}_${dataInicio}_${dataFim}.pdf`
      link.setAttribute('href', url)
      link.setAttribute('download', nomeArquivo)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGerarRelatorioCSV = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const filtrados = lancamentos.filter((l) => {
        const data = new Date(l.data)
        const dentro = data >= new Date(dataInicio) && data <= new Date(dataFim)
        const tipoOk =
          tipoRelatorio === 'fluxo' || l.tipo === tipoRelatorio
        return dentro && tipoOk
      })

      const nomeArquivo = `relatorio_${tipoRelatorio}_${dataInicio}_${dataFim}.csv`
      gerarCSV(filtrados, nomeArquivo)
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar CSV')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGerarDeclaracao = async () => {
    if (!membroSelecionado) {
      setError('Selecione um membro')
      return
    }

    const membro = membros.find((m) =>
      m.nome.toLowerCase().includes(membroSelecionado.toLowerCase())
    )

    if (!membro) {
      setError('Membro não encontrado')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const pdfBuffer = await gerarDeclaracaoAction(membro.id, anoDeclaracao)

      const uint8Array = new Uint8Array(pdfBuffer)
      const blob = new Blob([uint8Array], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      const nomeArquivo = `declaracao_${membro.nome.replace(/\s+/g, '_')}_${anoDeclaracao}.pdf`
      link.setAttribute('href', url)
      link.setAttribute('download', nomeArquivo)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setMembroSelecionado('')
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar declaração')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase">Relatórios e Declarações</h1>
        <p className="text-zinc-500 text-sm mt-1">Gere relatórios financeiros e declarações de contribuição</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('relatorios')}
          className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 -mb-px ${
            activeTab === 'relatorios'
              ? 'text-[#ff6b00] border-[#ff6b00]'
              : 'text-zinc-500 border-transparent hover:text-zinc-400'
          }`}
        >
          📊 Relatórios Financeiros
        </button>
        <button
          onClick={() => setActiveTab('declaracao')}
          className={`px-4 py-3 font-bold text-sm transition-colors border-b-2 -mb-px ${
            activeTab === 'declaracao'
              ? 'text-[#ff6b00] border-[#ff6b00]'
              : 'text-zinc-500 border-transparent hover:text-zinc-400'
          }`}
        >
          📄 Declaração Anual
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-950/30 border border-red-800 rounded-lg flex gap-3 text-red-200 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Relatórios Tab */}
      {activeTab === 'relatorios' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Filtros</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Data Início */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Data Início *
                </label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#ff6b00]"
                />
              </div>

              {/* Data Fim */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Data Fim *
                </label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#ff6b00]"
                />
              </div>

              {/* Tipo de Relatório */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Tipo de Relatório *
                </label>
                <select
                  value={tipoRelatorio}
                  onChange={(e) =>
                    setTipoRelatorio(e.target.value as 'fluxo' | 'entrada' | 'saida')
                  }
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#ff6b00]"
                >
                  <option value="fluxo">Fluxo de Caixa (Todas)</option>
                  <option value="entrada">Apenas Entradas</option>
                  <option value="saida">Apenas Saídas</option>
                </select>
              </div>
            </div>

            {/* Preview dos dados */}
            <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
              <p className="text-xs text-zinc-400 mb-2">Registros encontrados:</p>
              <p className="text-lg font-bold text-[#ff6b00]">
                {lancamentos.filter((l) => {
                  const data = new Date(l.data)
                  const dentro = data >= new Date(dataInicio) && data <= new Date(dataFim)
                  const tipoOk = tipoRelatorio === 'fluxo' || l.tipo === tipoRelatorio
                  return dentro && tipoOk
                }).length} lançamentos
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleGerarRelatorioPDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-[#ff6b00] hover:bg-[#ff6b00]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              <Download size={18} />
              {isGenerating ? 'Gerando PDF...' : 'Gerar PDF'}
            </button>
            <button
              onClick={handleGerarRelatorioCSV}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              <Download size={18} />
              {isGenerating ? 'Gerando CSV...' : 'Gerar CSV'}
            </button>
          </div>
        </div>
      )}

      {/* Declaração Tab */}
      {activeTab === 'declaracao' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Declaração Anual de Contribuição</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Membro */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Membro *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={membroSelecionado}
                    onChange={(e) => handleMembroSearch(e.target.value)}
                    placeholder="Digite o nome do membro..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff6b00]"
                    autoComplete="off"
                  />
                  {membrosFiltrados.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg max-h-40 overflow-y-auto z-10">
                      {membrosFiltrados.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setMembroSelecionado(m.nome)
                            setMembrosFiltrados([])
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
                        >
                          {m.nome}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Ano */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Ano *
                </label>
                <input
                  type="number"
                  value={anoDeclaracao}
                  onChange={(e) => setAnoDeclaracao(parseInt(e.target.value))}
                  min={2020}
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-[#ff6b00]"
                />
              </div>
            </div>

            {/* Resumo das contribuições do membro selecionado (se houver) */}
            {membroSelecionado && (
              <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                <p className="text-xs text-zinc-400 mb-3">
                  Contribuições confirmadas em {anoDeclaracao}:
                </p>
                <div className="space-y-2">
                  {(() => {
                    const membro = membros.find((m) =>
                      m.nome.toLowerCase().includes(membroSelecionado.toLowerCase())
                    )
                    if (!membro) return <p className="text-zinc-500">Membro não encontrado</p>

                    const contribuicoes = lancamentos.filter(
                      (l) =>
                        l.membro_id === membro.id &&
                        l.status === 'confirmado' &&
                        new Date(l.data).getFullYear() === anoDeclaracao
                    )

                    if (contribuicoes.length === 0) {
                      return <p className="text-zinc-500">Nenhuma contribuição confirmada</p>
                    }

                    const total = contribuicoes.reduce((sum, l) => sum + l.valor, 0)
                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Total:</span>
                          <span className="font-bold text-[#ff6b00]">{formatarReais(total)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-500">
                          <span>Registros:</span>
                          <span>{contribuicoes.length}</span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Button */}
          <button
            onClick={handleGerarDeclaracao}
            disabled={isGenerating || !membroSelecionado}
            className="flex items-center gap-2 px-4 py-2 bg-[#ff6b00] hover:bg-[#ff6b00]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            <Download size={18} />
            {isGenerating ? 'Gerando Declaração...' : 'Gerar Declaração PDF'}
          </button>
        </div>
      )}
    </div>
  )
}
