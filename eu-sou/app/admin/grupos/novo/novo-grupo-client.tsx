'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import GrupoForm from '@/components/admin-fomularios/GrupoForm'
import { criarGrupoAction } from '../actions'

export default function NovoGrupoClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await criarGrupoAction(formData)
      if (result.ok) {
        router.push('/admin/grupos')
      } else {
        setError('Erro ao criar grupo')
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(mensagem)
      console.error('Erro ao criar grupo:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
          Criar Novo <span className="text-[#ff6b00]">Grupo</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-2">
          Preencha os dados para criar um novo grupo familiar.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      <GrupoForm onSubmit={handleSubmit} isLoading={isLoading} />

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#ff6b00]" />
            <p className="text-white font-semibold uppercase tracking-wider">
              Criando grupo...
            </p>
            <p className="text-zinc-500 text-xs text-center max-w-xs">
              Estamos geocodificando o endereço e fazendo upload da imagem.
              Isso pode levar alguns segundos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
