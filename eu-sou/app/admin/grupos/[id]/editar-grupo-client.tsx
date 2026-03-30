'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import GrupoForm from '@/components/admin-fomularios/GrupoForm'
import { atualizarGrupoAction } from '../actions'
import { Database } from '@/lib/database.types'

type GrupoRow = Database['public']['Tables']['grupos']['Row']

interface EditarGrupoClientProps {
  grupo: GrupoRow
}

export default function EditarGrupoClient({ grupo }: EditarGrupoClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await atualizarGrupoAction(formData)
      if (result.ok) {
        router.push('/admin/grupos')
      } else {
        setError('Erro ao atualizar grupo')
      }
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(mensagem)
      console.error('Erro ao atualizar grupo:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
          Editar <span className="text-[#ff6b00]">{grupo.nome}</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-2">
          Atualize os dados do grupo familiar.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      <GrupoForm onSubmit={handleSubmit} isLoading={isLoading} grupo={grupo} />

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#ff6b00]" />
            <p className="text-white font-semibold uppercase tracking-wider">
              Atualizando grupo...
            </p>
            <p className="text-zinc-500 text-xs text-center max-w-xs">
              Processando os dados. Isso pode levar alguns segundos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
